// Phase 10 API platform Edge Function placeholder.
// This function documents the future /api/v1 boundary without implementing production OAuth,
// partner authentication, webhook delivery, or live resource mutation.

const routes = [
  'POST /api/v1/auth/token',
  'GET /api/v1/users/me',
  'GET /api/v1/passports',
  'GET /api/v1/passports/:passportId',
  'GET /api/v1/passport-versions/:versionId',
  'GET /api/v1/verification/status/:passportId',
  'POST /api/v1/shares',
  'GET /api/v1/applications',
  'PATCH /api/v1/applications/:applicationId',
  'GET /api/v1/landlords/applications',
  'GET /api/v1/tenants/passport',
  'GET /api/v1/documents/:documentId/view-session',
  'POST /api/v1/notifications',
  'GET /api/v1/consent',
  'GET /api/v1/activity',
  'GET /api/v1/audit',
  'GET /api/v1/admin/verifications',
  'GET /api/v1/developer/clients',
  'POST /api/v1/partner/applications',
  'POST /api/v1/webhooks/test',
];

Deno.serve((request: Request) => {
  const url = new URL(request.url);
  return Response.json(
    {
      data: {
        version: 'v1',
        path: url.pathname,
        method: request.method,
        status: 'documented_placeholder',
        routes,
      },
      error: null,
      meta: {
        requestId: crypto.randomUUID(),
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
});
