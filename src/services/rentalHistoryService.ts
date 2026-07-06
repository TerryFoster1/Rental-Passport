import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getOrCreatePassportSummary, updatePassportSectionStatus } from '@/services/passportService';
import type { PassportActivityEvent, PassportSectionStatus } from '@/types/passport';
import type {
  RentalHistoryDocument,
  RentalHistoryDocumentKind,
  RentalHistoryModuleState,
  RentalHistoryRecord,
  RentalHistoryRecordForm,
  RentalHistorySignal,
  RentalHistoryVerificationRequestStatus,
} from '@/types/rentalHistory';

const rentalHistoryConsentVersion = 'rental-history-consent-v1';
const rentalHistoryDocumentBucket = 'rental-history-documents';

export function createEmptyRentalRecord(): RentalHistoryRecordForm {
  return {
    local_id: crypto.randomUUID(),
    property_address: '',
    unit_number: '',
    city: '',
    province_state: '',
    country: 'Canada',
    postal_code: '',
    move_in_date: '',
    move_out_date: '',
    is_current_residence: false,
    monthly_rent: '',
    manager_name: '',
    manager_email: '',
    manager_phone: '',
    relationship_type: 'landlord',
    reason_for_leaving: '',
    consent_contact_manager: false,
    consent_review_documents: false,
    consent_use_in_passport: false,
    consent_share_summary: false,
  };
}

export async function getRentalHistoryModuleState(user: User): Promise<RentalHistoryModuleState> {
  if (!supabase) return createDemoRentalHistoryState(user.id);

  const summary = await getOrCreatePassportSummary(user);
  const recordsResponse = await supabase.from('rental_history_records').select('*').eq('passport_id', summary.passport.id).eq('passport_version_id', summary.draftVersion.id).order('move_in_date', { ascending: false });
  if (recordsResponse.error) throw recordsResponse.error;

  const records = await hydrateRentalHistoryRecords((recordsResponse.data ?? []) as RentalHistoryRecord[]);
  const documents = await getRentalHistoryDocuments(summary.passport.id, summary.draftVersion.id);

  return {
    records,
    documents,
    signals: buildRentalHistorySignals(records, documents),
    status: getAggregateStatus(records),
  };
}

export async function saveRentalHistoryDraft(user: User, records: RentalHistoryRecordForm[]): Promise<RentalHistoryModuleState> {
  if (records.length === 0) throw new Error('Add at least one rental record before saving.');

  if (!supabase) {
    const saved = records.map((record) => createDemoRentalRecord(user.id, record, 'draft'));
    return { records: saved, documents: [], signals: buildRentalHistorySignals(saved, []), status: 'draft' };
  }

  const summary = await getOrCreatePassportSummary(user);
  const existingResponse = await supabase.from('rental_history_records').select('id, verification_request_status').eq('passport_id', summary.passport.id).eq('passport_version_id', summary.draftVersion.id);
  if (existingResponse.error) throw existingResponse.error;

  const submittedIds = new Set(records.map((record) => record.id).filter(Boolean));
  const removedIds = (existingResponse.data ?? []).map((record) => record.id as string).filter((id) => !submittedIds.has(id));
  if (removedIds.length > 0) {
    const deleteResponse = await supabase.from('rental_history_records').delete().in('id', removedIds);
    if (deleteResponse.error) throw deleteResponse.error;
  }

  let changedAfterVerification = false;
  for (const record of records) {
    const existing = (existingResponse.data ?? []).find((item) => item.id === record.id);
    changedAfterVerification = changedAfterVerification || existing?.verification_request_status === 'verified';
    const nextStatus: RentalHistoryVerificationRequestStatus = existing?.verification_request_status === 'verified' ? 'needs_reverification' : (existing?.verification_request_status as RentalHistoryVerificationRequestStatus | undefined) ?? 'draft';

    const savedRecord = await upsertRentalHistoryRecord(user.id, summary.passport.id, summary.draftVersion.id, record, nextStatus);
    await upsertRentalHistoryContact(savedRecord.id, record);
    await logRentalHistoryConsents(user.id, savedRecord.id, record);
  }

  const state = await getRentalHistoryModuleState(user);
  await upsertRentalHistorySignals(state.records);
  await updatePassportSectionStatus(user, 'rental_history', changedAfterVerification ? 'needs_reverification' : 'in_progress');
  await recordRentalHistoryActivity(summary.passport.id, user.id, changedAfterVerification ? 'rental_history_needs_reverification' : 'rental_history_draft_saved', changedAfterVerification ? 'Rental history changes require reverification.' : 'Rental history draft saved.');
  return getRentalHistoryModuleState(user);
}

export async function uploadRentalHistoryDocument(user: User, rentalRecordId: string, kind: RentalHistoryDocumentKind, file: File): Promise<RentalHistoryModuleState> {
  validateRentalHistoryFile(file);

  if (!supabase) {
    const state = createDemoRentalHistoryState(user.id);
    return {
      ...state,
      documents: [
        ...state.documents,
        {
          id: crypto.randomUUID(),
          rentalRecordId,
          name: file.name,
          kind: documentKindLabel(kind),
          uploadedAt: new Date().toISOString(),
          storagePath: `local/${file.name}`,
        },
      ],
    };
  }

  const summary = await getOrCreatePassportSummary(user);
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const storagePath = `${user.id}/${summary.passport.id}/${summary.draftVersion.id}/${rentalRecordId}/${kind}-${crypto.randomUUID()}.${extension}`;
  const upload = await supabase.storage.from(rentalHistoryDocumentBucket).upload(storagePath, file, { cacheControl: '3600', upsert: false });
  if (upload.error) throw upload.error;

  const documentResponse = await supabase.from('rental_history_documents').insert({
    rental_history_record_id: rentalRecordId,
    passport_id: summary.passport.id,
    passport_version_id: summary.draftVersion.id,
    user_id: user.id,
    document_type: kind,
    file_name: file.name,
    storage_bucket: rentalHistoryDocumentBucket,
    storage_path: storagePath,
    mime_type: file.type,
    file_size: file.size,
  });
  if (documentResponse.error) throw documentResponse.error;

  await updatePassportSectionStatus(user, 'rental_history', 'in_progress');
  await recordRentalHistoryActivity(summary.passport.id, user.id, 'rental_history_document_uploaded', `${documentKindLabel(kind)} uploaded.`);
  return getRentalHistoryModuleState(user);
}

export async function markRentalHistoryReadyForReview(user: User, records: RentalHistoryRecordForm[]): Promise<RentalHistoryModuleState> {
  validateReadyForReview(records);
  await saveRentalHistoryDraft(user, records);

  if (!supabase) {
    const saved = records.map((record) => createDemoRentalRecord(user.id, record, 'ready_for_review'));
    return { records: saved, documents: [], signals: buildRentalHistorySignals(saved, []), status: 'ready_for_review' };
  }

  const summary = await getOrCreatePassportSummary(user);
  const state = await getRentalHistoryModuleState(user);
  for (const record of state.records) {
    const request = await supabase.from('rental_history_verification_requests').insert({
      rental_history_record_id: record.id,
      passport_id: summary.passport.id,
      passport_version_id: summary.draftVersion.id,
      user_id: user.id,
      status: 'ready_for_review',
    });
    if (request.error) throw request.error;
  }

  const update = await supabase.from('rental_history_records').update({ verification_request_status: 'ready_for_review' }).eq('passport_id', summary.passport.id).eq('passport_version_id', summary.draftVersion.id).eq('user_id', user.id);
  if (update.error) throw update.error;

  await updatePassportSectionStatus(user, 'rental_history', 'ready_for_review');
  await recordRentalHistoryActivity(summary.passport.id, user.id, 'rental_history_ready_for_review', 'Rental history section marked ready for review.');
  return getRentalHistoryModuleState(user);
}

export async function markRentalHistoryUnderReview(user: User): Promise<RentalHistoryModuleState> {
  if (!supabase) {
    const state = createDemoRentalHistoryState(user.id);
    return { ...state, status: 'under_review' };
  }

  const summary = await getOrCreatePassportSummary(user);
  const update = await supabase.from('rental_history_records').update({ verification_request_status: 'under_review' }).eq('passport_id', summary.passport.id).eq('passport_version_id', summary.draftVersion.id).eq('user_id', user.id);
  if (update.error) throw update.error;

  await updatePassportSectionStatus(user, 'rental_history', 'under_review');
  await recordRentalHistoryActivity(summary.passport.id, user.id, 'section_updated', 'Rental history review placeholder started.');
  return getRentalHistoryModuleState(user);
}

function validateReadyForReview(records: RentalHistoryRecordForm[]) {
  if (records.length === 0) throw new Error('Add at least one rental record before requesting review.');

  const invalid = records.find((record) => {
    const hasDates = Boolean(record.move_in_date && (record.is_current_residence || record.move_out_date));
    const hasConsent = record.consent_contact_manager && record.consent_review_documents && record.consent_use_in_passport && record.consent_share_summary;
    return !record.property_address || !record.city || !record.province_state || !record.country || !record.postal_code || !hasDates || !record.monthly_rent || !record.manager_name || !record.manager_email || !hasConsent;
  });

  if (invalid) throw new Error('Complete required rental records and consent before review.');
}

function validateRentalHistoryFile(file: File) {
  const maxBytes = 10 * 1024 * 1024;
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (file.size > maxBytes) throw new Error('Rental history documents must be 10MB or smaller.');
  if (file.type && !allowedTypes.includes(file.type)) throw new Error('Rental history documents must be PDF, JPG, or PNG files.');
}

async function upsertRentalHistoryRecord(userId: string, passportId: string, versionId: string, record: RentalHistoryRecordForm, status: RentalHistoryVerificationRequestStatus): Promise<RentalHistoryRecord> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const response = await supabase
    .from('rental_history_records')
    .upsert(
      {
        id: record.id,
        passport_id: passportId,
        passport_version_id: versionId,
        user_id: userId,
        property_address: record.property_address,
        unit_number: record.unit_number || null,
        city: record.city,
        province_state: record.province_state,
        country: record.country,
        postal_code: record.postal_code,
        move_in_date: record.move_in_date || null,
        move_out_date: record.is_current_residence ? null : record.move_out_date || null,
        is_current_residence: record.is_current_residence,
        monthly_rent: record.monthly_rent ? Number(record.monthly_rent) : null,
        relationship_type: record.relationship_type,
        reason_for_leaving: record.reason_for_leaving || null,
        consent_contact_manager: record.consent_contact_manager,
        consent_review_documents: record.consent_review_documents,
        consent_use_in_passport: record.consent_use_in_passport,
        consent_share_summary: record.consent_share_summary,
        verification_request_status: status,
      },
      { onConflict: 'id' },
    )
    .select()
    .single();

  if (response.error) throw response.error;
  return response.data as RentalHistoryRecord;
}

async function upsertRentalHistoryContact(recordId: string, record: RentalHistoryRecordForm) {
  if (!supabase) return;
  const response = await supabase.from('rental_history_contacts').upsert(
    {
      rental_history_record_id: recordId,
      manager_name: record.manager_name,
      manager_email: record.manager_email,
      manager_phone: record.manager_phone || null,
      relationship_type: record.relationship_type,
    },
    { onConflict: 'rental_history_record_id' },
  );
  if (response.error) throw response.error;
}

async function hydrateRentalHistoryRecords(records: RentalHistoryRecord[]): Promise<RentalHistoryRecord[]> {
  if (!supabase || records.length === 0) return records;
  const contacts = await supabase.from('rental_history_contacts').select('*').in('rental_history_record_id', records.map((record) => record.id));
  if (contacts.error) throw contacts.error;

  return records.map((record) => {
    const contact = contacts.data?.find((item) => item.rental_history_record_id === record.id);
    return {
      ...record,
      local_id: record.id,
      monthly_rent: record.monthly_rent ? String(record.monthly_rent) : '',
      move_out_date: record.move_out_date ?? '',
      unit_number: record.unit_number ?? '',
      reason_for_leaving: record.reason_for_leaving ?? '',
      manager_name: contact?.manager_name ?? '',
      manager_email: contact?.manager_email ?? '',
      manager_phone: contact?.manager_phone ?? '',
      relationship_type: contact?.relationship_type ?? record.relationship_type,
    };
  });
}

async function getRentalHistoryDocuments(passportId: string, versionId: string): Promise<RentalHistoryDocument[]> {
  if (!supabase) return [];
  const response = await supabase.from('rental_history_documents').select('*').eq('passport_id', passportId).eq('passport_version_id', versionId).order('created_at', { ascending: false });
  if (response.error) throw response.error;

  return (response.data ?? []).map((document) => ({
    id: document.id as string,
    rentalRecordId: document.rental_history_record_id as string,
    name: document.file_name as string,
    kind: documentKindLabel(document.document_type as RentalHistoryDocumentKind),
    uploadedAt: document.created_at as string,
    storagePath: document.storage_path as string,
  }));
}

async function logRentalHistoryConsents(userId: string, recordId: string, record: RentalHistoryRecordForm) {
  if (!supabase) return;
  const consentTypes = [
    record.consent_contact_manager && 'rental_history:contact_manager',
    record.consent_review_documents && 'rental_history:review_documents',
    record.consent_use_in_passport && 'rental_history:use_in_passport',
    record.consent_share_summary && 'rental_history:share_verified_summary',
  ].filter(Boolean) as string[];

  if (consentTypes.length === 0) return;

  const response = await supabase.from('consent_records').insert(
    consentTypes.map((consentType) => ({
      user_id: userId,
      consent_type: consentType,
      consent_version: rentalHistoryConsentVersion,
      metadata: { rental_history_record_id: recordId },
    })),
  );
  if (response.error) throw response.error;
}

async function upsertRentalHistorySignals(records: RentalHistoryRecord[]) {
  if (!supabase) return;
  const rows = records.flatMap((record) =>
    buildSignalsForRecord(record, []).map((signal) => ({
      rental_history_record_id: record.id,
      signal_key: signal.key,
      signal_label: signal.label,
      is_present: signal.complete,
    })),
  );
  if (rows.length === 0) return;

  const response = await supabase.from('rental_history_verification_signals').upsert(rows, { onConflict: 'rental_history_record_id,signal_key' });
  if (response.error) throw response.error;
}

async function recordRentalHistoryActivity(passportId: string, actorUserId: string, eventType: PassportActivityEvent, description: string) {
  if (!supabase) return;
  await supabase.from('passport_activity_logs').insert({
    passport_id: passportId,
    actor_user_id: actorUserId,
    event_type: eventType,
    description,
    visibility: 'internal',
  });
}

function buildRentalHistorySignals(records: RentalHistoryRecord[], documents: RentalHistoryDocument[]): RentalHistorySignal[] {
  if (records.length === 0) return buildSignalsForRecord(null, documents);
  const signals = records.flatMap((record) => buildSignalsForRecord(record, documents.filter((document) => document.rentalRecordId === record.id)));
  const grouped = new Map<string, RentalHistorySignal>();
  for (const signal of signals) {
    const existing = grouped.get(signal.key);
    grouped.set(signal.key, { ...signal, complete: Boolean(existing?.complete || signal.complete) });
  }
  return Array.from(grouped.values());
}

function buildSignalsForRecord(record: RentalHistoryRecord | null, documents: RentalHistoryDocument[]): RentalHistorySignal[] {
  return [
    { key: 'address_provided', label: 'Address provided', complete: Boolean(record?.property_address && record?.city && record?.province_state && record?.postal_code) },
    { key: 'address_valid_placeholder', label: 'Property address appears valid placeholder', complete: Boolean(record?.property_address && record?.postal_code) },
    { key: 'lease_uploaded', label: 'Lease uploaded', complete: documents.some((document) => document.kind === 'Lease Agreement') },
    { key: 'manager_contact', label: 'Landlord/property manager contact provided', complete: Boolean(record?.manager_name && record?.manager_email) },
    { key: 'tenant_consent', label: 'Tenant consent recorded', complete: Boolean(record?.consent_contact_manager && record?.consent_review_documents && record?.consent_use_in_passport && record?.consent_share_summary) },
    { key: 'verification_request_ready', label: 'Verification request ready', complete: Boolean(record?.property_address && record?.manager_email && record?.move_in_date) },
    { key: 'response_received_placeholder', label: 'Landlord/property manager response received placeholder', complete: false },
    { key: 'dates_match_lease_placeholder', label: 'Dates match uploaded lease placeholder', complete: documents.some((document) => document.kind === 'Lease Agreement') },
    { key: 'rent_proof_optional', label: 'Optional rent proof uploaded', complete: documents.some((document) => document.kind === 'Optional Rent Payment Proof') },
    { key: 'manual_review', label: 'Manual review needed', complete: Boolean(record?.property_address && record?.move_in_date) },
  ];
}

function getAggregateStatus(records: RentalHistoryRecord[]): RentalHistoryVerificationRequestStatus {
  if (records.length === 0) return 'draft';
  if (records.some((record) => record.verification_request_status === 'needs_reverification')) return 'needs_reverification';
  if (records.some((record) => record.verification_request_status === 'under_review')) return 'under_review';
  if (records.every((record) => record.verification_request_status === 'ready_for_review')) return 'ready_for_review';
  if (records.every((record) => record.verification_request_status === 'verified')) return 'verified';
  return 'draft';
}

function createDemoRentalHistoryState(userId: string): RentalHistoryModuleState {
  const record = createDemoRentalRecord(userId, createEmptyRentalRecord(), 'draft');
  const documents: RentalHistoryDocument[] = [];
  return { records: [record], documents, signals: buildRentalHistorySignals([record], documents), status: 'draft' };
}

function createDemoRentalRecord(userId: string, form: RentalHistoryRecordForm, status: RentalHistoryVerificationRequestStatus): RentalHistoryRecord {
  const now = new Date().toISOString();
  return {
    ...form,
    id: form.id ?? form.local_id,
    passport_id: 'demo-passport',
    passport_version_id: 'demo-version-1',
    user_id: userId,
    verification_request_status: status,
    created_at: now,
    updated_at: now,
  };
}

function documentKindLabel(kind: RentalHistoryDocumentKind) {
  const labels: Record<RentalHistoryDocumentKind, string> = {
    lease_agreement: 'Lease Agreement',
    rent_receipt: 'Rent Receipt',
    tenant_ledger: 'Tenant Ledger',
    move_in_out_document: 'Move-in/Move-out Document',
    landlord_letter: 'Landlord Letter',
    rent_payment_proof: 'Optional Rent Payment Proof',
    other: 'Other Supporting Document',
  };
  return labels[kind];
}

export function rentalHistoryRequestToSectionStatus(status: RentalHistoryVerificationRequestStatus): PassportSectionStatus {
  if (status === 'draft') return 'in_progress';
  return status;
}
