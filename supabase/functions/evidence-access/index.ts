import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

type AccessRole = 'tenant' | 'landlord' | 'reviewer';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: 'Server is not configured' }, 500);

  const authorization = request.headers.get('Authorization') ?? '';
  const bearer = authorization.replace('Bearer ', '');
  if (!bearer) return jsonResponse({ error: 'Authentication required' }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const userResult = await admin.auth.getUser(bearer);
  const user = userResult.data.user;
  if (!user) return jsonResponse({ error: 'Authentication failed' }, 401);

  const body = await request.json().catch(() => ({}));
  const documentId = String(body.documentId ?? '');
  const applicationId = body.applicationId ? String(body.applicationId) : null;
  const caseId = body.caseId ? String(body.caseId) : null;
  if (!documentId) return jsonResponse({ error: 'documentId is required' }, 400);

  const { data: document, error: documentError } = await admin
    .from('evidence_documents')
    .select('*')
    .eq('id', documentId)
    .maybeSingle();
  if (documentError) return jsonResponse({ error: documentError.message }, 500);
  if (!document) return jsonResponse({ error: 'Document not found' }, 404);

  const role = await determineAccessRole(admin, user.id, user.email ?? '', document, applicationId, caseId);
  if (!role.allowed) {
    await logEvidenceAccess(admin, document, user.id, 'denied', role.reason, role.role, applicationId);
    return jsonResponse({ error: 'Access denied' }, 403);
  }

  const expiresIn = role.role === 'landlord' ? 120 : 300;
  const signed = await admin.storage.from(document.storage_bucket).createSignedUrl(document.storage_path, expiresIn);
  if (signed.error) {
    await logEvidenceAccess(admin, document, user.id, 'denied', signed.error.message, role.role, applicationId);
    return jsonResponse({ error: 'Unable to create signed access' }, 500);
  }

  await logEvidenceAccess(admin, document, user.id, 'granted', null, role.role, applicationId, expiresIn);
  return jsonResponse({
    signedUrl: signed.data.signedUrl,
    expiresIn,
    accessMode: role.role === 'landlord' ? 'landlord_view_only' : role.role === 'tenant' ? 'tenant_view' : 'internal_signed_view',
    downloadAllowed: false,
  });
});

async function determineAccessRole(
  admin: ReturnType<typeof createClient>,
  userId: string,
  userEmail: string,
  document: Record<string, string | boolean>,
  applicationId: string | null,
  caseId: string | null,
): Promise<{ allowed: boolean; role: AccessRole; reason: string | null }> {
  if (document.owner_user_id === userId) return { allowed: true, role: 'tenant', reason: null };

  const roles = await admin.from('user_roles').select('role').eq('user_id', userId);
  const internal = (roles.data ?? []).some((item: { role: string }) =>
    ['verification_reviewer', 'senior_reviewer', 'support', 'compliance', 'administrator'].includes(item.role),
  );
  if (internal) {
    if (!caseId) return { allowed: true, role: 'reviewer', reason: null };
    const assigned = await admin
      .from('verification_cases')
      .select('id')
      .eq('id', caseId)
      .eq('passport_id', document.passport_id)
      .eq('passport_version_id', document.passport_version_id)
      .maybeSingle();
    return assigned.data
      ? { allowed: true, role: 'reviewer', reason: null }
      : { allowed: false, role: 'reviewer', reason: 'Case does not match document passport version' };
  }

  if (!applicationId) return { allowed: false, role: 'landlord', reason: 'Landlord application is required' };
  if (document.landlord_visible !== true) return { allowed: false, role: 'landlord', reason: 'Document is not landlord visible' };
  if (['government_id_front', 'government_id_back', 'selfie'].includes(String(document.document_type))) {
    return { allowed: false, role: 'landlord', reason: 'Identity source documents are restricted' };
  }

  const application = await admin
    .from('landlord_applications')
    .select('id')
    .eq('id', applicationId)
    .eq('passport_id', document.passport_id)
    .eq('passport_version_id', document.passport_version_id)
    .eq('landlord_email', userEmail.toLowerCase())
    .maybeSingle();
  return application.data
    ? { allowed: true, role: 'landlord', reason: null }
    : { allowed: false, role: 'landlord', reason: 'Application is not shared with this landlord' };
}

async function logEvidenceAccess(
  admin: ReturnType<typeof createClient>,
  document: Record<string, string>,
  actorUserId: string,
  decision: 'granted' | 'denied',
  denialReason: string | null,
  role: AccessRole,
  applicationId: string | null,
  expiresIn?: number,
) {
  await admin.from('evidence_access_logs').insert({
    evidence_document_id: document.id,
    passport_id: document.passport_id,
    passport_version_id: document.passport_version_id,
    actor_user_id: actorUserId,
    access_reason: decision === 'granted' ? 'phase_a2_evidence_access' : 'phase_a2_evidence_access_denied',
    access_mode: role === 'landlord' ? 'landlord_view_only' : role === 'tenant' ? 'tenant_view' : 'internal_signed_view',
    signed_url_expires_at: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
    landlord_application_id: applicationId,
    decision,
    denial_reason: denialReason,
    role_context: role,
  });
}

