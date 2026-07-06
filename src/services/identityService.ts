import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getOrCreatePassportSummary, updatePassportSectionStatus } from '@/services/passportService';
import type { PassportActivityEvent, PassportSectionStatus } from '@/types/passport';
import type { IdentityDocument, IdentityFormData, IdentityModuleState, IdentityProfile, IdentitySignal, IdentityUploadKind, IdentityVerificationRequestStatus } from '@/types/identity';

const identityConsentVersion = 'identity-consent-v1';
const identityDocumentBucket = 'identity-documents';

export const emptyIdentityForm: IdentityFormData = {
  legal_first_name: '',
  middle_name: '',
  legal_last_name: '',
  preferred_name: '',
  date_of_birth: '',
  country: 'Canada',
  province_state: 'Ontario',
  current_address: '',
  email: '',
  phone_number: '',
  id_document_type: 'drivers_licence',
  consent_review_government_id: false,
  consent_review_selfie: false,
  consent_confirm_legal_identity: false,
  consent_store_verification_result: false,
  consent_share_identity_status: false,
};

export async function getIdentityModuleState(user: User): Promise<IdentityModuleState> {
  if (!supabase) return createDemoIdentityState(user);

  const summary = await getOrCreatePassportSummary(user);
  const response = await supabase.from('identity_profiles').select('*').eq('passport_id', summary.passport.id).eq('passport_version_id', summary.draftVersion.id).maybeSingle();
  if (response.error) throw response.error;

  const profile = response.data ? hydrateIdentityProfile(response.data as IdentityProfile, user) : null;
  const documents = profile ? await getIdentityDocuments(profile.id) : [];
  return {
    profile,
    documents,
    signals: buildIdentitySignals(profile, documents),
    status: profile?.verification_request_status ?? 'draft',
  };
}

export async function saveIdentityDraft(user: User, form: IdentityFormData): Promise<IdentityModuleState> {
  if (!supabase) {
    const profile = createDemoIdentityProfile(user, form, 'draft');
    return { profile, documents: [], signals: buildIdentitySignals(profile, []), status: 'draft' };
  }

  const summary = await getOrCreatePassportSummary(user);
  const existing = await getExistingIdentityProfile(summary.passport.id, summary.draftVersion.id);
  const changedAfterVerification = existing?.verification_request_status === 'verified';
  const nextStatus: IdentityVerificationRequestStatus = changedAfterVerification ? 'needs_reverification' : existing?.verification_request_status ?? 'draft';

  const response = await supabase
    .from('identity_profiles')
    .upsert(
      {
        id: existing?.id,
        passport_id: summary.passport.id,
        passport_version_id: summary.draftVersion.id,
        user_id: user.id,
        legal_first_name: form.legal_first_name,
        middle_name: form.middle_name || null,
        legal_last_name: form.legal_last_name,
        preferred_name: form.preferred_name || null,
        date_of_birth: form.date_of_birth || null,
        country: form.country,
        province_state: form.province_state,
        current_address: form.current_address,
        email: form.email || user.email || '',
        phone_number: form.phone_number || null,
        id_document_type: form.id_document_type,
        email_verified: Boolean(user.email_confirmed_at),
        phone_verification_status: existing?.phone_verification_status ?? 'manual_pending',
        consent_review_government_id: form.consent_review_government_id,
        consent_review_selfie: form.consent_review_selfie,
        consent_confirm_legal_identity: form.consent_confirm_legal_identity,
        consent_store_verification_result: form.consent_store_verification_result,
        consent_share_identity_status: form.consent_share_identity_status,
        verification_request_status: nextStatus,
      },
      { onConflict: 'id' },
    )
    .select()
    .single();
  if (response.error) throw response.error;

  const profile = hydrateIdentityProfile(response.data as IdentityProfile, user);
  await logIdentityConsents(user.id, profile.id, form);
  await upsertIdentitySignals(profile.id, buildIdentitySignals(profile, []));
  await updatePassportSectionStatus(user, 'identity_confirmation', changedAfterVerification ? 'needs_reverification' : 'in_progress');
  await recordIdentityActivity(summary.passport.id, user.id, changedAfterVerification ? 'identity_needs_reverification' : 'identity_draft_saved', changedAfterVerification ? 'Identity changes require reverification.' : 'Identity draft saved.');
  return getIdentityModuleState(user);
}

export async function uploadIdentityDocument(user: User, kind: IdentityUploadKind, file: File): Promise<IdentityModuleState> {
  validateIdentityFile(file);

  if (!supabase) {
    const state = createDemoIdentityState(user);
    return {
      ...state,
      documents: [...state.documents, createDemoIdentityDocument(kind, file.name)],
    };
  }

  const summary = await getOrCreatePassportSummary(user);
  const existing = await getExistingIdentityProfile(summary.passport.id, summary.draftVersion.id);
  if (!existing) throw new Error('Save identity details before uploading documents.');

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const storagePath = `${user.id}/${summary.passport.id}/${summary.draftVersion.id}/${kind}-${crypto.randomUUID()}.${extension}`;
  const upload = await supabase.storage.from(identityDocumentBucket).upload(storagePath, file, { cacheControl: '3600', upsert: false });
  if (upload.error) throw upload.error;

  const response = await supabase.from('identity_documents').insert({
    identity_profile_id: existing.id,
    passport_id: summary.passport.id,
    passport_version_id: summary.draftVersion.id,
    user_id: user.id,
    upload_kind: kind,
    document_type: existing.id_document_type,
    file_name: file.name,
    storage_bucket: identityDocumentBucket,
    storage_path: storagePath,
    mime_type: file.type,
    file_size: file.size,
  });
  if (response.error) throw response.error;

  await updatePassportSectionStatus(user, 'identity_confirmation', 'in_progress');
  await recordIdentityActivity(summary.passport.id, user.id, 'identity_document_uploaded', `${documentKindLabel(kind)} uploaded.`);
  return getIdentityModuleState(user);
}

export async function markIdentityReadyForReview(user: User, form: IdentityFormData): Promise<IdentityModuleState> {
  validateReadyForReview(form);
  await saveIdentityDraft(user, form);

  if (!supabase) {
    const profile = createDemoIdentityProfile(user, form, 'ready_for_review');
    return { profile, documents: [], signals: buildIdentitySignals(profile, []), status: 'ready_for_review' };
  }

  const summary = await getOrCreatePassportSummary(user);
  const existing = await getExistingIdentityProfile(summary.passport.id, summary.draftVersion.id);
  if (!existing) throw new Error('Identity profile was not created.');

  const request = await supabase.from('identity_verification_requests').insert({
    identity_profile_id: existing.id,
    passport_id: summary.passport.id,
    passport_version_id: summary.draftVersion.id,
    user_id: user.id,
    status: 'ready_for_review',
  });
  if (request.error) throw request.error;

  const update = await supabase.from('identity_profiles').update({ verification_request_status: 'ready_for_review' }).eq('id', existing.id);
  if (update.error) throw update.error;

  await updatePassportSectionStatus(user, 'identity_confirmation', 'ready_for_review');
  await recordIdentityActivity(summary.passport.id, user.id, 'identity_ready_for_review', 'Identity section marked ready for review.');
  return getIdentityModuleState(user);
}

export async function markIdentityUnderReview(user: User): Promise<IdentityModuleState> {
  if (!supabase) {
    const state = createDemoIdentityState(user);
    return { ...state, status: 'under_review' };
  }

  const summary = await getOrCreatePassportSummary(user);
  const existing = await getExistingIdentityProfile(summary.passport.id, summary.draftVersion.id);
  if (!existing) throw new Error('Identity profile was not created.');

  const update = await supabase.from('identity_profiles').update({ verification_request_status: 'under_review' }).eq('id', existing.id);
  if (update.error) throw update.error;

  await updatePassportSectionStatus(user, 'identity_confirmation', 'under_review');
  await recordIdentityActivity(summary.passport.id, user.id, 'section_updated', 'Identity review placeholder started.');
  return getIdentityModuleState(user);
}

function validateReadyForReview(form: IdentityFormData) {
  const missing = [
    !form.legal_first_name && 'legal first name',
    !form.legal_last_name && 'legal last name',
    !form.date_of_birth && 'date of birth',
    !form.country && 'country',
    !form.province_state && 'province/state',
    !form.current_address && 'current address',
    !form.email && 'email',
    !form.phone_number && 'phone number',
    !form.consent_review_government_id && 'consent to review government ID',
    !form.consent_review_selfie && 'consent to review selfie',
    !form.consent_confirm_legal_identity && 'consent to confirm legal identity',
    !form.consent_store_verification_result && 'consent to store verification result',
    !form.consent_share_identity_status && 'consent to share identity status',
  ].filter(Boolean);
  if (missing.length > 0) throw new Error(`Complete required identity fields before review: ${missing.join(', ')}.`);
}

function validateIdentityFile(file: File) {
  const maxBytes = 10 * 1024 * 1024;
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (file.size > maxBytes) throw new Error('Identity files must be 10MB or smaller.');
  if (file.type && !allowedTypes.includes(file.type)) throw new Error('Identity files must be PDF, JPG, or PNG files.');
}

async function getExistingIdentityProfile(passportId: string, versionId: string): Promise<IdentityProfile | null> {
  if (!supabase) return null;
  const response = await supabase.from('identity_profiles').select('*').eq('passport_id', passportId).eq('passport_version_id', versionId).maybeSingle();
  if (response.error) throw response.error;
  return response.data as IdentityProfile | null;
}

async function getIdentityDocuments(profileId: string): Promise<IdentityDocument[]> {
  if (!supabase) return [];
  const response = await supabase.from('identity_documents').select('*').eq('identity_profile_id', profileId).order('created_at', { ascending: false });
  if (response.error) throw response.error;
  return (response.data ?? []).map((document) => ({
    id: document.id as string,
    name: document.file_name as string,
    kind: documentKindLabel(document.upload_kind as IdentityUploadKind),
    uploadKind: document.upload_kind as IdentityUploadKind,
    uploadedAt: document.created_at as string,
    storagePath: document.storage_path as string,
  }));
}

async function logIdentityConsents(userId: string, profileId: string, form: IdentityFormData) {
  if (!supabase) return;
  const consentTypes = [
    form.consent_review_government_id && 'identity:review_government_id',
    form.consent_review_selfie && 'identity:review_selfie',
    form.consent_confirm_legal_identity && 'identity:confirm_legal_identity',
    form.consent_store_verification_result && 'identity:store_verification_result',
    form.consent_share_identity_status && 'identity:share_verified_status',
  ].filter(Boolean) as string[];

  if (consentTypes.length === 0) return;

  const response = await supabase.from('consent_records').insert(
    consentTypes.map((consentType) => ({
      user_id: userId,
      consent_type: consentType,
      consent_version: identityConsentVersion,
      metadata: { identity_profile_id: profileId },
    })),
  );
  if (response.error) throw response.error;
}

async function upsertIdentitySignals(profileId: string, signals: IdentitySignal[]) {
  if (!supabase) return;
  const response = await supabase.from('identity_verification_signals').upsert(
    signals.map((signal) => ({
      identity_profile_id: profileId,
      signal_key: signal.key,
      signal_label: signal.label,
      is_present: signal.complete,
    })),
    { onConflict: 'identity_profile_id,signal_key' },
  );
  if (response.error) throw response.error;
}

async function recordIdentityActivity(passportId: string, actorUserId: string, eventType: PassportActivityEvent, description: string) {
  if (!supabase) return;
  await supabase.from('passport_activity_logs').insert({
    passport_id: passportId,
    actor_user_id: actorUserId,
    event_type: eventType,
    description,
    visibility: 'internal',
  });
}

function hydrateIdentityProfile(profile: IdentityProfile, user: User): IdentityProfile {
  return {
    ...emptyIdentityForm,
    ...profile,
    email: profile.email || user.email || '',
    phone_number: profile.phone_number ?? '',
    middle_name: profile.middle_name ?? '',
    preferred_name: profile.preferred_name ?? '',
    date_of_birth: profile.date_of_birth ?? '',
    email_verified: Boolean(user.email_confirmed_at || profile.email_verified),
    phone_verification_status: profile.phone_verification_status ?? 'manual_pending',
  };
}

function buildIdentitySignals(profile: IdentityProfile | null, documents: IdentityDocument[]): IdentitySignal[] {
  return [
    { key: 'legal_details', label: 'Legal identity details provided', complete: Boolean(profile?.legal_first_name && profile?.legal_last_name && profile?.date_of_birth) },
    { key: 'address_provided', label: 'Current address provided', complete: Boolean(profile?.current_address && profile?.country && profile?.province_state) },
    { key: 'email_verified', label: 'Account email verified', complete: Boolean(profile?.email_verified) },
    { key: 'phone_placeholder', label: 'Phone confirmation placeholder ready', complete: Boolean(profile?.phone_number) },
    { key: 'id_front', label: 'Government ID front uploaded', complete: documents.some((document) => document.uploadKind === 'government_id_front') },
    { key: 'id_back', label: 'Government ID back uploaded', complete: documents.some((document) => document.uploadKind === 'government_id_back') },
    { key: 'selfie', label: 'Selfie uploaded for manual comparison', complete: documents.some((document) => document.uploadKind === 'selfie') },
    { key: 'tenant_consent', label: 'Identity consent recorded', complete: Boolean(profile?.consent_review_government_id && profile?.consent_review_selfie && profile?.consent_confirm_legal_identity && profile?.consent_store_verification_result && profile?.consent_share_identity_status) },
    { key: 'manual_review', label: 'Manual review needed', complete: Boolean(profile?.legal_first_name && profile?.legal_last_name) },
  ];
}

function createDemoIdentityState(user: User): IdentityModuleState {
  const profile = createDemoIdentityProfile(user, { ...emptyIdentityForm, email: user.email ?? '' }, 'draft');
  const documents: IdentityDocument[] = [];
  return { profile, documents, signals: buildIdentitySignals(profile, documents), status: 'draft' };
}

function createDemoIdentityProfile(user: User, form: IdentityFormData, status: IdentityVerificationRequestStatus): IdentityProfile {
  const now = new Date().toISOString();
  return {
    ...form,
    id: 'demo-identity-profile',
    passport_id: 'demo-passport',
    passport_version_id: 'demo-version-1',
    user_id: user.id,
    email: form.email || user.email || '',
    email_verified: Boolean(user.email_confirmed_at),
    phone_verification_status: 'manual_pending',
    verification_request_status: status,
    created_at: now,
    updated_at: now,
  };
}

function createDemoIdentityDocument(kind: IdentityUploadKind, fileName: string): IdentityDocument {
  return {
    id: crypto.randomUUID(),
    name: fileName,
    kind: documentKindLabel(kind),
    uploadKind: kind,
    uploadedAt: new Date().toISOString(),
    storagePath: `local/${fileName}`,
  };
}

function documentKindLabel(kind: IdentityUploadKind) {
  const labels: Record<IdentityUploadKind, string> = {
    government_id_front: 'Government ID Front',
    government_id_back: 'Government ID Back',
    selfie: 'Selfie',
  };
  return labels[kind];
}

export function identityRequestToSectionStatus(status: IdentityVerificationRequestStatus): PassportSectionStatus {
  if (status === 'draft') return 'in_progress';
  return status;
}
