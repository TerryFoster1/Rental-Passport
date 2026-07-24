# Rental Passport Production Activation

Date: 2026-07-24  
Status: production remains blocked until Phase A.3 staging validation passes.

This document separates what is safe to claim after staging validation from what still requires additional implementation. It exists to prevent the investor demo, staging MVP, and future production platform from being blurred together.

## Ready After Staging Validation

These claims become safe only after the staging runbook passes with real Supabase, Storage, Edge Function, Resend, and Rental District staging evidence:

- Rental Passport supports account creation, email verification, and profile foundation.
- Tenants can provide documents for manual verification workflows.
- Evidence documents are stored in private Supabase Storage buckets.
- Internal reviewers can review evidence and scoped third-party responses.
- Employers, prior landlords, property managers, and references can submit scoped secure responses.
- Manual verification outcomes are recorded with reviewer audit context.
- Landlord-facing passport views show approved summary information and permitted evidence only.
- Rental District can open a Rental Passport-hosted verified application viewer through the documented demo contract.

## Requires Additional Work

These items are not complete enough for full production launch:

- Live Supabase staging project activation and validation.
- Production Supabase project migration planning.
- Production Resend sender/domain approval.
- Production OAuth redirect validation.
- Production monitoring and incident runbooks.
- Production backup and recovery testing.
- Paid verification checkout.
- Durable partner API credentials and token issuance.
- Partner webhooks.
- Production Rental District service-to-service integration.
- Legal review of verification certificate wording and landlord-visible summaries.
- Privacy review of document retention and access revocation flows.
- Accessibility testing with assistive technology.

## Still Prohibited

Do not claim or ship these capabilities until explicitly implemented, tested, and approved:

- Automated facial verification.
- AI fraud detection.
- Direct credit bureau integrations.
- OpenRoom or tribunal record search.
- Automated employer legitimacy scoring.
- Automated landlord legitimacy scoring.
- Background checks.
- Approval recommendations.
- Tenant scoring.
- Instant verification.
- Public partner self-serve onboarding.
- Any landlord upsell in tenant-facing flows.

## Current Activation Blockers

The local repository currently has no committed secrets and no local staging environment file. Activation requires:

- `SUPABASE_PROJECT_REF` for staging.
- Supabase access token or authenticated CLI session.
- Staging Supabase anon and service role keys.
- Resend test/staging API key.
- Approved staging sender email.
- Staging Vercel environment variables.
- Rental District V2 staging URL and launch-token exchange plan.

## Production Promotion Checklist

Before production:

- Complete `docs/operations/staging-verification-runbook.md`.
- Store staging validation evidence outside git.
- Review all failed or skipped checks.
- Confirm no secrets are committed.
- Confirm `npm.cmd run lint` passes.
- Confirm `npm.cmd run build` passes.
- Confirm Vercel preview build serves the same commit being promoted.
- Confirm Supabase migrations are reviewed against production data.
- Confirm production env vars are configured in Vercel and Supabase.
- Confirm Cloudflare DNS and SSL are healthy.
- Confirm demo flags are set intentionally.
- Confirm legal/privacy approval for production-facing verification wording.

## Deployment Notes

Frontend production deployment may proceed only for approved public/demo surfaces. Live verification workflows must remain disabled or staged until backend validation passes.

Recommended environment posture:

| Environment | Demo routes | Email delivery | Verification data |
| --- | --- | --- | --- |
| Local | Enabled | Disabled | Seeded/mock only |
| Staging | Explicitly gated | Test mode first, then controlled live tests | Controlled test accounts only |
| Production | Disabled or clearly gated | Enabled only after approval | Real users after launch gate |

