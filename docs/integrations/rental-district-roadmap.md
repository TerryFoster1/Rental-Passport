# Rental District Integration Roadmap

Date: 2026-07-23

## Integration Phase A - Manual Safe Core

- Stable identifiers across Rental Passport and Rental District.
- Attach passport to Rental District application.
- Secure Rental Passport-owned viewer.
- Partner-safe summary only.
- Manual verification status.
- Share revocation/expiry enforcement.

Acceptance criteria:

- Rental District can open a Rental Passport viewer without receiving raw documents.
- Expired/revoked access fails closed.
- Landlord can see completeness and verification status, not tenant score.

## Integration Phase B - Requests and Events

- Landlord missing-information request sync.
- Tenant notifications.
- Webhook events for status, expiry, revocation, updates.
- Reverification after changed sections.
- Audit logs visible to tenant/internal staff.

Acceptance criteria:

- Rental District receives updates without polling.
- Every event is idempotent and logged.
- Tenant can see what Rental District accessed.

## Integration Phase C - Provider and External Partners

- Credit provider integration.
- SMS verification.
- Identity provider.
- OCR/AI assistance after review.
- External listing-site APIs and SDKs.

Acceptance criteria:

- Provider contracts signed.
- Sandbox and production tests pass.
- Marketing claims updated only after evidence exists.

