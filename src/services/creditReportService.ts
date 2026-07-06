import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getOrCreatePassportSummary, updatePassportSectionStatus } from '@/services/passportService';
import type { PassportActivityEvent, PassportSectionStatus } from '@/types/passport';
import type { CreditReportDocument, CreditReportFormData, CreditReportModuleState, CreditReportRecord, CreditSignal, CreditVerificationRequestStatus } from '@/types/creditReport';

const creditConsentVersion = 'credit-report-consent-v1';
const creditReportBucket = 'credit-report-documents';

export const emptyCreditReportForm: CreditReportFormData = {
  workflow: 'provider_request',
  provider_key: 'manual_review',
  report_date: '',
  credit_score: '',
  credit_score_range: '300 - 900',
  payment_history: '',
  collections: '',
  public_records: '',
  credit_utilization: '',
  bankruptcy: '',
  consumer_proposal: '',
  hard_inquiries: '',
  notes: '',
  consent_credit_authorization: false,
  consent_storage: false,
  consent_review: false,
  consent_landlord_sharing: false,
  consent_expiration: false,
};

export async function getCreditReportModuleState(user: User): Promise<CreditReportModuleState> {
  if (!supabase) return createDemoCreditState(user.id);

  const summary = await getOrCreatePassportSummary(user);
  const response = await supabase.from('credit_reports').select('*').eq('passport_id', summary.passport.id).eq('passport_version_id', summary.draftVersion.id).maybeSingle();
  if (response.error) throw response.error;

  const report = response.data ? hydrateCreditReport(response.data as CreditReportRecord) : null;
  const documents = report ? await getCreditReportDocuments(report.id) : [];
  return {
    report,
    documents,
    signals: buildCreditSignals(report, documents),
    status: report?.verification_request_status ?? 'draft',
  };
}

export async function saveCreditReportDraft(user: User, form: CreditReportFormData): Promise<CreditReportModuleState> {
  if (!supabase) {
    const report = createDemoCreditReport(user.id, form, 'draft');
    return { report, documents: [], signals: buildCreditSignals(report, []), status: 'draft' };
  }

  const summary = await getOrCreatePassportSummary(user);
  const existing = await getExistingCreditReport(summary.passport.id, summary.draftVersion.id);
  const changedAfterVerification = existing?.verification_request_status === 'verified';
  const nextStatus: CreditVerificationRequestStatus = changedAfterVerification ? 'needs_reverification' : existing?.verification_request_status ?? 'draft';

  const response = await supabase
    .from('credit_reports')
    .upsert(
      {
        id: existing?.id,
        passport_id: summary.passport.id,
        passport_version_id: summary.draftVersion.id,
        user_id: user.id,
        workflow: form.workflow,
        provider_key: form.provider_key,
        report_date: form.report_date || null,
        credit_score: form.credit_score ? Number(form.credit_score) : null,
        credit_score_range: form.credit_score_range || null,
        payment_history: form.payment_history || null,
        collections: form.collections || null,
        public_records: form.public_records || null,
        credit_utilization: form.credit_utilization || null,
        bankruptcy: form.bankruptcy || null,
        consumer_proposal: form.consumer_proposal || null,
        hard_inquiries: form.hard_inquiries || null,
        notes: form.notes || null,
        consent_credit_authorization: form.consent_credit_authorization,
        consent_storage: form.consent_storage,
        consent_review: form.consent_review,
        consent_landlord_sharing: form.consent_landlord_sharing,
        consent_expiration: form.consent_expiration,
        verification_request_status: nextStatus,
        report_expires_at: form.report_date ? addMonths(form.report_date, 3) : null,
      },
      { onConflict: 'id' },
    )
    .select()
    .single();
  if (response.error) throw response.error;

  const report = hydrateCreditReport(response.data as CreditReportRecord);
  await logCreditConsents(user.id, report.id, form);
  await upsertCreditSignals(report.id, buildCreditSignals(report, []));
  await updatePassportSectionStatus(user, 'credit_report', changedAfterVerification ? 'needs_reverification' : 'in_progress');
  await recordCreditActivity(summary.passport.id, user.id, changedAfterVerification ? 'credit_report_needs_reverification' : 'credit_report_draft_saved', changedAfterVerification ? 'Credit report changes require reverification.' : 'Credit report draft saved.');
  return getCreditReportModuleState(user);
}

export async function uploadCreditReportDocument(user: User, file: File): Promise<CreditReportModuleState> {
  validateCreditFile(file);

  if (!supabase) {
    const state = createDemoCreditState(user.id);
    return {
      ...state,
      documents: [...state.documents, { id: crypto.randomUUID(), name: file.name, kind: 'Credit Report PDF', uploadedAt: new Date().toISOString(), storagePath: `local/${file.name}` }],
    };
  }

  const summary = await getOrCreatePassportSummary(user);
  const existing = await getExistingCreditReport(summary.passport.id, summary.draftVersion.id);
  if (!existing) throw new Error('Save credit report details before uploading a report.');

  const storagePath = `${user.id}/${summary.passport.id}/${summary.draftVersion.id}/credit-report-${crypto.randomUUID()}.pdf`;
  const upload = await supabase.storage.from(creditReportBucket).upload(storagePath, file, { cacheControl: '3600', upsert: false });
  if (upload.error) throw upload.error;

  const response = await supabase.from('credit_report_documents').insert({
    credit_report_id: existing.id,
    passport_id: summary.passport.id,
    passport_version_id: summary.draftVersion.id,
    user_id: user.id,
    file_name: file.name,
    storage_bucket: creditReportBucket,
    storage_path: storagePath,
    mime_type: file.type,
    file_size: file.size,
  });
  if (response.error) throw response.error;

  await updatePassportSectionStatus(user, 'credit_report', 'in_progress');
  await recordCreditActivity(summary.passport.id, user.id, 'credit_report_document_uploaded', 'Credit report document uploaded.');
  return getCreditReportModuleState(user);
}

export async function requestCreditVerification(user: User, form: CreditReportFormData): Promise<CreditReportModuleState> {
  validateReadyForReview(form);
  await saveCreditReportDraft(user, form);

  if (!supabase) {
    const report = createDemoCreditReport(user.id, form, 'ready_for_review');
    return { report, documents: [], signals: buildCreditSignals(report, []), status: 'ready_for_review' };
  }

  const summary = await getOrCreatePassportSummary(user);
  const existing = await getExistingCreditReport(summary.passport.id, summary.draftVersion.id);
  if (!existing) throw new Error('Credit report record was not created.');

  const request = await supabase.from('credit_verification_requests').insert({
    credit_report_id: existing.id,
    passport_id: summary.passport.id,
    passport_version_id: summary.draftVersion.id,
    user_id: user.id,
    workflow: form.workflow,
    status: 'ready_for_review',
  });
  if (request.error) throw request.error;

  const update = await supabase.from('credit_reports').update({ verification_request_status: 'ready_for_review' }).eq('id', existing.id);
  if (update.error) throw update.error;

  await updatePassportSectionStatus(user, 'credit_report', 'ready_for_review');
  await recordCreditActivity(summary.passport.id, user.id, 'credit_report_ready_for_review', form.workflow === 'provider_request' ? 'Credit provider manual request created.' : 'Uploaded credit report marked ready for review.');
  return getCreditReportModuleState(user);
}

export async function markCreditUnderReview(user: User): Promise<CreditReportModuleState> {
  if (!supabase) {
    const state = createDemoCreditState(user.id);
    return { ...state, status: 'under_review' };
  }

  const summary = await getOrCreatePassportSummary(user);
  const existing = await getExistingCreditReport(summary.passport.id, summary.draftVersion.id);
  if (!existing) throw new Error('Credit report record was not created.');

  const update = await supabase.from('credit_reports').update({ verification_request_status: 'under_review' }).eq('id', existing.id);
  if (update.error) throw update.error;

  await updatePassportSectionStatus(user, 'credit_report', 'under_review');
  await recordCreditActivity(summary.passport.id, user.id, 'section_updated', 'Credit report review placeholder started.');
  return getCreditReportModuleState(user);
}

function validateReadyForReview(form: CreditReportFormData) {
  const missing = [
    !form.consent_credit_authorization && 'credit authorization consent',
    !form.consent_storage && 'storage consent',
    !form.consent_review && 'review consent',
    !form.consent_landlord_sharing && 'landlord sharing consent',
    !form.consent_expiration && 'expiration consent',
  ].filter(Boolean);
  if (missing.length > 0) throw new Error(`Complete required credit consent before review: ${missing.join(', ')}.`);
}

function validateCreditFile(file: File) {
  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) throw new Error('Credit report documents must be 10MB or smaller.');
  if (file.type && file.type !== 'application/pdf') throw new Error('Credit reports must be uploaded as PDF files.');
}

async function getExistingCreditReport(passportId: string, versionId: string): Promise<CreditReportRecord | null> {
  if (!supabase) return null;
  const response = await supabase.from('credit_reports').select('*').eq('passport_id', passportId).eq('passport_version_id', versionId).maybeSingle();
  if (response.error) throw response.error;
  return response.data as CreditReportRecord | null;
}

async function getCreditReportDocuments(reportId: string): Promise<CreditReportDocument[]> {
  if (!supabase) return [];
  const response = await supabase.from('credit_report_documents').select('*').eq('credit_report_id', reportId).order('created_at', { ascending: false });
  if (response.error) throw response.error;
  return (response.data ?? []).map((document) => ({
    id: document.id as string,
    name: document.file_name as string,
    kind: 'Credit Report PDF',
    uploadedAt: document.created_at as string,
    storagePath: document.storage_path as string,
  }));
}

async function logCreditConsents(userId: string, reportId: string, form: CreditReportFormData) {
  if (!supabase) return;
  const consentTypes = [
    form.consent_credit_authorization && 'credit_report:authorization',
    form.consent_storage && 'credit_report:storage',
    form.consent_review && 'credit_report:review',
    form.consent_landlord_sharing && 'credit_report:landlord_sharing',
    form.consent_expiration && 'credit_report:expiration',
  ].filter(Boolean) as string[];
  if (consentTypes.length === 0) return;

  const response = await supabase.from('consent_records').insert(
    consentTypes.map((consentType) => ({
      user_id: userId,
      consent_type: consentType,
      consent_version: creditConsentVersion,
      metadata: { credit_report_id: reportId },
    })),
  );
  if (response.error) throw response.error;
}

async function upsertCreditSignals(reportId: string, signals: CreditSignal[]) {
  if (!supabase) return;
  const response = await supabase.from('credit_verification_signals').upsert(
    signals.map((signal) => ({
      credit_report_id: reportId,
      signal_key: signal.key,
      signal_label: signal.label,
      is_present: signal.complete,
    })),
    { onConflict: 'credit_report_id,signal_key' },
  );
  if (response.error) throw response.error;
}

async function recordCreditActivity(passportId: string, actorUserId: string, eventType: PassportActivityEvent, description: string) {
  if (!supabase) return;
  await supabase.from('passport_activity_logs').insert({
    passport_id: passportId,
    actor_user_id: actorUserId,
    event_type: eventType,
    description,
    visibility: 'internal',
  });
}

function hydrateCreditReport(report: CreditReportRecord): CreditReportRecord {
  return {
    ...emptyCreditReportForm,
    ...report,
    credit_score: report.credit_score ? String(report.credit_score) : '',
    hard_inquiries: report.hard_inquiries ? String(report.hard_inquiries) : '',
    report_date: report.report_date ?? '',
    report_expires_at: report.report_expires_at ?? null,
  };
}

function buildCreditSignals(report: CreditReportRecord | null, documents: CreditReportDocument[]): CreditSignal[] {
  return [
    { key: 'tenant_uploaded_report', label: 'Tenant uploaded report', complete: documents.length > 0 },
    { key: 'provider_requested', label: 'Provider requested', complete: report?.workflow === 'provider_request' },
    { key: 'provider_report_received', label: 'Provider report received placeholder', complete: false },
    { key: 'manual_review_started', label: 'Manual review can start', complete: Boolean(report?.consent_review) },
    { key: 'manual_review_completed', label: 'Manual review completed placeholder', complete: false },
    { key: 'provider_confirmed', label: 'Provider confirmed placeholder', complete: false },
    { key: 'report_matches_applicant', label: 'Report matches applicant placeholder', complete: false },
    { key: 'report_date_valid', label: 'Report date provided', complete: Boolean(report?.report_date || report?.workflow === 'provider_request') },
    { key: 'verification_complete', label: 'Verification complete placeholder', complete: false },
    { key: 'needs_reverification', label: 'Needs reverification placeholder', complete: report?.verification_request_status === 'needs_reverification' },
  ];
}

function createDemoCreditState(userId: string): CreditReportModuleState {
  const report = createDemoCreditReport(userId, emptyCreditReportForm, 'draft');
  const documents: CreditReportDocument[] = [];
  return { report, documents, signals: buildCreditSignals(report, documents), status: 'draft' };
}

function createDemoCreditReport(userId: string, form: CreditReportFormData, status: CreditVerificationRequestStatus): CreditReportRecord {
  const now = new Date().toISOString();
  return {
    ...form,
    id: 'demo-credit-report',
    passport_id: 'demo-passport',
    passport_version_id: 'demo-version-1',
    user_id: userId,
    verification_request_status: status,
    report_expires_at: form.report_date ? addMonths(form.report_date, 3) : null,
    created_at: now,
    updated_at: now,
  };
}

function addMonths(date: string, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next.toISOString().slice(0, 10);
}

export function creditRequestToSectionStatus(status: CreditVerificationRequestStatus): PassportSectionStatus {
  if (status === 'draft') return 'in_progress';
  return status;
}
