# Rental Passport Capability Audit

Date: 2026-07-23  
Scope: relaunch readiness audit for the current RentalPassport.io codebase.  
Status: audit complete enough to begin planning; not production-ready for real verification data.

## Executive Summary

Rental Passport has a broad frontend prototype, Supabase schema foundation, RLS policies, document upload paths, share-token patterns, an internal verification portal UI/service layer, and a demo Rental District integration. It is not a greenfield scaffold.

The current implementation is not yet a production verification platform. Many capabilities are database-backed enough to save tenant-provided data, create section statuses, upload files to named Supabase Storage buckets, create review request rows, and show workflow states. However, the core verification loops are incomplete: outreach emails, secure third-party response forms, provider integrations, signed document viewing, webhook delivery, payment, automated identity/credit checks, and durable partner APIs are placeholder or demo-mode.

The safest launch language is that Rental Passport can support a manual MVP after implementation hardening. It cannot yet honestly market automated verification, bureau integration, AI fraud review, instant screening, or production-ready partner APIs.

Addendum: the guided onboarding and verification-engine planning documents extend this audit:

- `docs/product/guided-onboarding-spec.md`
- `docs/verification/evidence-framework.md`
- `docs/verification/manual-credit-workflow.md`
- `docs/compliance/verification-research-boundaries.md`
- `docs/product/verification-roadmap.md`
- `docs/product/marketing-claims-matrix.md`

## Evidence Sources

- Runtime app: `src/App.tsx`
- Auth: `src/features/auth/AuthProvider.tsx`, `src/features/auth/AuthPages.tsx`
- Supabase client: `src/lib/supabase.ts`, `src/lib/env.ts`
- Core services: `src/services/*Service.ts`
- Partner/API: `src/api/v1/endpoints.ts`, `src/api/v1/router.ts`, `supabase/functions/api/index.ts`
- Migrations: `supabase/migrations/*.sql`
- Existing documentation: `docs/architecture/*`, `docs/rental-passport-*.md`
- Validation performed in this pass: static code trace and migration inventory. Production data was not modified.

## Status Matrix

| Area | Status | Evidence | Gaps / Recommendation |
|---|---:|---|---|
| Email/password signup | Partially Working | `AuthProvider.signUpWithPassword` calls Supabase Auth and redirects to `/verify-email`. | Needs production Supabase config, email templates, redirect allowlist, email-confirmation runtime test. |
| Google OAuth | Partially Working | `signInWithGoogle` calls Supabase OAuth with `/auth/callback`. | No current provider credential verification; Google is account/contact confidence only, not identity verification. |
| Email confirmation | Partially Working | `isEmailVerified` from `user.email_confirmed_at`; protected routes block unverified users. | Needs live email delivery test and recovery states. |
| Phone confirmation | Manual / Placeholder | `phone_verification_status`, phone table, identity signals say placeholder/manual. | No SMS/Twilio implementation; launch as manual confirmation only. |
| Profile creation | Partially Working | `profileService.upsertCurrentProfile` writes `profiles`. | Needs onboarding UX audit, validation, and production test. |
| Roles/permissions | Partially Working | migrations define roles, permissions, user roles; `AdminGate` gates admin UI. | RLS and app gates require live role tests; no full RBAC middleware/API enforcement. |
| Session management/logout/recovery | Partially Working | Supabase session persistence and reset/update password methods. | Needs end-to-end test, token expiry assumptions, session revocation plan. |
| Consent capture | Partially Working | `consent_records` table; section services insert consent rows. | Consent text/version governance and withdrawal effects are incomplete. |
| Passport creation/versioning | Partially Working | `passportService.getOrCreatePassportSummary` creates passports, versions, section statuses. | Version lifecycle is minimal; no immutable published version workflow. |
| Section status/completeness | Partially Working | `passport_section_statuses`, `calculatePassportProgress`. | Completeness and verification are sometimes conflated in demos; needs explicit workflow states. |
| Expiry/reverification | Partially Working | `needs_reverification_at`, credit expiry, change-after-verified logic. | No scheduler, notifications, or enforcement across all sections. |
| Activity log | Partially Working | `passport_activity_logs` writes in services. | Needs immutable/append-only controls, event taxonomy, and full audit coverage tests. |
| Tenant dashboard/preview | UI + Partially Working | `PassportPages.tsx`, `usePassportSummary`. | Demo fallbacks can show fully verified without production evidence when Supabase absent. |
| Identity fields/upload | Partially Working | `identityService` saves identity profile and uploads ID/selfie to `identity-documents`. | No signed document viewer, no reviewer-completed checklist linkage to specific evidence. |
| Identity manual review | Partially Working | `verificationPortalService` can update section status and decisions. | Case creation uses placeholder IDs; no automatic case creation from identity request. |
| Employment/income fields/upload | Partially Working | `employmentService` saves records, contacts, documents, consents, signals. | Employer email workflow, secure employer response, domain validation, phone confirmation missing. |
| Rental history | Partially Working | saves records, contacts, documents, signals, review requests. | Verification email/secure response and landlord legitimacy checks missing. |
| References | Partially Working | saves references, consents, signals, review requests. | Invitation/reminder/secure response workflow missing. |
| Credit | Manual / Partially Working | credit service stores consents, report metadata, PDF upload, manual/provider request status. | Provider workflow, payment, provider report intake, permitted summary approval missing. |
| Documents | Partially Working | services upload to named Supabase Storage buckets and store metadata. | Signed URLs, watermarking, download restrictions, view session enforcement, retention not implemented. |
| Sharing | Partially Working | hashed tokens, share tables, recipient email binding, expiry/revocation checks. | Token validation is partly client-side; email delivery, password/magic links, signed viewer sessions need backend hardening. |
| Landlord dashboard/viewer | UI + Demo / Partially Working | `LandlordPages.tsx`, `PartnerApplicationViewerPage.tsx`, `sharingService` demos. | Demo data can imply verified status; production landlord access rules require live tests. |
| Verification operations | Partially Working | reviewer tables and `verificationPortalService` for notes/checklists/decisions. | No work queue generation, assignments/SLA/QA automation, or evidence viewer implementation. |
| API platform | UI/Contract Only | endpoints are documented; Edge Function returns `documented_placeholder`. | Implement backend auth, validation, persistence, OpenAPI, SDK, webhooks before partner launch. |
| Rental District integration | Demo / Contract Only | demo routes and partner viewer tokens exist; docs call demo. | Needs reviewed API contract, service-to-service auth, event sync, stable cross-product IDs. |
| Payments | Disabled / Missing | env vars exist; docs mark demo/disabled. | Stripe implementation deferred. |
| Email/Resend | Missing | env vars only. | Must implement feature-flagged communication service and logging. |
| AI assistance | Planning / Placeholder | `aiAssistanceService`, docs. | Internal-only, human-reviewed implementation required before use. |

## Critical Blockers

- No production backend API enforces partner scopes, viewer sessions, or document access.
- Edge Function API is a placeholder.
- Verification workflows can create statuses, but do not complete actual outreach/provider/secure-response loops.
- Demo fallbacks can display fully verified states without evidence if Supabase is not configured.
- No live provider credentials or tested provider integrations were proven.
- Sensitive document access lacks production signed-viewer, watermark, expiry, revocation, and audit enforcement.

## Security Concerns

- Many business operations are initiated from the React client using Supabase client credentials. RLS is required to hold the security boundary; it must be tested aggressively.
- Several `SECURITY DEFINER` functions exist in migrations and must be reviewed for search path, grants, and public executability.
- Partner viewer and post-application request flows are demo-token based; production must move token issuance and validation behind backend services.
- Raw documents must never be exposed to Rental District by default.

## What Can Honestly Launch Now

- Public marketing site and pricing page.
- Account shell if Supabase Auth is configured and tested.
- Manual-data-entry passport draft collection for safe demo/beta users.
- Manual review planning and internal portal prototype.
- Rental District demo with clear demo disclaimers.

## What Must Remain Disabled

- Automated identity verification.
- Direct credit bureau/provider integration.
- AI fraud detection claims.
- Instant verification claims.
- Production partner API access.
- Public claims that employment, landlord, references, or credit are verified unless a human-reviewed workflow was actually completed and recorded.

## Recommended Next Step

Begin with manual MVP hardening: backend service layer, secure document viewing, internal queue generation, email communication framework, and explicit status separation between completeness and verification.
