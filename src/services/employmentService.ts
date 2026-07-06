import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getOrCreatePassportSummary, updatePassportSectionStatus } from '@/services/passportService';
import type {
  EmploymentDocument,
  EmploymentDocumentKind,
  EmploymentFormData,
  EmploymentModuleState,
  EmploymentRecord,
  EmploymentSignal,
  EmploymentVerificationRequestStatus,
} from '@/types/employment';
import type { PassportActivityEvent, PassportSectionStatus } from '@/types/passport';

const employmentConsentVersion = 'employment-consent-v1';
const employmentDocumentBucket = 'employment-documents';

export const emptyEmploymentForm: EmploymentFormData = {
  employer_name: '',
  employer_website: '',
  employer_email_domain: '',
  employer_contact_name: '',
  employer_contact_email: '',
  employer_contact_phone: '',
  job_title: '',
  employment_type: 'full_time',
  employment_status: 'active',
  start_date: '',
  annual_income: '',
  pay_frequency: 'biweekly',
  work_location: '',
  consent_contact_employer: false,
  consent_review_documents: false,
  consent_use_in_passport: false,
  consent_share_summary: false,
};

export async function getEmploymentModuleState(user: User): Promise<EmploymentModuleState> {
  if (!supabase) return createDemoEmploymentState(user.id);

  const summary = await getOrCreatePassportSummary(user);
  const passportId = summary.passport.id;
  const versionId = summary.draftVersion.id;

  const recordResponse = await supabase.from('employment_records').select('*').eq('passport_id', passportId).eq('passport_version_id', versionId).maybeSingle();
  if (recordResponse.error) throw recordResponse.error;

  const record = recordResponse.data ? await hydrateEmploymentRecord(recordResponse.data as EmploymentRecord, user.id) : null;
  const documents = record ? await getEmploymentDocuments(record.id) : [];

  return {
    record,
    documents,
    signals: buildEmploymentSignals(record, documents),
    status: record?.verification_request_status ?? 'draft',
  };
}

export async function saveEmploymentDraft(user: User, form: EmploymentFormData): Promise<EmploymentModuleState> {
  if (!supabase) {
    const record = createDemoEmploymentRecord(user.id, form, 'draft');
    return {
      record,
      documents: [],
      signals: buildEmploymentSignals(record, []),
      status: 'draft',
    };
  }

  const summary = await getOrCreatePassportSummary(user);
  const existing = await getExistingEmploymentRecord(summary.passport.id, summary.draftVersion.id);
  const changedAfterVerification = existing?.verification_request_status === 'verified';
  const nextStatus: EmploymentVerificationRequestStatus = changedAfterVerification ? 'needs_reverification' : existing?.verification_request_status ?? 'draft';

  const recordResponse = await supabase
    .from('employment_records')
    .upsert(
      {
        id: existing?.id,
        passport_id: summary.passport.id,
        passport_version_id: summary.draftVersion.id,
        user_id: user.id,
        employer_name: form.employer_name,
        employer_website: form.employer_website || null,
        employer_email_domain: form.employer_email_domain || null,
        job_title: form.job_title,
        employment_type: form.employment_type,
        employment_status: form.employment_status,
        start_date: form.start_date || null,
        annual_income: form.annual_income ? Number(form.annual_income) : null,
        pay_frequency: form.pay_frequency,
        work_location: form.work_location || null,
        consent_contact_employer: form.consent_contact_employer,
        consent_review_documents: form.consent_review_documents,
        consent_use_in_passport: form.consent_use_in_passport,
        consent_share_summary: form.consent_share_summary,
        verification_request_status: nextStatus,
      },
      { onConflict: 'id' },
    )
    .select()
    .single();

  if (recordResponse.error) throw recordResponse.error;
  const record = recordResponse.data as EmploymentRecord;

  await upsertEmploymentContact(record.id, form);
  await logEmploymentConsents(user.id, record.id, form);
  await upsertEmploymentSignals(record.id, buildEmploymentSignals({ ...record, ...form }, []));
  await updatePassportSectionStatus(user, 'employment', changedAfterVerification ? 'needs_reverification' : 'in_progress');
  await recordEmploymentActivity(summary.passport.id, user.id, changedAfterVerification ? 'employment_needs_reverification' : 'employment_draft_saved', changedAfterVerification ? 'Employment changes require reverification.' : 'Employment draft saved.');

  return getEmploymentModuleState(user);
}

export async function uploadEmploymentDocument(user: User, kind: EmploymentDocumentKind, file: File): Promise<EmploymentModuleState> {
  validateEmploymentFile(file);

  if (!supabase) {
    const state = createDemoEmploymentState(user.id);
    const uploadedAt = new Date().toISOString();
    return {
      ...state,
      documents: [
        ...state.documents,
        {
          id: crypto.randomUUID(),
          name: file.name,
          kind: documentKindLabel(kind),
          uploadedAt,
          storagePath: `local/${file.name}`,
        },
      ],
    };
  }

  const summary = await getOrCreatePassportSummary(user);
  const existing = await getExistingEmploymentRecord(summary.passport.id, summary.draftVersion.id);
  if (!existing) throw new Error('Save employment details before uploading documents.');

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const storagePath = `${user.id}/${summary.passport.id}/${summary.draftVersion.id}/${kind}-${crypto.randomUUID()}.${extension}`;
  const upload = await supabase.storage.from(employmentDocumentBucket).upload(storagePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (upload.error) throw upload.error;

  const documentResponse = await supabase.from('employment_documents').insert({
    employment_record_id: existing.id,
    passport_id: summary.passport.id,
    passport_version_id: summary.draftVersion.id,
    user_id: user.id,
    document_type: kind,
    file_name: file.name,
    storage_bucket: employmentDocumentBucket,
    storage_path: storagePath,
    mime_type: file.type,
    file_size: file.size,
  });

  if (documentResponse.error) throw documentResponse.error;

  await updatePassportSectionStatus(user, 'employment', 'in_progress');
  await recordEmploymentActivity(summary.passport.id, user.id, 'employment_document_uploaded', `${documentKindLabel(kind)} uploaded.`);
  return getEmploymentModuleState(user);
}

export async function markEmploymentReadyForReview(user: User, form: EmploymentFormData): Promise<EmploymentModuleState> {
  validateReadyForReview(form);
  await saveEmploymentDraft(user, form);

  if (!supabase) {
    const record = createDemoEmploymentRecord(user.id, form, 'ready_for_review');
    return {
      record,
      documents: [],
      signals: buildEmploymentSignals(record, []),
      status: 'ready_for_review',
    };
  }

  const summary = await getOrCreatePassportSummary(user);
  const existing = await getExistingEmploymentRecord(summary.passport.id, summary.draftVersion.id);
  if (!existing) throw new Error('Employment record was not created.');

  const request = await supabase.from('employment_verification_requests').insert({
    employment_record_id: existing.id,
    passport_id: summary.passport.id,
    passport_version_id: summary.draftVersion.id,
    user_id: user.id,
    status: 'ready_for_review',
  });
  if (request.error) throw request.error;

  const update = await supabase.from('employment_records').update({ verification_request_status: 'ready_for_review' }).eq('id', existing.id);
  if (update.error) throw update.error;

  await updatePassportSectionStatus(user, 'employment', 'ready_for_review');
  await recordEmploymentActivity(summary.passport.id, user.id, 'employment_ready_for_review', 'Employment section marked ready for review.');
  return getEmploymentModuleState(user);
}

export async function markEmploymentUnderReview(user: User): Promise<EmploymentModuleState> {
  if (!supabase) {
    const state = createDemoEmploymentState(user.id);
    return {
      ...state,
      status: 'under_review',
    };
  }

  const summary = await getOrCreatePassportSummary(user);
  const existing = await getExistingEmploymentRecord(summary.passport.id, summary.draftVersion.id);
  if (!existing) throw new Error('Employment record was not created.');

  const update = await supabase.from('employment_records').update({ verification_request_status: 'under_review' }).eq('id', existing.id);
  if (update.error) throw update.error;

  await updatePassportSectionStatus(user, 'employment', 'under_review');
  await recordEmploymentActivity(summary.passport.id, user.id, 'section_updated', 'Employment review placeholder started.');
  return getEmploymentModuleState(user);
}

function validateReadyForReview(form: EmploymentFormData) {
  const missing = [
    !form.employer_name && 'employer name',
    !form.employer_email_domain && 'company email domain',
    !form.employer_contact_name && 'employer contact name',
    !form.employer_contact_email && 'employer contact email',
    !form.job_title && 'job title',
    !form.start_date && 'start date',
    !form.annual_income && 'annual income',
    !form.consent_contact_employer && 'consent to contact employer',
    !form.consent_review_documents && 'consent to review documents',
    !form.consent_use_in_passport && 'consent to use employment information',
    !form.consent_share_summary && 'consent to share verified summary',
  ].filter(Boolean);

  if (missing.length > 0) throw new Error(`Complete required fields before review: ${missing.join(', ')}.`);
}

function validateEmploymentFile(file: File) {
  const maxBytes = 10 * 1024 * 1024;
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (file.size > maxBytes) throw new Error('Employment documents must be 10MB or smaller.');
  if (file.type && !allowedTypes.includes(file.type)) throw new Error('Employment documents must be PDF, JPG, or PNG files.');
}

async function getExistingEmploymentRecord(passportId: string, versionId: string): Promise<EmploymentRecord | null> {
  if (!supabase) return null;
  const response = await supabase.from('employment_records').select('*').eq('passport_id', passportId).eq('passport_version_id', versionId).maybeSingle();
  if (response.error) throw response.error;
  return response.data as EmploymentRecord | null;
}

async function hydrateEmploymentRecord(record: EmploymentRecord, userId: string): Promise<EmploymentRecord> {
  if (!supabase) return record;
  const contactResponse = await supabase.from('employment_contacts').select('*').eq('employment_record_id', record.id).maybeSingle();
  if (contactResponse.error) throw contactResponse.error;
  const contact = contactResponse.data as Partial<EmploymentRecord> | null;

  return {
    ...emptyEmploymentForm,
    ...record,
    user_id: userId,
    annual_income: record.annual_income ? String(record.annual_income) : '',
    employer_contact_name: contact?.employer_contact_name ?? '',
    employer_contact_email: contact?.employer_contact_email ?? '',
    employer_contact_phone: contact?.employer_contact_phone ?? '',
  };
}

async function upsertEmploymentContact(recordId: string, form: EmploymentFormData) {
  if (!supabase) return;
  const response = await supabase.from('employment_contacts').upsert(
    {
      employment_record_id: recordId,
      employer_contact_name: form.employer_contact_name,
      employer_contact_email: form.employer_contact_email,
      employer_contact_phone: form.employer_contact_phone || null,
    },
    { onConflict: 'employment_record_id' },
  );
  if (response.error) throw response.error;
}

async function getEmploymentDocuments(recordId: string): Promise<EmploymentDocument[]> {
  if (!supabase) return [];
  const response = await supabase.from('employment_documents').select('*').eq('employment_record_id', recordId).order('created_at', { ascending: false });
  if (response.error) throw response.error;

  return (response.data ?? []).map((document) => ({
    id: document.id as string,
    name: document.file_name as string,
    kind: documentKindLabel(document.document_type as EmploymentDocumentKind),
    uploadedAt: document.created_at as string,
    storagePath: document.storage_path as string,
  }));
}

async function logEmploymentConsents(userId: string, recordId: string, form: EmploymentFormData) {
  if (!supabase) return;
  const consentTypes = [
    form.consent_contact_employer && 'employment:contact_employer',
    form.consent_review_documents && 'employment:review_documents',
    form.consent_use_in_passport && 'employment:use_in_passport',
    form.consent_share_summary && 'employment:share_verified_summary',
  ].filter(Boolean) as string[];

  if (consentTypes.length === 0) return;

  const response = await supabase.from('consent_records').insert(
    consentTypes.map((consentType) => ({
      user_id: userId,
      consent_type: consentType,
      consent_version: employmentConsentVersion,
      metadata: { employment_record_id: recordId },
    })),
  );
  if (response.error) throw response.error;
}

async function upsertEmploymentSignals(recordId: string, signals: EmploymentSignal[]) {
  if (!supabase) return;
  const response = await supabase.from('employment_verification_signals').upsert(
    signals.map((signal) => ({
      employment_record_id: recordId,
      signal_key: signal.key,
      signal_label: signal.label,
      is_present: signal.complete,
    })),
    { onConflict: 'employment_record_id,signal_key' },
  );
  if (response.error) throw response.error;
}

async function recordEmploymentActivity(passportId: string, actorUserId: string, eventType: PassportActivityEvent, description: string) {
  if (!supabase) return;
  await supabase.from('passport_activity_logs').insert({
    passport_id: passportId,
    actor_user_id: actorUserId,
    event_type: eventType,
    description,
    visibility: 'internal',
  });
}

function buildEmploymentSignals(record: EmploymentRecord | null, documents: EmploymentDocument[]): EmploymentSignal[] {
  return [
    { key: 'employer_details', label: 'Employer details provided', complete: Boolean(record?.employer_name && record?.employer_website) },
    { key: 'company_domain', label: 'Company domain provided', complete: Boolean(record?.employer_email_domain) },
    { key: 'employer_contact', label: 'Employer contact provided', complete: Boolean(record?.employer_contact_name && record?.employer_contact_email) },
    { key: 'tenant_consent', label: 'Tenant consent recorded', complete: Boolean(record?.consent_contact_employer && record?.consent_review_documents && record?.consent_use_in_passport && record?.consent_share_summary) },
    { key: 'pay_stub', label: 'Pay stub uploaded', complete: documents.some((document) => document.kind === 'Recent Pay Stub') },
    { key: 'employment_letter', label: 'Employment letter uploaded', complete: documents.some((document) => document.kind === 'Employment Letter') },
    { key: 'bank_proof_optional', label: 'Optional bank proof uploaded', complete: documents.some((document) => document.kind === 'Optional Bank Deposit Proof') },
    { key: 'manual_review', label: 'Manual review can be requested', complete: Boolean(record?.employer_name && record?.job_title && record?.annual_income) },
  ];
}

function createDemoEmploymentState(userId: string): EmploymentModuleState {
  const record = createDemoEmploymentRecord(userId, emptyEmploymentForm, 'draft');
  const documents: EmploymentDocument[] = [];
  return {
    record,
    documents,
    signals: buildEmploymentSignals(record, documents),
    status: 'draft',
  };
}

function createDemoEmploymentRecord(userId: string, form: EmploymentFormData, status: EmploymentVerificationRequestStatus): EmploymentRecord {
  const now = new Date().toISOString();
  return {
    ...form,
    id: 'demo-employment-record',
    passport_id: 'demo-passport',
    passport_version_id: 'demo-version-1',
    user_id: userId,
    verification_request_status: status,
    created_at: now,
    updated_at: now,
  };
}

function documentKindLabel(kind: EmploymentDocumentKind) {
  const labels: Record<EmploymentDocumentKind, string> = {
    pay_stub: 'Recent Pay Stub',
    employment_letter: 'Employment Letter',
    offer_letter: 'Offer Letter',
    bank_deposit_proof: 'Optional Bank Deposit Proof',
    other: 'Other Supporting Document',
  };
  return labels[kind];
}

export function employmentRequestToSectionStatus(status: EmploymentVerificationRequestStatus): PassportSectionStatus {
  if (status === 'draft') return 'in_progress';
  return status;
}
