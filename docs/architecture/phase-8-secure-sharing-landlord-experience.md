# Phase 8 - Secure Sharing and Landlord Experience

Phase 8 introduces the first landlord-facing workflow. The implementation keeps Rental Passport tenant-controlled, recipient-specific, authenticated, time-limited, revocable, logged, and view-only.

## Implemented Scope

- Tenant sharing page at `/passport/share`
- Sharing controls surfaced from `/passport/settings`
- Landlord secure access page at `/landlord/secure-access`
- Landlord applications dashboard at `/landlord/applications`
- Landlord passport summary at `/landlord/applications/:applicationId/passport`
- Landlord section detail pages for employment, rental history, references, credit report, and identity
- Secure invitation placeholder using hashed tokens
- Recipient email matching before landlord access is granted
- Expiry and revocation checks
- Tenant-visible activity and access logging
- Application actions for save, accept, and reject/archive
- View-only supporting document placeholders

## Data Model

Phase 8 adds:

- `passport_shares`
- `share_tokens`
- `share_access_logs`
- `landlord_applications`
- `application_status_history`
- `application_messages`
- `document_access_logs`
- `secure_view_sessions`

Shares reference a specific passport version. Landlord applications are bound to the invited recipient email and the originating share.

## Security Rules

- Raw invitation tokens are never stored; only hashes are stored.
- Direct token reads are blocked by RLS.
- Invite validation uses a minimal security-definer lookup function.
- Landlords can only view applications where `landlord_email` matches their authenticated email.
- Shares must be active, unexpired, and not revoked.
- Access and section views are logged.
- Sensitive document downloads are not implemented.

## Out of Scope

- Applicant comparison
- Full messaging
- Rental District lease handoff
- Payments or escrow
- External screening checks
- AI fraud checks
- Full watermark document viewer
- Enterprise API and developer portal
- Team accounts and subscriptions
