# Rental District API Contract

Date: 2026-07-23  
Status: proposed contract; do not implement until reviewed.

## Authentication

- Service-to-service OAuth 2.0 client credentials or signed partner JWT.
- Every request must include `Authorization`, `X-RP-Partner-Id`, `X-Request-ID`, and idempotency key for writes.
- Scopes are least privilege: `applications.summary.read`, `applications.viewer.write`, `verification.request.write`, `webhooks.manage`.

## Identifiers

- `partner_id`: Rental District tenant/customer integration id.
- `partner_application_id`: Rental District application id.
- `partner_listing_id`: Rental District listing id.
- `passport_id`: Rental Passport passport id.
- `passport_version_id`: immutable version id.
- `applicant_user_id`: Rental Passport user id, never used as the only partner lookup key.

## Endpoints

### Attach Existing Passport

`POST /api/v1/partner/applications/{partner_application_id}/passport`

Request:

```json
{
  "passport_id": "rp_passport_123",
  "passport_version_id": "rp_version_456",
  "partner_listing_id": "rd_listing_789",
  "applicant_email": "tenant@example.com",
  "tenant_consent_id": "consent_123"
}
```

Response:

```json
{
  "application_passport_link_id": "link_123",
  "status": "attached",
  "summary_url": "/api/v1/partner/applications/rd_app_123/summary"
}
```

### Invite Applicant To Create Passport

`POST /api/v1/partner/verification-requests`

Returns a secure Rental Passport invitation URL and partner-safe status only.

### Retrieve Partner-Safe Summary

`GET /api/v1/partner/applications/{partner_application_id}/summary`

Response excludes raw documents and full credit report:

```json
{
  "passport_id": "rp_passport_123",
  "passport_version_id": "rp_version_456",
  "completeness": 100,
  "verification_status": "verified",
  "sections": [
    {
      "section": "employment",
      "completeness": "complete",
      "verification": "verified",
      "verified_at": "2026-07-23T15:00:00Z",
      "expires_at": "2026-10-21T15:00:00Z",
      "summary": "Employment independently verified using approved methods."
    }
  ],
  "documents": {
    "raw_document_access": "not_included",
    "viewer_required": true
  }
}
```

### Create Secure Viewer Session

`POST /api/v1/partner/applications/{partner_application_id}/viewer-sessions`

Response:

```json
{
  "viewer_url": "https://rentalpassport.io/partner/application/rp_app_123?session=...",
  "expires_at": "2026-07-23T16:00:00Z",
  "scopes": ["application.summary.read", "documents.view_selected"]
}
```

## Errors

- `unauthorized`
- `forbidden_scope`
- `partner_not_bound`
- `passport_revoked`
- `passport_expired`
- `application_not_found`
- `idempotency_conflict`
- `rate_limited`

## Audit Requirements

Every request writes an API log with partner id, actor/service identity, request id, endpoint, scope, status, and redacted metadata.

