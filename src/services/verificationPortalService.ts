import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { PassportActivityEvent, PassportSectionKey, PassportSectionStatus } from '@/types/passport';
import type {
  CustomerInformationRequest,
  DecisionInput,
  FraudFlag,
  FraudFlagType,
  ReviewerActivity,
  VerificationCase,
  VerificationCaseDetail,
  VerificationChecklistItem,
  VerificationDashboardMetrics,
  VerificationDecision,
  VerificationDecisionType,
  VerificationNote,
  VerificationPriority,
  VerificationQueueFilters,
  VerificationType,
} from '@/types/verificationPortal';

const decisionToSectionStatus: Record<VerificationDecisionType, PassportSectionStatus> = {
  approve: 'verified',
  reject: 'needs_more_information',
  needs_more_information: 'needs_more_information',
  escalate: 'under_review',
  fraud_review: 'under_review',
};

export async function getVerificationDashboard(): Promise<VerificationDashboardMetrics> {
  const cases = await listVerificationCases({ search: '', verificationType: 'all', status: 'all', priority: 'all' });
  return {
    todaysQueue: cases.length,
    awaitingReview: cases.filter((item) => item.status === 'awaiting_review' || item.status === 'in_review').length,
    awaitingCustomerResponse: cases.filter((item) => item.status === 'awaiting_customer_response').length,
    urgentCases: cases.filter((item) => item.priority === 'urgent').length,
    fraudReview: cases.filter((item) => item.status === 'fraud_review' || item.verification_type === 'fraud').length,
    completedToday: cases.filter((item) => item.status === 'approved' || item.status === 'rejected').length,
  };
}

export async function listVerificationCases(filters: VerificationQueueFilters): Promise<VerificationCase[]> {
  if (!supabase) return filterCases(createDemoCases(), filters);

  let query = supabase.from('verification_cases').select('*').order('submitted_at', { ascending: true });
  if (filters.verificationType !== 'all') query = query.eq('verification_type', filters.verificationType);
  if (filters.status !== 'all') query = query.eq('status', filters.status);
  if (filters.priority !== 'all') query = query.eq('priority', filters.priority);
  const { data, error } = await query;
  if (error) throw error;
  return filterCases((data ?? []) as VerificationCase[], filters);
}

export async function getVerificationCaseDetail(caseId: string): Promise<VerificationCaseDetail> {
  if (!supabase) return createDemoDetail(caseId);

  const [caseRow, checklist, notes, decisions, flags, requests, activity] = await Promise.all([
    supabase.from('verification_cases').select('*').eq('id', caseId).single(),
    supabase.from('verification_checklists').select('*').eq('verification_case_id', caseId).order('created_at', { ascending: true }),
    supabase.from('verification_notes').select('*').eq('verification_case_id', caseId).order('created_at', { ascending: false }),
    supabase.from('verification_decisions').select('*').eq('verification_case_id', caseId).order('created_at', { ascending: false }),
    supabase.from('fraud_flags').select('*').eq('verification_case_id', caseId).order('created_at', { ascending: false }),
    supabase.from('customer_information_requests').select('*').eq('verification_case_id', caseId).order('created_at', { ascending: false }),
    supabase.from('reviewer_activity').select('*').eq('verification_case_id', caseId).order('created_at', { ascending: false }),
  ]);

  if (caseRow.error) throw caseRow.error;
  if (checklist.error) throw checklist.error;
  if (notes.error) throw notes.error;
  if (decisions.error) throw decisions.error;
  if (flags.error) throw flags.error;
  if (requests.error) throw requests.error;
  if (activity.error) throw activity.error;

  return {
    case: caseRow.data as VerificationCase,
    checklist: (checklist.data ?? []) as VerificationChecklistItem[],
    notes: (notes.data ?? []) as VerificationNote[],
    decisions: (decisions.data ?? []) as VerificationDecision[],
    fraudFlags: (flags.data ?? []) as FraudFlag[],
    informationRequests: (requests.data ?? []) as CustomerInformationRequest[],
    activity: (activity.data ?? []) as ReviewerActivity[],
  };
}

export async function createVerificationCase(user: User, sectionKey: PassportSectionKey, verificationType: VerificationType): Promise<VerificationCase> {
  const now = new Date().toISOString();
  if (!supabase) return createDemoCases()[0];

  const { data, error } = await supabase
    .from('verification_cases')
    .insert({
      passport_id: '00000000-0000-0000-0000-000000000000',
      passport_version_id: '00000000-0000-0000-0000-000000000000',
      applicant_user_id: user.id,
      applicant_name: user.email ?? 'Applicant',
      passport_number: 'Pending',
      section_key: sectionKey,
      verification_type: verificationType,
      submitted_at: now,
      status: 'awaiting_review',
      priority: 'normal',
    })
    .select()
    .single();
  if (error) throw error;
  await recordReviewerActivity(String(data.id), user.id, 'case_created', 'Verification case created.');
  return data as VerificationCase;
}

export async function assignCase(caseId: string, reviewer: User, reviewerName: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('verification_cases')
    .update({ assigned_reviewer_id: reviewer.id, assigned_reviewer_name: reviewerName, status: 'in_review' })
    .eq('id', caseId);
  if (error) throw error;
  await supabase.from('verification_assignments').insert({ verification_case_id: caseId, assigned_to_user_id: reviewer.id, assigned_by_user_id: reviewer.id });
  await recordReviewerActivity(caseId, reviewer.id, 'assignment_changed', `Case assigned to ${reviewerName}.`);
}

export async function updateCasePriority(caseId: string, user: User, priority: VerificationPriority): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('verification_cases').update({ priority }).eq('id', caseId);
  if (error) throw error;
  await recordReviewerActivity(caseId, user.id, 'priority_changed', `Priority changed to ${priority}.`);
}

export async function setChecklistItem(caseId: string, itemId: string, user: User, checked: boolean): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('verification_checklists').update({ checked }).eq('id', itemId);
  if (error) throw error;
  await recordReviewerActivity(caseId, user.id, 'checklist_updated', checked ? 'Checklist item completed.' : 'Checklist item reopened.');
}

export async function addVerificationNote(caseId: string, user: User, authorName: string, body: string): Promise<void> {
  if (!body.trim()) throw new Error('Internal note is required.');
  if (!supabase) return;
  const { error } = await supabase.from('verification_notes').insert({
    verification_case_id: caseId,
    author_user_id: user.id,
    author_name: authorName,
    body: body.trim(),
  });
  if (error) throw error;
  await recordReviewerActivity(caseId, user.id, 'note_added', 'Internal note added.');
}

export async function addFraudFlag(caseId: string, user: User, flagType: FraudFlagType, description: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('fraud_flags').insert({
    verification_case_id: caseId,
    flag_type: flagType,
    description: description.trim() || 'Fraud review flag created.',
    status: 'open',
  });
  if (error) throw error;
  await recordReviewerActivity(caseId, user.id, 'fraud_flagged', `Fraud flag created: ${flagType}.`);
}

export async function requestInformation(caseId: string, user: User, requestedItem: string, message: string): Promise<void> {
  if (!requestedItem.trim() || !message.trim()) throw new Error('Requested item and message are required.');
  if (!supabase) return;
  const { data: caseRow, error: caseError } = await supabase.from('verification_cases').select('*').eq('id', caseId).single();
  if (caseError) throw caseError;

  const { error } = await supabase.from('customer_information_requests').insert({
    verification_case_id: caseId,
    requested_item: requestedItem.trim(),
    message: message.trim(),
    status: 'open',
    created_by_user_id: user.id,
  });
  if (error) throw error;

  await supabase.from('verification_cases').update({ status: 'awaiting_customer_response' }).eq('id', caseId);
  await updatePassportSection(caseRow as VerificationCase, 'needs_more_information');
  await recordPassportActivity((caseRow as VerificationCase).passport_id, user.id, 'verification_information_requested', `${sectionLabel((caseRow as VerificationCase).section_key)} needs more information.`);
  await recordReviewerActivity(caseId, user.id, 'customer_request_created', `Requested ${requestedItem}.`);
}

export async function submitVerificationDecision(caseId: string, user: User, decisionInput: DecisionInput): Promise<void> {
  if (!decisionInput.reason.trim()) throw new Error('Decision reasoning is required.');
  if (!supabase) return;

  const { data: caseRow, error: caseError } = await supabase.from('verification_cases').select('*').eq('id', caseId).single();
  if (caseError) throw caseError;
  const verificationCase = caseRow as VerificationCase;
  const nextSectionStatus = decisionToSectionStatus[decisionInput.decision];
  const nextCaseStatus = decisionToCaseStatus(decisionInput.decision);

  const decision = await supabase.from('verification_decisions').insert({
    verification_case_id: caseId,
    reviewer_user_id: user.id,
    decision: decisionInput.decision,
    reason: decisionInput.reason.trim(),
  });
  if (decision.error) throw decision.error;

  await supabase.from('verification_cases').update({ status: nextCaseStatus }).eq('id', caseId);
  await updatePassportSection(verificationCase, nextSectionStatus);
  await recordPassportActivity(verificationCase.passport_id, user.id, decisionToActivity(decisionInput.decision), decisionDescription(verificationCase.section_key, decisionInput.decision));
  await recordAudit(user.id, verificationCase, decisionInput.decision, decisionInput.reason);
  await recordReviewerActivity(caseId, user.id, 'decision_made', `Decision recorded: ${decisionInput.decision}.`);
}

async function updatePassportSection(verificationCase: VerificationCase, status: PassportSectionStatus) {
  if (!supabase) return;
  await supabase
    .from('passport_section_statuses')
    .update({
      status,
      progress: statusToProgress(status),
      verification_state: status === 'verified' ? 'verified' : status === 'needs_more_information' ? 'pending_review' : 'pending_review',
      last_updated_at: new Date().toISOString(),
    })
    .eq('passport_id', verificationCase.passport_id)
    .eq('passport_version_id', verificationCase.passport_version_id)
    .eq('section_key', verificationCase.section_key);
}

async function recordPassportActivity(passportId: string, actorUserId: string | null, eventType: PassportActivityEvent, description: string) {
  if (!supabase) return;
  await supabase.from('passport_activity_logs').insert({
    passport_id: passportId,
    actor_user_id: actorUserId,
    event_type: eventType,
    description,
    visibility: 'tenant',
  });
}

async function recordAudit(actorUserId: string, verificationCase: VerificationCase, decision: VerificationDecisionType, reason: string) {
  if (!supabase) return;
  await supabase.from('audit_logs').insert({
    actor_user_id: actorUserId,
    target_user_id: verificationCase.applicant_user_id,
    event_type: `verification.${decision}`,
    resource_type: 'verification_case',
    resource_id: verificationCase.id,
    visibility: 'internal',
    metadata: { section_key: verificationCase.section_key, reason },
  });
}

async function recordReviewerActivity(caseId: string, actorUserId: string | null, eventType: string, description: string) {
  if (!supabase) return;
  await supabase.from('reviewer_activity').insert({
    verification_case_id: caseId,
    actor_user_id: actorUserId,
    event_type: eventType,
    description,
  });
}

function filterCases(cases: VerificationCase[], filters: VerificationQueueFilters) {
  return cases.filter((item) => {
    const matchesSearch = !filters.search || `${item.applicant_name} ${item.passport_number} ${item.section_key}`.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.verificationType === 'all' || item.verification_type === filters.verificationType;
    const matchesStatus = filters.status === 'all' || item.status === filters.status;
    const matchesPriority = filters.priority === 'all' || item.priority === filters.priority;
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });
}

function decisionToCaseStatus(decision: VerificationDecisionType) {
  if (decision === 'approve') return 'approved';
  if (decision === 'reject') return 'rejected';
  if (decision === 'needs_more_information') return 'awaiting_customer_response';
  if (decision === 'fraud_review') return 'fraud_review';
  return 'escalated';
}

function decisionToActivity(decision: VerificationDecisionType): PassportActivityEvent {
  if (decision === 'approve') return 'verification_section_approved';
  if (decision === 'reject') return 'verification_section_rejected';
  if (decision === 'needs_more_information') return 'verification_information_requested';
  if (decision === 'fraud_review') return 'verification_fraud_review';
  return 'verification_section_escalated';
}

function decisionDescription(sectionKey: PassportSectionKey, decision: VerificationDecisionType) {
  return `${sectionLabel(sectionKey)} verification decision recorded: ${decision}.`;
}

function statusToProgress(status: PassportSectionStatus) {
  const map: Record<PassportSectionStatus, number> = {
    not_started: 0,
    in_progress: 50,
    ready_for_review: 80,
    under_review: 85,
    verified: 100,
    needs_more_information: 65,
    needs_reverification: 75,
    expired: 50,
  };
  return map[status];
}

function sectionLabel(sectionKey: PassportSectionKey) {
  const labels: Record<PassportSectionKey, string> = {
    rental_history: 'Rental History',
    employment: 'Employment',
    references: 'References',
    credit_report: 'Credit Report',
    identity_confirmation: 'Identity',
  };
  return labels[sectionKey];
}

function createDemoCases(): VerificationCase[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'demo-identity-case',
      passport_id: 'demo-passport',
      passport_version_id: 'demo-version-1',
      applicant_user_id: 'demo-applicant',
      applicant_name: 'Kathryn',
      passport_number: 'RP-7F8A-C3D2',
      section_key: 'identity_confirmation',
      verification_type: 'identity',
      status: 'awaiting_review',
      priority: 'urgent',
      assigned_reviewer_id: null,
      assigned_reviewer_name: null,
      submitted_at: now,
      updated_at: now,
    },
    {
      id: 'demo-employment-case',
      passport_id: 'demo-passport',
      passport_version_id: 'demo-version-1',
      applicant_user_id: 'demo-applicant',
      applicant_name: 'Kathryn',
      passport_number: 'RP-7F8A-C3D2',
      section_key: 'employment',
      verification_type: 'employment',
      status: 'in_review',
      priority: 'normal',
      assigned_reviewer_id: 'demo-reviewer',
      assigned_reviewer_name: 'Reviewer',
      submitted_at: now,
      updated_at: now,
    },
  ];
}

function createDemoDetail(caseId: string): VerificationCaseDetail {
  const selected = createDemoCases().find((item) => item.id === caseId) ?? createDemoCases()[0];
  const now = new Date().toISOString();
  return {
    case: selected,
    checklist: checklistFor(selected.section_key).map((label, index) => ({
      id: `demo-check-${index}`,
      verification_case_id: selected.id,
      label,
      checked: index < 2,
      required: true,
      created_at: now,
    })),
    notes: [{ id: 'demo-note', verification_case_id: selected.id, author_user_id: 'demo-reviewer', author_name: 'Reviewer', body: 'Internal note placeholder. Never visible to tenant or landlord.', created_at: now }],
    decisions: [],
    fraudFlags: [],
    informationRequests: [],
    activity: [{ id: 'demo-activity', verification_case_id: selected.id, actor_user_id: 'demo-reviewer', event_type: 'case_opened', description: 'Reviewer opened case.', created_at: now }],
  };
}

function checklistFor(sectionKey: PassportSectionKey) {
  const map: Record<PassportSectionKey, string[]> = {
    identity_confirmation: ['Name matches', 'DOB matches', 'Photo appears consistent', 'ID not expired', 'Document legible', 'No obvious alterations'],
    employment: ['Employer information complete', 'Company appears legitimate', 'Pay stub reviewed', 'Employment letter reviewed', 'Optional bank proof reviewed', 'Internal confidence notes added'],
    rental_history: ['Lease reviewed', 'Address consistent', 'Dates consistent', 'Landlord information plausible', 'Supporting documents reviewed'],
    references: ['Information complete', 'Consent present', 'Reference appears legitimate'],
    credit_report: ['Applicant matches report', 'Report date acceptable', 'Provider verified', 'No obvious tampering'],
  };
  return map[sectionKey];
}
