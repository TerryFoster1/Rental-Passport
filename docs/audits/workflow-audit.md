# Rental Passport Workflow Audit

Date: 2026-07-23

## Summary

Current workflows exist mostly as React routes plus Supabase service calls. They are adequate for prototype and partial manual MVP planning. They are not complete production workflows because backend orchestration, external communication, provider actions, and event synchronization are missing or placeholder.

## Tenant Creates Passport

- Current: after auth/profile, `getOrCreatePassportSummary` creates `passports`, `passport_versions`, and `passport_section_statuses`.
- Expected: explicit onboarding start, autosave, version creation, clear completeness state, audit record.
- Broken/missing: no explicit published-version lifecycle; demo fallback creates a fully verified passport when Supabase is absent.
- Corrected workflow: account -> verified email -> profile -> draft passport -> section drafts -> review -> published current version.

## Tenant Updates Passport

- Current: section services upsert records and mark sections `in_progress`; if a record was verified, some services set `needs_reverification`.
- Expected: only affected sections lose current verification, tenant sees what changed, prior verified version remains auditable.
- Broken/missing: no immutable evidence/version model and no automated downstream notification to shared recipients.
- Corrected workflow: update draft -> compare affected claims -> mark affected sections only -> notify authorized viewers of status change.

## Tenant Submits for Verification

- Current: `mark*ReadyForReview` writes request rows and status `ready_for_review`.
- Expected: creates a verification case/work item, links evidence, captures consent, sends needed communications.
- Broken/missing: case generation is not wired consistently; outreach emails and secure forms do not exist.
- Corrected workflow: readiness validation -> verification request -> case creation -> assigned queue -> communications -> reviewer decision.

## Reviewer Verifies a Section

- Current: `verificationPortalService.submitVerificationDecision` records a decision and updates `passport_section_statuses`.
- Expected: reviewer sees all evidence, completes checklist, records reason, audit trail, expiry, certificate metadata.
- Broken/missing: case creation uses placeholder IDs in one path; evidence viewer is placeholder; expiry is inconsistent.
- Corrected workflow: reviewer opens case -> reviews evidence/signals -> checklist -> decision -> section status and expiry -> audit log -> tenant/partner events.

## Landlord Receives Passport

- Current: tenant share creates `passport_shares`, `share_tokens`, and `landlord_applications`; demo paths create fake applications.
- Expected: landlord opens a bound, expiring viewer session for permitted summaries and selected evidence.
- Broken/missing: email delivery is not implemented; secure viewer sessions need backend enforcement.
- Corrected workflow: tenant grants recipient access -> email/magic link -> recipient identity binding -> viewer session -> access logs.

## Landlord Requests Missing Information

- Current: `requestLandlordInformation` logs a request and passport activity but does not create a persisted customer request in sharing flow.
- Expected: request creates a tenant-visible work item, notification, due state, and audit trail.
- Broken/missing: no tenant response workflow from landlord-side request.
- Corrected workflow: landlord request -> tenant notification -> section task -> upload/answer -> reviewer/landlord update.

## Tenant Responds

- Current: not implemented as an end-to-end workflow.
- Expected: tenant uploads missing evidence or edits fields; affected section returns to review.
- Corrected workflow: request task -> tenant response -> evidence link -> case reopened -> status update.

## Passport Expires

- Current: credit expiry field exists; shares have expiry; some `needs_reverification_at` fields exist.
- Expected: scheduled expiry checks, notifications, status changes, partner events, view fails closed if expired.
- Broken/missing: no scheduler or expiry worker.
- Corrected workflow: daily expiry job -> section/share status updates -> tenant and partner notifications.

## Section Changes After Verification

- Current: identity/employment/rental history/references/credit services mark `needs_reverification` when editing previously verified records.
- Expected: affected section only; immutable previous verified state retained.
- Broken/missing: no diff/audit explanation and no current-vs-draft separation in UI.

## Landlord Accepts Applicant

- Current: Rental Passport has demo accept/save/reject actions in landlord/partner views; Rental District owns final acceptance.
- Expected: Rental District makes tenancy/lease decision; Rental Passport records access/status event only.
- Boundary: Rental Passport must not create tenancies or leases.

## Rental District Receives Verification Data

- Current: demo partner viewer and documented placeholder API.
- Expected: partner-safe summary via authenticated API and webhooks.
- Broken/missing: no production service-to-service auth, stable IDs, webhook delivery.

