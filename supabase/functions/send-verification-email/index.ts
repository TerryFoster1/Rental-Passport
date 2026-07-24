import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'Rental Passport <security@rentalpassport.io>';
  const emailEnabled = Deno.env.get('ENABLE_VERIFICATION_EMAIL_DELIVERY') === 'true';
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

  const roles = await admin.from('user_roles').select('role').eq('user_id', user.id);
  const canSend = (roles.data ?? []).some((item: { role: string }) =>
    ['verification_reviewer', 'senior_reviewer', 'support', 'compliance', 'administrator'].includes(item.role),
  );
  if (!canSend) return jsonResponse({ error: 'Internal verification access required' }, 403);

  const body = await request.json();
  const outreachId = String(body.outreachId ?? '');
  const reminder = body.reminder === true;
  if (!outreachId) return jsonResponse({ error: 'outreachId is required' }, 400);

  const { data: outreach, error } = await admin.from('verification_outreach').select('*').eq('id', outreachId).maybeSingle();
  if (error) return jsonResponse({ error: error.message }, 500);
  if (!outreach) return jsonResponse({ error: 'Outreach not found' }, 404);
  if (['completed', 'expired', 'revoked', 'cancelled'].includes(outreach.status)) {
    return jsonResponse({ error: 'Outreach cannot be sent in its current state' }, 409);
  }

  const idempotencyKey = `${outreach.id}:${reminder ? 'reminder' : 'initial'}:${outreach.reminder_count ?? 0}`;
  const link = `${Deno.env.get('APP_URL') ?? 'https://rentalpassport.io'}/verify/${routeType(outreach.outreach_type)}/${body.token ?? '[secure-token-issued-at-send-time]'}`;
  const subject = reminder
    ? `Reminder: Rental Passport ${String(outreach.outreach_type).replaceAll('_', ' ')} verification`
    : `Rental Passport verification request for an authorized applicant`;
  const html = renderEmail({
    recipientName: outreach.recipient_name,
    applicantLabel: 'the applicant',
    outreachType: outreach.outreach_type,
    link,
    expiresAt: outreach.expires_at,
  });

  let deliveryStatus = 'skipped_test_mode';
  let providerMessageId = null;
  let errorMessage = null;

  if (emailEnabled && resendApiKey) {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: outreach.recipient_email,
        subject,
        html,
      }),
    });
    const payload = await resendResponse.json().catch(() => ({}));
    if (resendResponse.ok) {
      deliveryStatus = 'sent';
      providerMessageId = payload.id ?? null;
    } else {
      deliveryStatus = 'failed';
      errorMessage = payload.message ?? 'Resend send failed';
    }
  }

  await admin.from('verification_email_events').insert({
    outreach_id: outreach.id,
    verification_case_id: outreach.verification_case_id,
    passport_id: outreach.passport_id,
    passport_version_id: outreach.passport_version_id,
    recipient_email: outreach.recipient_email,
    template_key: reminder ? 'verification_invitation_reminder' : 'verification_invitation',
    delivery_status: deliveryStatus,
    provider_message_id: providerMessageId,
    error_message: errorMessage,
    idempotency_key: idempotencyKey,
    sent_at: deliveryStatus === 'sent' ? new Date().toISOString() : null,
  });

  await admin.from('verification_outreach').update({
    status: deliveryStatus === 'failed' ? 'delivery_failed' : reminder ? 'reminder_sent' : 'sent',
    sent_at: reminder ? outreach.sent_at : new Date().toISOString(),
    last_reminder_at: reminder ? new Date().toISOString() : outreach.last_reminder_at,
    reminder_count: reminder ? (outreach.reminder_count ?? 0) + 1 : outreach.reminder_count ?? 0,
    delivery_failure_reason: errorMessage,
  }).eq('id', outreach.id);

  return jsonResponse({ deliveryStatus, providerMessageId, emailEnabled });
});

function routeType(outreachType: string) {
  if (outreachType === 'employer') return 'employment';
  if (outreachType === 'reference') return 'reference';
  return 'rental-history';
}

function renderEmail(input: { recipientName: string; applicantLabel: string; outreachType: string; link: string; expiresAt: string }) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#061343">
      <h1>Rental Passport verification request</h1>
      <p>Hello ${escapeHtml(input.recipientName)},</p>
      <p>${escapeHtml(input.applicantLabel)} authorized Rental Passport to contact you for ${escapeHtml(input.outreachType.replaceAll('_', ' '))} verification.</p>
      <p>Please use the secure response link below. The link expires on ${new Date(input.expiresAt).toLocaleDateString()}.</p>
      <p><a href="${input.link}" style="background:#2563eb;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">Open secure response form</a></p>
      <p>This email does not include sensitive documents. Contact support@rentalpassport.io if you did not expect this request.</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char] ?? char));
}

