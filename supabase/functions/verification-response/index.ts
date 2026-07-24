import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: 'Server is not configured' }, 500);
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const url = new URL(request.url);
  const postBody = request.method === 'GET' ? {} : await request.clone().json().catch(() => ({}));
  const token = request.method === 'GET' ? url.searchParams.get('token') : postBody.token;
  const tokenHash = token ? await sha256(token) : '';
  if (!tokenHash) return jsonResponse({ error: 'Token is required' }, 400);

  const { data: invitation, error } = await admin
    .from('verification_outreach')
    .select('*')
    .eq('response_token_hash', tokenHash)
    .maybeSingle();
  if (error) return jsonResponse({ error: error.message }, 500);
  if (!invitation) return jsonResponse({ error: 'Invitation not found' }, 404);
  if (invitation.revoked_at || invitation.status === 'revoked') return jsonResponse({ error: 'Invitation has been revoked' }, 410);
  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    await admin.from('verification_outreach').update({ status: 'expired' }).eq('id', invitation.id);
    return jsonResponse({ error: 'Invitation has expired' }, 410);
  }
  if (invitation.status === 'completed' && !invitation.response_editable_until) {
    return jsonResponse({ error: 'Invitation has already been completed' }, 409);
  }

  if (request.method === 'GET' || postBody.action === 'load') {
    await admin.from('verification_outreach').update({ status: 'opened', opened_at: new Date().toISOString() }).eq('id', invitation.id);
    return jsonResponse({
      invitation: {
        id: invitation.id,
        outreachType: invitation.outreach_type,
        recipientName: invitation.recipient_name,
        recipientEmail: invitation.recipient_email,
        applicantUserId: invitation.applicant_user_id,
        sectionKey: invitation.section_key,
        expiresAt: invitation.expires_at,
        status: invitation.status,
      },
    });
  }

  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);
  const body = postBody;
  const response = body.response ?? {};
  const respondentName = String(response.respondentName ?? '').trim();
  if (!respondentName) return jsonResponse({ error: 'Responder name is required' }, 400);
  if (response.declarationAccepted !== true) return jsonResponse({ error: 'Declaration is required' }, 400);

  const inserted = await admin.from('verification_outreach_responses').insert({
    outreach_id: invitation.id,
    respondent_name: respondentName,
    respondent_title: response.respondentTitle ?? null,
    respondent_email: response.respondentEmail ? String(response.respondentEmail).toLowerCase() : invitation.recipient_email,
    structured_response: response,
    ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] ?? null,
    user_agent: request.headers.get('user-agent'),
  });
  if (inserted.error) return jsonResponse({ error: inserted.error.message }, 500);

  await admin.from('verification_outreach').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    responded_at: new Date().toISOString(),
  }).eq('id', invitation.id);

  await admin.from('passport_activity_logs').insert({
    passport_id: invitation.passport_id,
    actor_user_id: null,
    event_type: 'outreach_response_received',
    description: `${invitation.outreach_type} response received.`,
    visibility: 'internal',
  });

  await admin.from('tenant_notifications').insert({
    tenant_user_id: invitation.applicant_user_id,
    passport_id: invitation.passport_id,
    passport_version_id: invitation.passport_version_id,
    section_key: invitation.section_key,
    notification_type: 'response_received',
    title: 'Verification response received',
    body: `Rental Passport received a ${String(invitation.outreach_type).replaceAll('_', ' ')} response.`,
    action_route: sectionRoute(invitation.section_key),
  });

  return jsonResponse({ status: 'completed' });
});

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function sectionRoute(sectionKey: string) {
  const routes: Record<string, string> = {
    rental_history: '/passport/rental-history',
    employment: '/passport/employment',
    references: '/passport/references',
    credit_report: '/passport/credit-report',
    identity_confirmation: '/passport/identity',
  };
  return routes[sectionKey] ?? '/passport/onboarding';
}
