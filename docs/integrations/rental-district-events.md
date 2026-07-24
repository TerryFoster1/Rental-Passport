# Rental District Event Synchronization

Date: 2026-07-23

## Delivery Rules

- Producer signs event with webhook secret.
- Consumer acknowledges 2xx only after durable write.
- Retries use exponential backoff for at least 24 hours.
- Events are idempotent by `event_id`.
- Payloads are partner-safe by default.
- Raw documents and internal reviewer notes are never included.

## Events

| Event | Producer | Consumer | Purpose |
|---|---|---|---|
| `passport.created` | Rental Passport | Rental District optional | Applicant has a passport account. |
| `passport.updated` | Rental Passport | Rental District | Partner summary may need refresh. |
| `passport.completed` | Rental Passport | Rental District | Required information supplied, not necessarily verified. |
| `passport.verification_requested` | Rental Passport | Rental District | Verification workflow started. |
| `passport.section_verified` | Rental Passport | Rental District | Section verified with date/expiry. |
| `passport.section_needs_information` | Rental Passport | Rental District | Tenant needs to provide more information. |
| `passport.section_expired` | Rental Passport | Rental District | Section no longer current. |
| `passport.revoked` | Rental Passport | Rental District | Access must be removed. |
| `passport.shared` | Rental Passport | Rental District | Tenant authorized sharing. |
| `passport.viewed` | Rental Passport | Rental District | Partner viewer opened. |
| `application.passport_attached` | Rental District | Rental Passport | RD application linked to passport. |
| `application.information_requested` | Rental District | Rental Passport | Landlord requested more info. |
| `application.accepted` | Rental District | Rental Passport | RD made decision; RP logs status only. |
| `application.withdrawn` | Rental District | Rental Passport | Applicant withdrew. |

## Example Payload

```json
{
  "event_id": "evt_123",
  "event_name": "passport.section_verified",
  "created_at": "2026-07-23T15:00:00Z",
  "partner_id": "rental_district",
  "passport_id": "rp_passport_123",
  "passport_version_id": "rp_version_456",
  "partner_application_id": "rd_app_789",
  "section": "employment",
  "verification_status": "verified",
  "verified_at": "2026-07-23T15:00:00Z",
  "expires_at": "2026-10-21T15:00:00Z",
  "privacy_scope": "partner_safe_summary"
}
```

## Failure Handling

Rental Passport should expose webhook event replay to internal admins. Rental District must not assume a stale status is current without checking `expires_at` and latest event sequence.

