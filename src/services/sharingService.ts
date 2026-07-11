import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getOrCreatePassportSummary } from '@/services/passportService';
import type { PassportActivityEvent, PassportSectionKey, PassportSummary } from '@/types/passport';
import type {
  LandlordApplication,
  LandlordApplicationDetail,
  LandlordApplicationStatus,
  PassportShare,
  SecureInviteState,
  ShareAccessEvent,
  ShareAccessLog,
  ShareFormData,
  ShareInvitation,
} from '@/types/sharing';

const invitationOrigin = () => window.location.origin;

export function defaultShareForm(summary: PassportSummary | null): ShareFormData {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  return {
    passport_version_id: summary?.currentVersion.id ?? summary?.draftVersion.id ?? '',
    landlord_name: '',
    landlord_email: '',
    property_address: '',
    expires_at: expiresAt.toISOString().slice(0, 10),
    message: '',
  };
}

export async function createPassportShare(user: User, input: ShareFormData): Promise<ShareInvitation> {
  validateShareInput(input);
  const summary = await getOrCreatePassportSummary(user);
  const token = createShareToken();
  const tokenHash = await hashShareToken(token);

  if (!supabase) {
    const share = createDemoShare(user.id, summary, input);
    return { token, share, invitationUrl: `${invitationOrigin()}/landlord/secure-access?token=${token}` };
  }

  const shareInsert = await supabase
    .from('passport_shares')
    .insert({
      passport_id: summary.passport.id,
      passport_version_id: input.passport_version_id,
      tenant_user_id: user.id,
      landlord_name: input.landlord_name.trim(),
      landlord_email: input.landlord_email.trim().toLowerCase(),
      property_address: input.property_address.trim() || null,
      message: input.message.trim() || null,
      expires_at: endOfDayIso(input.expires_at),
      status: 'active',
      invitation_sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (shareInsert.error) throw shareInsert.error;
  const share = shareInsert.data as PassportShare;

  const tokenInsert = await supabase.from('share_tokens').insert({
    passport_share_id: share.id,
    token_hash: tokenHash,
    intended_recipient_email: share.landlord_email,
    expires_at: share.expires_at,
  });
  if (tokenInsert.error) throw tokenInsert.error;

  const applicationInsert = await supabase.from('landlord_applications').insert({
    passport_share_id: share.id,
    passport_id: summary.passport.id,
    passport_version_id: share.passport_version_id,
    tenant_user_id: user.id,
    landlord_email: share.landlord_email,
    landlord_name: share.landlord_name,
    applicant_name: applicantName(summary),
    passport_number: summary.passport.passport_number,
    completeness: summary.progress.overall,
    verification_status: verificationLabel(summary),
    property_address: share.property_address,
    expires_at: share.expires_at,
    status: 'new',
  });
  if (applicationInsert.error) throw applicationInsert.error;

  await recordPassportActivity(summary.passport.id, user.id, 'passport_shared', `Passport shared securely with ${share.landlord_email}.`);
  await recordPassportActivity(summary.passport.id, user.id, 'invitation_sent', `Secure invitation sent to ${share.landlord_email}.`);

  return { token, share, invitationUrl: `${invitationOrigin()}/landlord/secure-access?token=${token}` };
}

export async function listTenantShares(user: User): Promise<PassportShare[]> {
  if (!supabase) {
    const summary = await getOrCreatePassportSummary(user);
    return [createDemoShare(user.id, summary, { ...defaultShareForm(summary), landlord_name: 'Greenview Property Management', landlord_email: 'manager@example.com' })];
  }

  const { data, error } = await supabase.from('passport_shares').select('*').eq('tenant_user_id', user.id).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PassportShare[];
}

export async function revokePassportShare(user: User, shareId: string): Promise<void> {
  if (!supabase) return;

  const { data: share, error: shareError } = await supabase.from('passport_shares').select('passport_id, landlord_email').eq('id', shareId).eq('tenant_user_id', user.id).single();
  if (shareError) throw shareError;

  const { error } = await supabase
    .from('passport_shares')
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .eq('id', shareId)
    .eq('tenant_user_id', user.id);
  if (error) throw error;

  await supabase.from('share_tokens').update({ revoked_at: new Date().toISOString() }).eq('passport_share_id', shareId);
  await recordPassportActivity(String(share.passport_id), user.id, 'share_revoked', `Passport access revoked for ${share.landlord_email}.`);
}

export async function getTenantShareAccessLogs(user: User): Promise<ShareAccessLog[]> {
  if (!supabase) return [];

  const shares = await listTenantShares(user);
  const shareIds = shares.map((share) => share.id);
  if (shareIds.length === 0) return [];

  const { data, error } = await supabase.from('share_access_logs').select('*').in('passport_share_id', shareIds).order('created_at', { ascending: false }).limit(25);
  if (error) throw error;
  return (data ?? []) as ShareAccessLog[];
}

export async function getSecureInvite(token: string | null): Promise<SecureInviteState> {
  if (!token) return { status: 'missing_token', message: 'This secure invitation is missing its access token.' };
  const tokenHash = await hashShareToken(token);

  if (!supabase) {
    return { status: 'valid', share: createDemoShare('demo-tenant', createDemoSummary(), { ...defaultShareForm(null), landlord_name: 'Invited Landlord', landlord_email: 'manager@example.com' }) };
  }

  const shareRow = await supabase.rpc('get_share_invitation_by_hash', { token_hash_input: tokenHash });
  if (shareRow.error) throw shareRow.error;
  const share = (shareRow.data?.[0] ?? null) as PassportShare | null;
  if (!share) return { status: 'invalid', message: 'This secure invitation is invalid, expired, or has been revoked.' };
  if (share.status === 'revoked' || share.revoked_at) return { status: 'revoked', message: 'This invitation has been revoked by the applicant.' };
  if (share.status === 'expired' || new Date(share.expires_at).getTime() < Date.now()) return { status: 'expired', message: 'This invitation has expired.' };

  return { status: 'valid', share };
}

export async function activateSecureAccess(user: User, token: string): Promise<string> {
  const invitation = await getSecureInvite(token);
  if (invitation.status !== 'valid') throw new Error(invitation.message);

  const userEmail = user.email?.toLowerCase();
  if (!userEmail || userEmail !== invitation.share.landlord_email.toLowerCase()) {
    throw new Error('This invitation is restricted to the intended recipient email.');
  }

  if (!supabase) return 'demo-application';

  const appRow = await supabase
    .from('landlord_applications')
    .select('*')
    .eq('passport_share_id', invitation.share.id)
    .eq('landlord_email', userEmail)
    .single();
  if (appRow.error) throw appRow.error;

  await supabase.from('share_access_logs').insert({
    passport_share_id: invitation.share.id,
    landlord_application_id: appRow.data.id,
    actor_user_id: user.id,
    event_type: 'landlord_access_created',
    description: 'Landlord created secure access for the shared passport.',
  });
  await recordPassportActivity(invitation.share.passport_id, user.id, 'landlord_access_created', `${userEmail} created secure access.`);

  return String(appRow.data.id);
}

export async function listLandlordApplications(user: User): Promise<LandlordApplication[]> {
  const email = user.email?.toLowerCase();
  if (!email) return [];
  if (!supabase) return [createDemoApplication(email)];

  const { data, error } = await supabase.from('landlord_applications').select('*').eq('landlord_email', email).order('received_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as LandlordApplication[];
}

export async function getLandlordApplicationDetail(user: User, applicationId: string): Promise<LandlordApplicationDetail> {
  const email = user.email?.toLowerCase();
  if (!email) throw new Error('A verified email is required.');
  if (!supabase) return createDemoApplicationDetail(email);

  const { data: application, error } = await supabase.from('landlord_applications').select('*').eq('id', applicationId).eq('landlord_email', email).single();
  if (error) throw error;

  const share = await supabase.from('passport_shares').select('*').eq('id', application.passport_share_id).single();
  if (share.error) throw share.error;
  enforceShareActive(share.data as PassportShare);

  const sections = await supabase
    .from('passport_section_statuses')
    .select('section_key, status, verification_state, progress')
    .eq('passport_id', application.passport_id)
    .eq('passport_version_id', application.passport_version_id);
  if (sections.error) throw sections.error;

  const logs = await supabase.from('share_access_logs').select('*').eq('landlord_application_id', applicationId).order('created_at', { ascending: false }).limit(20);
  if (logs.error) throw logs.error;

  await logApplicationAccess(user, application as LandlordApplication, 'passport_viewed', null, 'Passport summary viewed.');

  return {
    application: application as LandlordApplication,
    sections: ((sections.data ?? []) as Array<{ section_key: PassportSectionKey; status: string; verification_state: string; progress: number }>).map((section) => ({
      key: section.section_key,
      name: sectionName(section.section_key),
      status: section.status,
      verification_state: section.verification_state,
      progress: section.progress,
      route: `/landlord/applications/${applicationId}/${sectionRoute(section.section_key)}`,
    })),
    accessLogs: (logs.data ?? []) as ShareAccessLog[],
  };
}

export async function logLandlordSectionView(user: User, applicationId: string, sectionKey: PassportSectionKey): Promise<void> {
  const detail = await getLandlordApplicationDetail(user, applicationId);
  await logApplicationAccess(user, detail.application, 'section_viewed', sectionKey, `${sectionName(sectionKey)} viewed.`);
}

export async function updateLandlordApplicationStatus(user: User, applicationId: string, status: LandlordApplicationStatus): Promise<void> {
  const email = user.email?.toLowerCase();
  if (!email) throw new Error('A verified email is required.');
  if (!supabase) return;

  const { data: application, error } = await supabase.from('landlord_applications').select('*').eq('id', applicationId).eq('landlord_email', email).single();
  if (error) throw error;

  const previousStatus = application.status as LandlordApplicationStatus;
  const update = await supabase.from('landlord_applications').update({ status, updated_at: new Date().toISOString() }).eq('id', applicationId).eq('landlord_email', email);
  if (update.error) throw update.error;

  await supabase.from('application_status_history').insert({
    landlord_application_id: applicationId,
    from_status: previousStatus,
    to_status: status,
    actor_user_id: user.id,
  });

  const eventMap: Record<LandlordApplicationStatus, ShareAccessEvent> = {
    new: 'passport_viewed',
    saved: 'application_saved',
    accepted: 'application_accepted',
    rejected: 'application_rejected',
    archived: 'application_archived',
  };
  await logApplicationAccess(user, application as LandlordApplication, eventMap[status], null, `Application marked ${status}.`);
  await recordPassportActivity(application.passport_id, user.id, eventMap[status] as PassportActivityEvent, `Application marked ${status}.`);
}

async function logApplicationAccess(user: User, application: LandlordApplication, eventType: ShareAccessEvent, sectionKey: PassportSectionKey | null, description: string) {
  if (!supabase) return;
  await supabase.from('share_access_logs').insert({
    passport_share_id: application.passport_share_id,
    landlord_application_id: application.id,
    actor_user_id: user.id,
    event_type: eventType,
    section_key: sectionKey,
    description,
  });
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

function validateShareInput(input: ShareFormData) {
  if (!input.passport_version_id) throw new Error('Choose a passport version to share.');
  if (!input.landlord_name.trim()) throw new Error('Enter the landlord or property manager name.');
  if (!/^\S+@\S+\.\S+$/.test(input.landlord_email.trim())) throw new Error('Enter a valid landlord email.');
  if (new Date(endOfDayIso(input.expires_at)).getTime() <= Date.now()) throw new Error('Expiry date must be in the future.');
}

function enforceShareActive(share: PassportShare) {
  if (share.status === 'revoked' || share.revoked_at) throw new Error('This share has been revoked by the applicant.');
  if (share.status === 'expired' || new Date(share.expires_at).getTime() < Date.now()) throw new Error('This share has expired.');
}

function applicantName(summary: PassportSummary) {
  return summary.passport.passport_number.startsWith('RP-') ? 'Kathryn' : 'Applicant';
}

function verificationLabel(summary: PassportSummary) {
  return summary.progress.verifiedSections === summary.sections.length ? 'Fully Verified' : `${summary.progress.verifiedSections} of ${summary.sections.length} sections verified`;
}

function endOfDayIso(date: string) {
  return `${date}T23:59:59.000Z`;
}

function createShareToken() {
  const random = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(random, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashShareToken(token: string) {
  const encoded = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function sectionName(sectionKey: PassportSectionKey) {
  const labels: Record<PassportSectionKey, string> = {
    rental_history: 'Rental History',
    employment: 'Employment',
    references: 'References',
    credit_report: 'Income / Credit',
    identity_confirmation: 'Identity',
  };
  return labels[sectionKey];
}

function sectionRoute(sectionKey: PassportSectionKey) {
  const routes: Record<PassportSectionKey, string> = {
    rental_history: 'rental-history',
    employment: 'employment',
    references: 'references',
    credit_report: 'credit-report',
    identity_confirmation: 'identity',
  };
  return routes[sectionKey];
}

function createDemoSummary(): PassportSummary {
  const now = new Date().toISOString();
  return {
    passport: { id: 'demo-passport', owner_user_id: 'demo-tenant', passport_number: 'RP-7F8A-C3D2', status: 'verified', current_version_id: 'demo-version-1', draft_version_id: 'demo-version-1', created_at: now, updated_at: now },
    currentVersion: { id: 'demo-version-1', passport_id: 'demo-passport', version_number: 1, status: 'current', created_at: now, updated_at: now },
    draftVersion: { id: 'demo-version-1', passport_id: 'demo-passport', version_number: 1, status: 'current', created_at: now, updated_at: now },
    sections: [],
    activity: [],
    progress: { overall: 100, completeSections: 5, verifiedSections: 5, missingSections: 0, needsReverificationSections: 0 },
  };
}

function createDemoShare(userId: string, summary: PassportSummary, input: ShareFormData): PassportShare {
  const now = new Date().toISOString();
  return {
    id: 'demo-share',
    passport_id: summary.passport.id,
    passport_version_id: input.passport_version_id || summary.currentVersion.id,
    tenant_user_id: userId,
    landlord_name: input.landlord_name || 'Greenview Property Management',
    landlord_email: (input.landlord_email || 'manager@example.com').toLowerCase(),
    property_address: input.property_address || '123 Maple St, Toronto, ON',
    message: input.message || null,
    status: 'active',
    expires_at: endOfDayIso(input.expires_at || new Date().toISOString().slice(0, 10)),
    revoked_at: null,
    invitation_sent_at: now,
    created_at: now,
  };
}

function createDemoApplication(email: string): LandlordApplication {
  const now = new Date().toISOString();
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 14);
  return {
    id: 'demo-application',
    passport_share_id: 'demo-share',
    passport_id: 'demo-passport',
    passport_version_id: 'demo-version-1',
    tenant_user_id: 'demo-tenant',
    landlord_email: email,
    landlord_name: 'Greenview Property Management',
    applicant_name: 'Kathryn',
    passport_number: 'RP-7F8A-C3D2',
    completeness: 100,
    verification_status: 'Fully verified',
    property_address: '123 Maple St, Toronto, ON',
    status: 'new',
    received_at: now,
    expires_at: expiry.toISOString(),
    last_viewed_at: null,
  };
}

function createDemoApplicationDetail(email: string): LandlordApplicationDetail {
  const application = createDemoApplication(email);
  return {
    application,
    sections: (['identity_confirmation', 'employment', 'credit_report', 'rental_history', 'references'] as PassportSectionKey[]).map((key) => ({
      key,
      name: sectionName(key),
      status: 'verified',
      verification_state: 'verified',
      progress: 100,
      route: `/landlord/applications/${application.id}/${sectionRoute(key)}`,
    })),
    accessLogs: [],
  };
}
