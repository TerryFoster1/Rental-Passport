import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getOrCreatePassportSummary, updatePassportSectionStatus } from '@/services/passportService';
import type { PassportActivityEvent, PassportSectionStatus } from '@/types/passport';
import type { ReferenceFormData, ReferenceRecord, ReferencesModuleState, ReferenceSignal, ReferenceVerificationRequestStatus } from '@/types/references';

const referenceConsentVersion = 'references-consent-v1';

export function createEmptyReference(): ReferenceFormData {
  return {
    local_id: crypto.randomUUID(),
    category: 'professional',
    reference_name: '',
    relationship: 'manager',
    company: '',
    email: '',
    phone: '',
    preferred_contact_method: 'email',
    years_known: '',
    comments: '',
    country: 'Canada',
    province_state: '',
    consent_contact_reference: false,
    consent_verify_information: false,
    consent_store_results: false,
    consent_share_summary: false,
  };
}

export async function getReferencesModuleState(user: User): Promise<ReferencesModuleState> {
  if (!supabase) return createDemoReferencesState(user.id);

  const summary = await getOrCreatePassportSummary(user);
  const response = await supabase.from('references').select('*').eq('passport_id', summary.passport.id).eq('passport_version_id', summary.draftVersion.id).order('created_at', { ascending: true });
  if (response.error) throw response.error;

  const references = ((response.data ?? []) as ReferenceRecord[]).map(hydrateReferenceRecord);
  return {
    references,
    signals: buildReferenceSignals(references),
    status: getAggregateStatus(references),
  };
}

export async function saveReferencesDraft(user: User, references: ReferenceFormData[]): Promise<ReferencesModuleState> {
  if (references.length === 0) throw new Error('Add at least one reference before saving.');

  if (!supabase) {
    const saved = references.map((reference) => createDemoReferenceRecord(user.id, reference, 'draft'));
    return { references: saved, signals: buildReferenceSignals(saved), status: 'draft' };
  }

  const summary = await getOrCreatePassportSummary(user);
  const existingResponse = await supabase.from('references').select('id, verification_request_status').eq('passport_id', summary.passport.id).eq('passport_version_id', summary.draftVersion.id);
  if (existingResponse.error) throw existingResponse.error;

  const submittedIds = new Set(references.map((reference) => reference.id).filter(Boolean));
  const removedIds = (existingResponse.data ?? []).map((reference) => reference.id as string).filter((id) => !submittedIds.has(id));
  if (removedIds.length > 0) {
    const deleteResponse = await supabase.from('references').delete().in('id', removedIds);
    if (deleteResponse.error) throw deleteResponse.error;
  }

  let changedAfterVerification = false;
  for (const reference of references) {
    const existing = (existingResponse.data ?? []).find((item) => item.id === reference.id);
    changedAfterVerification = changedAfterVerification || existing?.verification_request_status === 'verified';
    const nextStatus: ReferenceVerificationRequestStatus = existing?.verification_request_status === 'verified' ? 'needs_reverification' : (existing?.verification_request_status as ReferenceVerificationRequestStatus | undefined) ?? 'draft';
    const savedReference = await upsertReference(user.id, summary.passport.id, summary.draftVersion.id, reference, nextStatus);
    await logReferenceConsents(user.id, savedReference.id, reference);
  }

  const state = await getReferencesModuleState(user);
  await upsertReferenceSignals(state.references);
  await updatePassportSectionStatus(user, 'references', changedAfterVerification ? 'needs_reverification' : 'in_progress');
  await recordReferenceActivity(summary.passport.id, user.id, changedAfterVerification ? 'references_needs_reverification' : 'references_draft_saved', changedAfterVerification ? 'Reference changes require reverification.' : 'References draft saved.');
  return getReferencesModuleState(user);
}

export async function markReferencesReadyForReview(user: User, references: ReferenceFormData[]): Promise<ReferencesModuleState> {
  validateReadyForReview(references);
  await saveReferencesDraft(user, references);

  if (!supabase) {
    const saved = references.map((reference) => createDemoReferenceRecord(user.id, reference, 'ready_for_review'));
    return { references: saved, signals: buildReferenceSignals(saved), status: 'ready_for_review' };
  }

  const summary = await getOrCreatePassportSummary(user);
  const state = await getReferencesModuleState(user);
  for (const reference of state.references) {
    const request = await supabase.from('reference_verification_requests').insert({
      reference_id: reference.id,
      passport_id: summary.passport.id,
      passport_version_id: summary.draftVersion.id,
      user_id: user.id,
      status: 'ready_for_review',
    });
    if (request.error) throw request.error;
  }

  const update = await supabase.from('references').update({ verification_request_status: 'ready_for_review' }).eq('passport_id', summary.passport.id).eq('passport_version_id', summary.draftVersion.id).eq('user_id', user.id);
  if (update.error) throw update.error;

  await updatePassportSectionStatus(user, 'references', 'ready_for_review');
  await recordReferenceActivity(summary.passport.id, user.id, 'references_ready_for_review', 'References section marked ready for review.');
  return getReferencesModuleState(user);
}

export async function markReferencesUnderReview(user: User): Promise<ReferencesModuleState> {
  if (!supabase) {
    const state = createDemoReferencesState(user.id);
    return { ...state, status: 'under_review' };
  }

  const summary = await getOrCreatePassportSummary(user);
  const update = await supabase.from('references').update({ verification_request_status: 'under_review' }).eq('passport_id', summary.passport.id).eq('passport_version_id', summary.draftVersion.id).eq('user_id', user.id);
  if (update.error) throw update.error;

  await updatePassportSectionStatus(user, 'references', 'under_review');
  await recordReferenceActivity(summary.passport.id, user.id, 'section_updated', 'References review placeholder started.');
  return getReferencesModuleState(user);
}

function validateReadyForReview(references: ReferenceFormData[]) {
  if (references.length === 0) throw new Error('Add at least one reference before requesting review.');

  const invalid = references.find(
    (reference) =>
      !reference.reference_name ||
      !reference.email ||
      !reference.phone ||
      !reference.years_known ||
      !reference.country ||
      !reference.province_state ||
      !reference.consent_contact_reference ||
      !reference.consent_verify_information ||
      !reference.consent_store_results ||
      !reference.consent_share_summary,
  );

  if (invalid) throw new Error('Complete required reference details and consent before review.');
}

async function upsertReference(userId: string, passportId: string, versionId: string, reference: ReferenceFormData, status: ReferenceVerificationRequestStatus): Promise<ReferenceRecord> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const response = await supabase
    .from('references')
    .upsert(
      {
        id: reference.id,
        passport_id: passportId,
        passport_version_id: versionId,
        user_id: userId,
        category: reference.category,
        reference_name: reference.reference_name,
        relationship: reference.relationship,
        company: reference.company || null,
        email: reference.email,
        phone: reference.phone,
        preferred_contact_method: reference.preferred_contact_method,
        years_known: reference.years_known ? Number(reference.years_known) : null,
        comments: reference.comments || null,
        country: reference.country,
        province_state: reference.province_state,
        consent_contact_reference: reference.consent_contact_reference,
        consent_verify_information: reference.consent_verify_information,
        consent_store_results: reference.consent_store_results,
        consent_share_summary: reference.consent_share_summary,
        verification_request_status: status,
      },
      { onConflict: 'id' },
    )
    .select()
    .single();

  if (response.error) throw response.error;
  return hydrateReferenceRecord(response.data as ReferenceRecord);
}

function hydrateReferenceRecord(reference: ReferenceRecord): ReferenceRecord {
  return {
    ...reference,
    local_id: reference.id,
    company: reference.company ?? '',
    comments: reference.comments ?? '',
    years_known: reference.years_known ? String(reference.years_known) : '',
  };
}

async function logReferenceConsents(userId: string, referenceId: string, reference: ReferenceFormData) {
  if (!supabase) return;
  const consentTypes = [
    reference.consent_contact_reference && 'references:contact_reference',
    reference.consent_verify_information && 'references:verify_information',
    reference.consent_store_results && 'references:store_results',
    reference.consent_share_summary && 'references:share_verified_summary',
  ].filter(Boolean) as string[];

  if (consentTypes.length === 0) return;

  const response = await supabase.from('consent_records').insert(
    consentTypes.map((consentType) => ({
      user_id: userId,
      consent_type: consentType,
      consent_version: referenceConsentVersion,
      metadata: { reference_id: referenceId },
    })),
  );
  if (response.error) throw response.error;
}

async function upsertReferenceSignals(references: ReferenceRecord[]) {
  if (!supabase) return;
  const rows = references.flatMap((reference) =>
    buildSignalsForReference(reference).map((signal) => ({
      reference_id: reference.id,
      signal_key: signal.key,
      signal_label: signal.label,
      is_present: signal.complete,
    })),
  );
  if (rows.length === 0) return;

  const response = await supabase.from('reference_verification_signals').upsert(rows, { onConflict: 'reference_id,signal_key' });
  if (response.error) throw response.error;
}

async function recordReferenceActivity(passportId: string, actorUserId: string, eventType: PassportActivityEvent, description: string) {
  if (!supabase) return;
  await supabase.from('passport_activity_logs').insert({
    passport_id: passportId,
    actor_user_id: actorUserId,
    event_type: eventType,
    description,
    visibility: 'internal',
  });
}

function buildReferenceSignals(references: ReferenceRecord[]): ReferenceSignal[] {
  if (references.length === 0) return buildSignalsForReference(null);
  const signals = references.flatMap((reference) => buildSignalsForReference(reference));
  const grouped = new Map<string, ReferenceSignal>();
  for (const signal of signals) {
    const existing = grouped.get(signal.key);
    grouped.set(signal.key, { ...signal, complete: Boolean(existing?.complete || signal.complete) });
  }
  return Array.from(grouped.values());
}

function buildSignalsForReference(reference: ReferenceRecord | null): ReferenceSignal[] {
  return [
    { key: 'reference_added', label: 'Reference added', complete: Boolean(reference?.reference_name) },
    { key: 'consent_given', label: 'Consent given', complete: Boolean(reference?.consent_contact_reference && reference?.consent_verify_information && reference?.consent_store_results && reference?.consent_share_summary) },
    { key: 'ready_for_review', label: 'Reference ready for review', complete: Boolean(reference?.reference_name && reference?.email && reference?.phone && reference?.years_known) },
    { key: 'contacted_future', label: 'Reference contacted placeholder', complete: false },
    { key: 'responded_future', label: 'Reference responded placeholder', complete: false },
    { key: 'verified_future', label: 'Reference verified placeholder', complete: false },
    { key: 'manual_review', label: 'Manual review required', complete: Boolean(reference?.reference_name && reference?.email) },
    { key: 'ai_summary_future', label: 'Future AI summary available placeholder', complete: false },
  ];
}

function getAggregateStatus(references: ReferenceRecord[]): ReferenceVerificationRequestStatus {
  if (references.length === 0) return 'draft';
  if (references.some((reference) => reference.verification_request_status === 'needs_reverification')) return 'needs_reverification';
  if (references.some((reference) => reference.verification_request_status === 'under_review')) return 'under_review';
  if (references.every((reference) => reference.verification_request_status === 'ready_for_review')) return 'ready_for_review';
  if (references.every((reference) => reference.verification_request_status === 'verified')) return 'verified';
  return 'draft';
}

function createDemoReferencesState(userId: string): ReferencesModuleState {
  const reference = createDemoReferenceRecord(userId, createEmptyReference(), 'draft');
  return { references: [reference], signals: buildReferenceSignals([reference]), status: 'draft' };
}

function createDemoReferenceRecord(userId: string, reference: ReferenceFormData, status: ReferenceVerificationRequestStatus): ReferenceRecord {
  const now = new Date().toISOString();
  return {
    ...reference,
    id: reference.id ?? reference.local_id,
    passport_id: 'demo-passport',
    passport_version_id: 'demo-version-1',
    user_id: userId,
    verification_request_status: status,
    created_at: now,
    updated_at: now,
  };
}

export function referencesRequestToSectionStatus(status: ReferenceVerificationRequestStatus): PassportSectionStatus {
  if (status === 'draft') return 'in_progress';
  return status;
}
