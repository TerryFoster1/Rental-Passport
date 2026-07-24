# Phase A.2 Manual Verification Workflows

Date: 2026-07-24  
Status: local implementation complete; live Supabase migration/storage/email validation blocked in this environment because the Supabase CLI is not installed and no development/staging project credentials are configured.

## Implementation Summary

Phase A.2 completes the manual verification loop enough for a controlled staging test:

- Private Storage bucket migration for `identity-documents`, `credit-report-documents`, and `passport-evidence`.
- Storage path convention:
  - `tenant/{tenantId}/passport/{passportId}/version/{versionId}/{section}/{documentId}-{filename}`
- Server-side evidence access Edge Function:
  - `supabase/functions/evidence-access`
- Resend-backed email Edge Function:
  - `supabase/functions/send-verification-email`
- Secure external response Edge Function:
  - `supabase/functions/verification-response`
- External response routes:
  - `/verify/employment/:token`
  - `/verify/rental-history/:token`
  - `/verify/reference/:token`
- Reviewer portal evidence/outreach/response visibility.
- Checklist enforcement before marking a section verified.
- Manual outcomes:
  - Verified
  - Needs More Information
  - Unable to Verify
  - Needs Reverification
  - Expired
  - Escalated
- Manual phone confirmation record service for authorized staff.
- Tenant notification and verification email event tables.

## Migration Status

Migration added:

`supabase/migrations/202607240001_phase_a2_manual_verification_workflows.sql`

The migration was not applied from this environment. Blockers:

- `supabase` CLI is not installed.
- `.env.example` contains placeholders only.
- No development/staging Supabase access token, project ref, or database URL is configured locally.

Required live validation after applying to a non-production project:

- Confirm every Phase A and A.2 table exists.
- Confirm enum values were added successfully.
- Confirm RLS is enabled on every new public table.
- Confirm Storage buckets exist and are private.
- Confirm Storage policies compile.
- Confirm no table is unintentionally exposed through the Data API without RLS.
- Confirm old tenant/passport data remains intact.

Rollback consideration:

- A.2 adds enum values and tables. Postgres enum values are not easily removed. Rollback should disable new routes/functions and drop only newly added tables/policies after data export, rather than attempting to remove enum labels.

## Email Delivery

Email is implemented through the `send-verification-email` Edge Function.

Required environment variables:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ENABLE_VERIFICATION_EMAIL_DELIVERY=true`
- `APP_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Automated tests and local development should keep:

`ENABLE_VERIFICATION_EMAIL_DELIVERY=false`

When disabled, the function records `skipped_test_mode` events and does not send real external email.

## Evidence Access Rules

The Edge Function fails closed unless the requester is authenticated and one of the following is true:

- Tenant owns the evidence document.
- Internal reviewer/support/compliance/admin has a valid internal role.
- Landlord has an application shared to their email, the share version matches the evidence version, and the evidence is explicitly landlord-visible.

Landlords are denied access to:

- Selfies.
- Identity source images.
- Non-landlord-visible evidence.
- Evidence outside the shared passport version.

All grants and denials are written to `evidence_access_logs`.

## External Response Pages

External recipients can answer only scoped questions. They cannot browse the passport.

Responses are submitted to the `verification-response` Edge Function, which validates:

- Token hash.
- Invitation existence.
- Expiry.
- Revocation.
- Completion status.
- Outreach type and section scope.

## Reviewer Procedure

1. Open the internal verification queue.
2. Claim or assign the case.
3. Review submitted facts, evidence, outreach records, and external responses.
4. Complete required checklist items.
5. Add internal notes.
6. Request more information, escalate, mark unable to verify, mark needs reverification, expire, or approve.
7. Approval is blocked until required checklist items are complete unless an override reason is recorded.

Internal notes, evidence concerns, fraud flags, and raw evidence are not landlord-facing.

## Manual Credit Procedure

1. Tenant authorizes manual credit workflow.
2. Staff confirms payment state outside the app where applicable.
3. Staff runs the approved provider workflow manually.
4. Staff uploads or records provider evidence securely.
5. Reviewer records permitted summary fields only.
6. Reviewer marks Verified, Needs More Information, or Unable to Complete.
7. Landlord sees approved summary fields only.

No live bureau API is implemented or claimed.

## Authorization Test Plan

Live/staging tests still required:

- Tenant cannot read another tenant's onboarding, evidence, passport, or notifications.
- Landlord sees only applications shared to their email.
- Landlord cannot access selfies or identity source documents.
- Reviewer can access evidence through assigned/internal case workflow.
- Support can view queues but cannot make final decisions unless role policy permits.
- Expired/revoked outreach tokens fail.
- Completed response tokens fail unless edit window is explicitly set.
- Evidence-access denials are logged.
- Data API exposure is verified for new public tables.

Static inspection alone is not sufficient for security signoff.

## Safe Claims

Safe after staging migration and live workflow test:

- Rental Passport supports manual verification workflows.
- External employers, landlords/property managers, and references can submit scoped secure responses.
- Staff reviewers make final verification decisions.
- Landlord passport views show summary status and do not expose restricted documents.

Still prohibited:

- Automated facial verification.
- AI fraud detection.
- Instant verification.
- Direct bureau integration.
- OpenRoom search.
- Public partner API onboarding.
- Automated employer legitimacy determination.
- Automated landlord legitimacy determination.
- Tenant scoring.
- Approval recommendations.

