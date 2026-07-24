# Rental Passport Staging Verification Runbook

Date: 2026-07-24  
Scope: Phase A.3 staging activation for the manual verification MVP.

This runbook activates and validates a non-production Supabase staging project for Rental Passport. It must be completed before using real renter, landlord, employer, reference, credit, or identity documents.

## Guardrails

- Use staging only. Do not use production as a substitute for missing staging access.
- Do not expose or paste service role keys, Resend keys, database URLs, or OAuth secrets into commits, screenshots, logs, or chat.
- Keep `ENABLE_VERIFICATION_EMAIL_DELIVERY=false` until email templates, sender identity, and recipient test accounts are approved.
- Do not enable AI fraud review, credit bureau APIs, OpenRoom, automated facial verification, scoring, tenant recommendations, or approval recommendations.
- If any RLS test fails, stop and fix security before continuing workflow validation.

## Required Access

- Supabase staging project ref.
- Supabase access token for the staging organization.
- Supabase anon key and service role key for staging.
- Resend test-mode API key or approved staging sender domain.
- Vercel staging or preview deployment access.
- Test inboxes for tenant, internal reviewer, employer, prior landlord, reference, and landlord.
- Rental District V2 staging/demo environment URL.

## Local Tooling

From the project root:

```powershell
npm.cmd install
npm.cmd run lint
npm.cmd run build
```

Confirm Supabase CLI availability:

```powershell
where.exe supabase
supabase --version
```

If the CLI is unavailable, use the current CLI through `npx` or install it using the Supabase-recommended method for this workstation:

```powershell
npx supabase --version
```

Before running any project command, confirm command help in the current CLI version:

```powershell
npx supabase db push --help
npx supabase functions deploy --help
npx supabase secrets set --help
```

## Environment Setup

Create local staging environment values outside git, for example `.env.local`, and keep values secret:

```text
VITE_SUPABASE_URL=<staging-supabase-url>
VITE_SUPABASE_ANON_KEY=<staging-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<staging-service-role-key>
SUPABASE_PROJECT_REF=<staging-project-ref>
APP_URL=<staging-rental-passport-url>
RESEND_API_KEY=<resend-test-or-staging-key>
RESEND_FROM_EMAIL=<approved-staging-sender>
ENABLE_VERIFICATION_EMAIL_DELIVERY=false
SUPABASE_STORAGE_BUCKET_DOCUMENTS=passport-evidence
SUPABASE_STORAGE_BUCKET_IDENTITY=identity-documents
SUPABASE_STORAGE_BUCKET_CREDIT=credit-report-documents
```

Expected repository state:

- `.env.example` contains placeholders only.
- `.env.local` is ignored by git.
- No secret values appear in `git diff`, build logs, or committed docs.

## Supabase Project Link

Link the local repo to the staging project:

```powershell
npx supabase login
npx supabase link --project-ref <staging-project-ref>
npx supabase migration list
```

The staging project must receive these Phase A migrations in order:

1. `supabase/migrations/202607230001_phase_a_manual_verification_mvp.sql`
2. `supabase/migrations/202607240001_phase_a2_manual_verification_workflows.sql`

Apply migrations only after confirming the target project is staging:

```powershell
npx supabase db push
```

Record the migration output in the staging validation notes. Do not paste secrets.

## Database Validation

Run:

```powershell
npx supabase db remote commit --help
```

If the staging workflow supports direct SQL execution from the CLI or SQL editor, run:

```text
scripts/staging/phase-a3-staging-validation.sql
```

Minimum pass conditions:

- All Phase A/A.2 tables exist.
- RLS is enabled on every Phase A/A.2 table.
- Required RLS policies exist.
- Required indexes exist.
- Required enum labels exist.
- Storage buckets exist and are private.
- No unrestricted public evidence access exists.

## Storage Validation

Confirm these buckets exist and are private:

- `identity-documents`
- `credit-report-documents`
- `passport-evidence`

Upload paths must follow:

```text
tenant/{tenantId}/passport/{passportId}/version/{versionId}/{section}/{documentId}-{filename}
```

Storage tests:

- Tenant can upload to their own tenant path.
- Tenant cannot upload to another tenant path.
- Tenant can read their own evidence.
- Tenant cannot read another tenant evidence.
- Landlord cannot read raw evidence through direct Storage URL.
- Internal reviewer can read permitted evidence.

## Edge Function Deployment

Deploy only the Phase A/A.2 functions needed for manual verification:

```powershell
npx supabase functions deploy evidence-access --project-ref <staging-project-ref>
npx supabase functions deploy send-verification-email --project-ref <staging-project-ref>
npx supabase functions deploy verification-response --project-ref <staging-project-ref>
```

Set function secrets for staging:

```powershell
npx supabase secrets set SUPABASE_URL=<staging-supabase-url> --project-ref <staging-project-ref>
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<staging-service-role-key> --project-ref <staging-project-ref>
npx supabase secrets set RESEND_API_KEY=<resend-test-or-staging-key> --project-ref <staging-project-ref>
npx supabase secrets set RESEND_FROM_EMAIL=<approved-staging-sender> --project-ref <staging-project-ref>
npx supabase secrets set ENABLE_VERIFICATION_EMAIL_DELIVERY=false --project-ref <staging-project-ref>
npx supabase secrets set APP_URL=<staging-rental-passport-url> --project-ref <staging-project-ref>
```

Function smoke tests:

- `evidence-access` rejects unauthenticated requests.
- `evidence-access` logs denied and granted attempts.
- `send-verification-email` records `skipped_test_mode` while email delivery is disabled.
- `verification-response` rejects missing, expired, revoked, completed, wrong-scope, and wrong-type tokens.

## Resend Staging Test

Start in test mode:

```text
ENABLE_VERIFICATION_EMAIL_DELIVERY=false
```

Expected behavior:

- Outreach can be queued.
- Email event rows are created.
- No real email is sent.
- Reviewer can see delivery state.

After sender identity and templates are approved, switch only staging to:

```text
ENABLE_VERIFICATION_EMAIL_DELIVERY=true
```

Then send one message to each controlled test recipient type:

- Employer.
- Prior landlord or property manager.
- Reference.

Pass conditions:

- Email arrives in the test inbox.
- Link opens the scoped response page.
- Token cannot be reused after submission.
- Tenant is notified after a response is received.
- Reviewer can see the response.

## External Response Security Tests

Run this matrix for each outreach type:

| Scenario | Expected Result |
| --- | --- |
| Missing token | Denied |
| Unknown token | Denied |
| Expired token | Denied |
| Revoked token | Denied |
| Completed token | Denied |
| Wrong response type | Denied |
| Valid unexpired token | Scoped form only |
| Valid submitted token | Response saved; token no longer reusable |

External users must never see:

- Full passport.
- Tenant-uploaded raw documents.
- Internal reviewer notes.
- Other outreach responses.
- Landlord application status.

## RLS Role Matrix

Use real staging accounts for:

- Tenant A.
- Tenant B.
- Landlord.
- Reviewer.
- Support.
- External employer/landlord/reference recipient.

Pass conditions:

| Actor | Must Access | Must Not Access |
| --- | --- | --- |
| Tenant A | Own profile, own onboarding, own evidence metadata, own notifications | Tenant B data, reviewer notes, other evidence |
| Tenant B | Own records only | Tenant A data |
| Landlord | Shared application summary and explicitly landlord-visible metadata | Selfies, identity source images, non-shared documents, internal notes |
| Reviewer | Verification queue, assigned case, evidence through review flow | Unrelated auth secrets, unrestricted Storage browsing |
| Support | Queue visibility allowed by policy | Final approval unless role permits |
| External recipient | One scoped response form | Passport, dashboard, documents, other responses |

Any unexpected `select`, `insert`, `update`, or Storage object access is a release blocker.

## End-To-End Staging Workflow

1. Tenant signs up with email/password.
2. Tenant verifies email.
3. Tenant completes profile and required Phase A onboarding.
4. Tenant uploads identity, employment, income, rental history, reference, and optional credit evidence into private Storage.
5. Tenant confirms manual phone verification state.
6. Reviewer opens queue.
7. Reviewer claims verification cases.
8. Reviewer sends employer, prior landlord, and reference outreach.
9. External recipients submit scoped responses.
10. Reviewer reviews evidence and responses.
11. Reviewer records manual credit outcome without exposing full credit report to landlord.
12. Reviewer marks sections verified only after checklist completion.
13. Tenant sees updated verification state.
14. Tenant shares with Rental District.
15. Rental District opens the Rental Passport viewer through a short-lived launch token.
16. Landlord sees verified summary and permitted documents only.
17. Rental District records accept/reject/lease actions in Rental District, not Rental Passport.

## Rental District Contract Test

Use the current documented demo route until the live partner API is available:

```text
/partner/application/demo-rp-app-001?launch_token=demo-valid-rental-district
```

Contract checks:

- Rental District notification says the applicant applied with RentalPassport.io.
- Rental District application card has one primary action: `Open Passport`.
- Rental Passport viewer opens with Rental Passport branding.
- Viewer is read-only for final tenancy decisions.
- Rental District keeps final approval, lease generation, signature, and tenancy creation.
- After approval, Rental District stores only the approved application package fields it is allowed to retain.
- Rental District does not retain continuing access to Rental Passport documents after the permission window closes.

## Observability

During staging validation, record:

- Migration result.
- Function deployment result.
- Function logs for each denial/grant.
- `evidence_access_logs` rows.
- `verification_email_events` rows.
- `tenant_notifications` rows.
- Reviewer action audit logs.
- External token denial and submission outcomes.

## Production Gate

Production activation is blocked until every item below is complete in staging:

- Migrations applied to staging.
- RLS role matrix passes.
- Storage private access matrix passes.
- Edge Functions deployed and smoke-tested.
- Resend test mode passes.
- Live controlled email delivery passes.
- End-to-end manual verification workflow passes.
- Rental District staging contract test passes.
- Production secrets and DNS/deployment environment are approved.
- Demo-only routes and claims are either disabled, gated, or clearly labeled.

