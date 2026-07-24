# Phase A Manual Verification MVP Implementation Notes

Date: 2026-07-23  
Status: implementation foundation complete in code; production operation still requires Supabase migration deployment, storage bucket setup, email-provider wiring, and live authorization testing.

## Implemented In This Phase

- Guided tenant onboarding route at `/passport/onboarding`.
- Ten documented onboarding stages with required/optional clarity.
- Autosave-ready onboarding progress service.
- Completeness status separate from verification state.
- Versioned consent capture service with purpose, text version, text snapshot, device metadata, and audit logging.
- Private evidence upload registry and Storage upload path helper.
- Manual verification case submission using real passport and passport-version IDs.
- Structured reviewer checklists generated per section.
- Employer, previous landlord/property manager, and reference outreach invitation records.
- Manual credit operations queue state.
- Landlord information request records linked to the shared application, passport version, tenant, section, and tenant route.
- Reviewer dashboard queue map for launch-safe manual operations.
- Shared labels for Phase A verification states and reverification states.

## Database Migration

Migration:

`supabase/migrations/202607230001_phase_a_manual_verification_mvp.sql`

Adds:

- `onboarding_stage_progress`
- `evidence_documents`
- `evidence_access_logs`
- `verification_outreach`
- `verification_outreach_responses`
- `manual_credit_operations`
- `landlord_information_requests`

Extends:

- `consent_records`
- `passport_section_status`
- `passport_verification_state`
- `passport_activity_event`
- `verification_type`

## Still Manual / Not Implemented

- Real Resend email delivery for outreach invitations.
- Public recipient response pages for employers, previous landlords, property managers, and references.
- Supabase Edge Function for signed evidence viewing.
- Automatic reminder scheduling.
- Payment confirmation.
- Direct credit bureau/provider API integration.
- Automated facial verification.
- AI fraud detection or automated decisions.
- Production Rental District integration.
- Open public partner APIs.

## Operational Requirements Before Live Use

- Apply the migration to the target Supabase project.
- Create private Storage buckets:
  - `identity-documents`
  - `credit-report-documents`
  - `passport-evidence`
- Confirm RLS policies with tenant, landlord, reviewer, compliance, support, and administrator test accounts.
- Configure Resend templates and server-side sending.
- Add Edge Functions for secure response links and signed document viewing.
- Confirm audit logs are written for every material live action.

## Safe Claims

Safe after migration and live verification testing:

- Renters can complete guided onboarding.
- Rental Passport supports manual verification operations.
- Tenant evidence is private by default.
- Verification requires human reviewer approval.
- Landlords receive summaries and structured request flows.

Still disabled:

- Instant verification.
- Direct bureau credit pulls.
- Automated facial identity verification.
- AI fraud review.
- OpenRoom/tribunal searches.
- Public partner API access.

