import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import {
  getOrCreatePassportSummary,
  updatePassportSectionStatus,
} from '@/services/passportService';
import type { PassportActivityEvent, PassportSectionKey } from '@/types/passport';
import type { VerificationType } from '@/types/verificationPortal';
import type {
  ConsentCaptureInput,
  EvidenceDocument,
  EvidenceDocumentType,
  GuidedOnboardingSummary,
  LandlordRequestInput,
  ManualCreditWorkflowStatus,
  OnboardingStageDefinition,
  OnboardingStageKey,
  OnboardingStageProgress,
  OutreachInvitationInput,
} from '@/types/phaseA';

const onboardingDraftKey = (userId: string) => `rental-passport:phase-a:onboarding:${userId}`;

export const onboardingStages: OnboardingStageDefinition[] = [
  {
    key: 'account_contact',
    title: 'Account and contact confirmation',
    description: 'Confirm account access, email status, phone status, language, and timezone.',
    sectionKey: null,
    route: '/profile',
    required: true,
    consentPurposes: ['storage_processing'],
    requiredItems: ['Confirmed email', 'Phone entered', 'Region selected'],
  },
  {
    key: 'applicant_household',
    title: 'Applicant and household information',
    description: 'Capture the people who will be included on the application.',
    sectionKey: null,
    route: '/passport/onboarding',
    required: true,
    consentPurposes: ['verified_summary_sharing'],
    requiredItems: ['Legal applicant details', 'Household count', 'Move-in preferences'],
  },
  {
    key: 'identity',
    title: 'Identity',
    description: 'Upload identity evidence for manual review or future provider review.',
    sectionKey: 'identity_confirmation',
    route: '/passport/identity',
    required: true,
    consentPurposes: ['identity_review', 'storage_processing'],
    requiredItems: ['Government ID front', 'Government ID back', 'Selfie'],
  },
  {
    key: 'employment_income',
    title: 'Employment and income',
    description: 'Add employment facts, income evidence, and employer contact consent.',
    sectionKey: 'employment',
    route: '/passport/employment',
    required: true,
    consentPurposes: ['employer_contact', 'income_document_review'],
    requiredItems: ['Employer details', 'Income evidence', 'Employer contact'],
  },
  {
    key: 'rental_history',
    title: 'Rental history',
    description: 'Add prior tenancies, supporting documents, and landlord contacts.',
    sectionKey: 'rental_history',
    route: '/passport/rental-history',
    required: true,
    consentPurposes: ['previous_landlord_contact'],
    requiredItems: ['Prior address', 'Landlord/property manager contact', 'Lease or ledger'],
  },
  {
    key: 'references',
    title: 'References',
    description: 'Invite references through secure, expiring response links.',
    sectionKey: 'references',
    route: '/passport/references',
    required: true,
    consentPurposes: ['reference_contact'],
    requiredItems: ['Reference contact', 'Relationship', 'Invitation consent'],
  },
  {
    key: 'credit',
    title: 'Credit',
    description: 'Authorize a manual credit work item without claiming direct bureau integration.',
    sectionKey: 'credit_report',
    route: '/passport/credit-report',
    required: true,
    consentPurposes: ['credit_authorization'],
    requiredItems: ['Credit authorization', 'Payment state', 'Manual operations queue item'],
  },
  {
    key: 'supporting_documents',
    title: 'Supporting documents',
    description: 'Upload optional evidence that can help reviewers resolve inconsistencies.',
    sectionKey: null,
    route: '/passport/onboarding',
    required: false,
    consentPurposes: ['storage_processing', 'landlord_document_viewing'],
    requiredItems: ['Optional supporting documents reviewed'],
  },
  {
    key: 'consent_declarations',
    title: 'Consent and declarations',
    description: 'Review versioned consents before submission for verification.',
    sectionKey: null,
    route: '/passport/onboarding',
    required: true,
    consentPurposes: [
      'identity_review',
      'employer_contact',
      'income_document_review',
      'previous_landlord_contact',
      'reference_contact',
      'credit_authorization',
      'storage_processing',
      'verified_summary_sharing',
    ],
    requiredItems: ['All required consent purposes recorded'],
  },
  {
    key: 'review_verification_choice',
    title: 'Review and verification choice',
    description: 'Confirm completeness and submit manual verification cases.',
    sectionKey: null,
    route: '/passport/onboarding',
    required: true,
    consentPurposes: ['verified_summary_sharing'],
    requiredItems: ['Review completed', 'Verification option selected'],
  },
];

export async function getGuidedOnboardingSummary(user: User): Promise<GuidedOnboardingSummary> {
  const passportSummary = await getOrCreatePassportSummary(user);
  const passportId = passportSummary.passport.id;
  const passportVersionId = passportSummary.draftVersion.id;
  const progress = await getOrCreateStageProgress(user, passportId, passportVersionId);
  const stages = onboardingStages.map((stage) => ({
    ...stage,
    progressRecord: progress.find((item) => item.stage_key === stage.key) ?? createDefaultStage(stage),
  }));
  const requiredStages = stages.filter((stage) => stage.required);
  const requiredComplete = requiredStages.filter((stage) => stage.progressRecord.status === 'complete').length;
  const overallProgress = Math.round(
    stages.reduce((total, stage) => total + stage.progressRecord.progress, 0) / stages.length,
  );

  return {
    passportId,
    passportVersionId,
    stages,
    overallProgress,
    requiredComplete,
    requiredTotal: requiredStages.length,
    nextStage: stages.find((stage) => stage.required && stage.progressRecord.status !== 'complete') ?? stages[stages.length - 1],
  };
}

export async function autosaveOnboardingStage(
  user: User,
  stageKey: OnboardingStageKey,
  draft: Record<string, unknown>,
  progress: number,
): Promise<GuidedOnboardingSummary> {
  const summary = await getOrCreatePassportSummary(user);
  const stage = onboardingStages.find((item) => item.key === stageKey);
  if (!stage) throw new Error('Unknown onboarding stage.');
  const status: OnboardingStageProgress['status'] =
    progress >= 100 ? 'complete' : progress > 0 ? 'incomplete' : 'missing';
  const missingItems = status === 'complete' ? [] : stage.requiredItems;
  const now = new Date().toISOString();

  if (!supabase) {
    const current = readDemoProgress(user.id);
    const next = current.map((item) =>
      item.stage_key === stageKey
        ? { ...item, draft, progress, status, missing_items: missingItems, completed_at: status === 'complete' ? now : null, last_autosaved_at: now }
        : item,
    );
    writeDemoProgress(user.id, next);
    return getGuidedOnboardingSummary(user);
  }

  const { error } = await supabase.from('onboarding_stage_progress').upsert(
    {
      user_id: user.id,
      passport_id: summary.passport.id,
      passport_version_id: summary.draftVersion.id,
      stage_key: stageKey,
      section_key: stage.sectionKey,
      status,
      required: stage.required,
      progress,
      missing_items: missingItems,
      draft,
      completed_at: status === 'complete' ? now : null,
      last_autosaved_at: now,
    },
    { onConflict: 'passport_version_id,stage_key' },
  );
  if (error) throw error;
  await recordActivity(summary.passport.id, user.id, 'section_updated', `${stage.title} autosaved.`);
  return getGuidedOnboardingSummary(user);
}

export async function captureConsent(user: User, input: ConsentCaptureInput): Promise<void> {
  const summary = await getOrCreatePassportSummary(user);
  if (!supabase) {
    await recordActivity(summary.passport.id, user.id, 'consent_recorded', `Consent recorded: ${input.purpose}.`);
    return;
  }

  const { error } = await supabase.from('consent_records').insert({
    user_id: user.id,
    passport_id: summary.passport.id,
    passport_version_id: summary.draftVersion.id,
    consent_type: input.purpose,
    purpose: input.purpose,
    consent_text_version: input.consentTextVersion,
    consent_text_snapshot: input.consentTextSnapshot,
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? window.navigator.userAgent,
    device_metadata: input.deviceMetadata ?? {},
  });
  if (error) throw error;
  await recordActivity(summary.passport.id, user.id, 'consent_recorded', `Consent recorded: ${input.purpose}.`);
  await recordAudit(user.id, user.id, 'consent.recorded', 'consent_record', summary.passport.id, {
    purpose: input.purpose,
    version: input.consentTextVersion,
  });
}

export async function uploadEvidenceDocument(
  user: User,
  sectionKey: PassportSectionKey,
  documentType: EvidenceDocumentType,
  file: File,
): Promise<EvidenceDocument> {
  const summary = await getOrCreatePassportSummary(user);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-');
  const storagePath = `${user.id}/${summary.passport.id}/${summary.draftVersion.id}/${sectionKey}/${Date.now()}-${safeName}`;
  const bucket = evidenceBucketFor(documentType);

  if (!supabase) {
    const demoDocument: EvidenceDocument = {
      id: crypto.randomUUID(),
      owner_user_id: user.id,
      passport_id: summary.passport.id,
      passport_version_id: summary.draftVersion.id,
      section_key: sectionKey,
      document_type: documentType,
      storage_bucket: bucket,
      storage_path: storagePath,
      original_filename: file.name,
      content_type: file.type,
      size_bytes: file.size,
      sensitivity: documentType === 'supporting_document' ? 'medium' : 'high',
      status: 'uploaded',
      landlord_visible: false,
      download_allowed: false,
      created_at: new Date().toISOString(),
    };
    await recordActivity(summary.passport.id, user.id, 'document_uploaded', `${documentType} uploaded.`);
    return demoDocument;
  }

  const uploaded = await supabase.storage.from(bucket).upload(storagePath, file, { upsert: false });
  if (uploaded.error) throw uploaded.error;

  const { data, error } = await supabase
    .from('evidence_documents')
    .insert({
      owner_user_id: user.id,
      passport_id: summary.passport.id,
      passport_version_id: summary.draftVersion.id,
      section_key: sectionKey,
      document_type: documentType,
      storage_bucket: bucket,
      storage_path: storagePath,
      original_filename: file.name,
      content_type: file.type || null,
      size_bytes: file.size,
      sensitivity: documentType === 'supporting_document' ? 'medium' : 'high',
      status: 'uploaded',
    })
    .select()
    .single();
  if (error) throw error;

  await updatePassportSectionStatus(user, sectionKey, 'in_progress');
  await recordActivity(summary.passport.id, user.id, 'document_uploaded', `${documentType} uploaded.`);
  await recordAudit(user.id, user.id, 'evidence.uploaded', 'evidence_document', String(data.id), {
    sectionKey,
    documentType,
  });
  return data as EvidenceDocument;
}

export async function createOutreachInvitation(user: User, input: OutreachInvitationInput): Promise<void> {
  const summary = await getOrCreatePassportSummary(user);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
  const tokenHash = await hashToken(`${input.recipientEmail}:${summary.passport.id}:${Date.now()}`);

  if (!supabase) {
    await recordActivity(summary.passport.id, user.id, 'outreach_invitation_sent', `${input.outreachType} invitation prepared.`);
    return;
  }

  const { error } = await supabase.from('verification_outreach').insert({
    passport_id: summary.passport.id,
    passport_version_id: summary.draftVersion.id,
    verification_case_id: input.verificationCaseId ?? null,
    applicant_user_id: user.id,
    section_key: input.sectionKey,
    outreach_type: input.outreachType,
    recipient_name: input.recipientName.trim(),
    recipient_email: input.recipientEmail.trim().toLowerCase(),
    recipient_organization: input.recipientOrganization?.trim() || null,
    response_token_hash: tokenHash,
    status: 'sent',
    sent_at: new Date().toISOString(),
    expires_at: expiresAt,
    company_domain: input.companyDomain?.trim() || null,
    company_website: input.companyWebsite?.trim() || null,
  });
  if (error) throw error;
  await recordActivity(summary.passport.id, user.id, 'outreach_invitation_sent', `${input.outreachType} invitation sent.`);
  await recordAudit(user.id, user.id, 'outreach.invitation_sent', 'passport', summary.passport.id, {
    outreachType: input.outreachType,
    sectionKey: input.sectionKey,
  });
}

export async function createManualCreditOperation(
  user: User,
  status: ManualCreditWorkflowStatus = 'authorized',
): Promise<void> {
  const summary = await getOrCreatePassportSummary(user);
  if (!supabase) {
    await recordActivity(summary.passport.id, user.id, 'credit_provider_work_item_created', 'Manual credit work item created.');
    return;
  }

  const { error } = await supabase.from('manual_credit_operations').insert({
    passport_id: summary.passport.id,
    passport_version_id: summary.draftVersion.id,
    applicant_user_id: user.id,
    status,
  });
  if (error) throw error;
  await updatePassportSectionStatus(user, 'credit_report', 'under_review');
  await recordActivity(summary.passport.id, user.id, 'credit_provider_work_item_created', 'Manual credit work item created.');
  await recordAudit(user.id, user.id, 'credit.manual_work_item_created', 'passport', summary.passport.id, { status });
}

export async function submitPassportForManualVerification(user: User): Promise<void> {
  const summary = await getOrCreatePassportSummary(user);
  const sectionStages = onboardingStages.filter((stage) => stage.sectionKey);
  const now = new Date().toISOString();

  if (!supabase) {
    await recordActivity(summary.passport.id, user.id, 'verification_case_created', 'Manual verification cases created.');
    return;
  }

  for (const stage of sectionStages) {
    if (!stage.sectionKey) continue;
    const verificationType = verificationTypeForSection(stage.sectionKey);
    const existing = await supabase
      .from('verification_cases')
      .select('id')
      .eq('passport_id', summary.passport.id)
      .eq('passport_version_id', summary.draftVersion.id)
      .eq('section_key', stage.sectionKey)
      .eq('verification_type', verificationType)
      .maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) continue;

    const created = await supabase
      .from('verification_cases')
      .insert({
        passport_id: summary.passport.id,
        passport_version_id: summary.draftVersion.id,
        applicant_user_id: user.id,
        applicant_name: user.email ?? 'Applicant',
        passport_number: summary.passport.passport_number,
        section_key: stage.sectionKey,
        verification_type: verificationType,
        submitted_at: now,
        status: 'awaiting_review',
        priority: verificationType === 'credit' ? 'high' : 'normal',
      })
      .select('id')
      .single();
    if (created.error) throw created.error;

    const checklist = checklistForSection(stage.sectionKey).map((label) => ({
      verification_case_id: String(created.data.id),
      label,
      required: true,
      checked: false,
    }));
    const checklistInsert = await supabase.from('verification_checklists').insert(checklist);
    if (checklistInsert.error) throw checklistInsert.error;

    await updatePassportSectionStatus(user, stage.sectionKey, 'under_review');
    await recordActivity(summary.passport.id, user.id, 'verification_case_created', `${stage.title} review case created.`);
  }

  await recordAudit(user.id, user.id, 'passport.submitted_for_manual_verification', 'passport', summary.passport.id, {
    passportVersionId: summary.draftVersion.id,
  });
}

export async function createLandlordInformationRequest(user: User, input: LandlordRequestInput): Promise<void> {
  if (!supabase) return;
  const route = sectionRoute(input.sectionKey);
  const { error } = await supabase.from('landlord_information_requests').insert({
    landlord_application_id: input.applicationId,
    passport_id: input.passportId,
    passport_version_id: input.passportVersionId,
    tenant_user_id: input.tenantUserId,
    landlord_user_id: user.id,
    section_key: input.sectionKey,
    request_type: input.requestType,
    message: input.message.trim(),
    tenant_route: route,
  });
  if (error) throw error;
  await recordActivity(input.passportId, user.id, 'landlord_information_requested', `Landlord requested ${input.requestType}.`);
  await recordAudit(user.id, input.tenantUserId, 'landlord.information_requested', 'landlord_application', input.applicationId, {
    sectionKey: input.sectionKey,
    requestType: input.requestType,
  });
}

async function getOrCreateStageProgress(
  user: User,
  passportId: string,
  passportVersionId: string,
): Promise<OnboardingStageProgress[]> {
  if (!supabase) return readDemoProgress(user.id);

  const existing = await supabase
    .from('onboarding_stage_progress')
    .select('*')
    .eq('passport_version_id', passportVersionId);
  if (existing.error) throw existing.error;

  const existingKeys = new Set((existing.data ?? []).map((item) => item.stage_key as OnboardingStageKey));
  const missing = onboardingStages
    .filter((stage) => !existingKeys.has(stage.key))
    .map((stage) => ({
      user_id: user.id,
      passport_id: passportId,
      passport_version_id: passportVersionId,
      stage_key: stage.key,
      section_key: stage.sectionKey,
      status: 'missing',
      required: stage.required,
      progress: 0,
      missing_items: stage.requiredItems,
      draft: {},
    }));

  if (missing.length > 0) {
    const inserted = await supabase.from('onboarding_stage_progress').insert(missing);
    if (inserted.error) throw inserted.error;
  }

  const refreshed = await supabase
    .from('onboarding_stage_progress')
    .select('*')
    .eq('passport_version_id', passportVersionId)
    .order('created_at', { ascending: true });
  if (refreshed.error) throw refreshed.error;

  return (refreshed.data ?? []) as OnboardingStageProgress[];
}

function createDefaultStage(stage: OnboardingStageDefinition): OnboardingStageProgress {
  return {
    stage_key: stage.key,
    section_key: stage.sectionKey,
    status: 'missing',
    required: stage.required,
    progress: 0,
    missing_items: stage.requiredItems,
    draft: {},
    completed_at: null,
    last_autosaved_at: null,
  };
}

function readDemoProgress(userId: string): OnboardingStageProgress[] {
  const raw = window.localStorage.getItem(onboardingDraftKey(userId));
  if (raw) return JSON.parse(raw) as OnboardingStageProgress[];
  const initial = onboardingStages.map(createDefaultStage);
  writeDemoProgress(userId, initial);
  return initial;
}

function writeDemoProgress(userId: string, progress: OnboardingStageProgress[]) {
  window.localStorage.setItem(onboardingDraftKey(userId), JSON.stringify(progress));
}

async function recordActivity(passportId: string, actorUserId: string | null, eventType: PassportActivityEvent, description: string) {
  if (!supabase) return;
  await supabase.from('passport_activity_logs').insert({
    passport_id: passportId,
    actor_user_id: actorUserId,
    event_type: eventType,
    description,
    visibility: 'tenant',
  });
}

async function recordAudit(
  actorUserId: string,
  targetUserId: string,
  eventType: string,
  resourceType: string,
  resourceId: string,
  metadata: Record<string, unknown>,
) {
  if (!supabase) return;
  await supabase.from('audit_logs').insert({
    actor_user_id: actorUserId,
    target_user_id: targetUserId,
    event_type: eventType,
    resource_type: resourceType,
    resource_id: resourceId,
    visibility: 'internal',
    metadata,
  });
}

function evidenceBucketFor(documentType: EvidenceDocumentType) {
  if (documentType === 'government_id_front' || documentType === 'government_id_back' || documentType === 'selfie') {
    return 'identity-documents';
  }
  if (documentType === 'credit_report') return 'credit-report-documents';
  return 'passport-evidence';
}

function sectionRoute(sectionKey: PassportSectionKey) {
  const routes: Record<PassportSectionKey, string> = {
    rental_history: '/passport/rental-history',
    employment: '/passport/employment',
    references: '/passport/references',
    credit_report: '/passport/credit-report',
    identity_confirmation: '/passport/identity',
  };
  return routes[sectionKey];
}

function verificationTypeForSection(sectionKey: PassportSectionKey): VerificationType {
  const map: Record<PassportSectionKey, VerificationType> = {
    identity_confirmation: 'identity',
    employment: 'employment',
    rental_history: 'rental_history',
    references: 'references',
    credit_report: 'credit',
  };
  return map[sectionKey];
}

function checklistForSection(sectionKey: PassportSectionKey) {
  const base = ['Consent is recorded', 'Evidence is tied to the current passport version', 'Reviewer notes are internal-only'];
  const sectionSpecific: Record<PassportSectionKey, string[]> = {
    identity_confirmation: ['Government ID is readable', 'Selfie evidence is present', 'Name matches profile'],
    employment: ['Employer facts are present', 'Income evidence is present', 'Outreach response reviewed when available'],
    rental_history: ['Tenancy dates are present', 'Lease or ledger evidence reviewed', 'Respondent role is clear'],
    references: ['Relationship is confirmed', 'Structured response reviewed', 'No scoring language used'],
    credit_report: ['Credit authorization recorded', 'Provider/manual summary entered', 'Full report not shared by default'],
  };
  return [...sectionSpecific[sectionKey], ...base];
}

async function hashToken(value: string) {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
