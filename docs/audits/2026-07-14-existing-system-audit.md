# Rental Passport Existing-System Audit

Date: 2026-07-14

Scope: Existing website, application codebase, documentation, routes, Supabase migrations, feature modules, placeholder integrations, messaging, security posture, and deployment configuration for RentalPassport.io.

Audit rule followed: no features were deleted, rebuilt, or removed from navigation during this audit. Questionable or incomplete capabilities are classified for owner review, dormant treatment, or later implementation.

## Executive Summary

Rental Passport is no longer a greenfield scaffold. The repository contains a React/Vite frontend, Supabase client integration, Supabase SQL migrations through Phase 10, a placeholder Edge Function API surface, tenant-facing passport modules, landlord sharing views, an internal verification portal, a developer portal, pricing, demo pages, branding assets, and extensive architecture/security/product documentation.

The current product is best described as a production-facing prototype with several real client-side workflows and database foundations, but not yet a fully production-ready verification platform for real sensitive renter data.

The public homepage is now aligned with the tenant promise:

> Fill out your last rental application.

The deeper app still contains a mix of:

- working client flows when Supabase is configured
- demo fallbacks when Supabase is not configured
- manual-first verification foundations
- placeholder provider integrations
- placeholder API endpoints
- investor/demo landlord experiences
- documentation for capabilities not fully implemented

The next work should not be a rebuild. The right next move is normalization: tighten the source of truth, mark incomplete capabilities honestly, move business logic behind backend APIs, preserve dormant work, and implement only the next tenant-facing production path.

## Architecture Audit

### Frontend

- Framework: React 19.2.7
- Language: TypeScript 6.0.3
- Build tool: Vite 8.1.2
- Styling: TailwindCSS 3.4.17
- Icons: lucide-react 1.22.0
- Routing: custom path state in `src/App.tsx` using `window.history.pushState` and `popstate`
- Layouts:
  - `src/layouts/PublicLayout.tsx`
  - `src/layouts/AuthLayout.tsx`
  - `src/layouts/AppShell.tsx`
- Design system:
  - local UI primitives in `src/components/ui`
  - form primitives in `src/components/forms`
  - feedback primitives in `src/components/feedback`
  - branded logo component in `src/components/brand/RentalPassportLogo.tsx`

### Backend

- Provider: Supabase
- Client: `@supabase/supabase-js` 2.110.0
- Auth: Supabase Auth via email/password and Google OAuth
- Database: PostgreSQL via Supabase migrations
- Edge Functions: `supabase/functions/api/index.ts` exists as a documented placeholder API function
- API layer: `src/api/v1` defines frontend-side route metadata and placeholder authorization helpers

### Hosting And Deployment

- Hosting: Vercel
- Project metadata:
  - project name: `rental-passport`
  - production URL: `https://rentalpassport.io`
- `vercel.json`:
  - SPA rewrite to `/index.html`
  - CSP, HSTS, referrer policy, X-Content-Type-Options, X-Frame-Options, Permissions-Policy
- Note: `frame-ancestors 'none'` and `X-Frame-Options: DENY` protect against embedding, but also prevent direct iframe embedding inside Rental District. Keep this unless a secure cross-product embed model is explicitly approved.

### Environment Variables

Configured in `.env.example`:

- App: `VITE_APP_NAME`, `VITE_APP_ENV`, `VITE_APP_URL`
- Supabase: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_REF`
- Auth: `VITE_GOOGLE_OAUTH_CLIENT_ID`
- Stripe placeholders
- Resend placeholders
- Google Maps placeholder
- Supabase Storage bucket placeholder
- Monitoring placeholders
- Security contact email

Observed app code currently reads only:

- `VITE_APP_NAME`
- `VITE_APP_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Many env entries are future placeholders and not yet wired into runtime behavior.

### External Services

Implemented or referenced:

- Supabase Auth, Database, Storage
- Vercel hosting

Planned or placeholder:

- Stripe
- Resend
- Google Maps
- SingleKey
- FrontLobby
- OpenRoom
- Twilio
- Google
- DocuSign
- future identity provider
- future payment provider
- future escrow provider
- AI assistance provider abstraction

No evidence was found that production Stripe, Resend, Twilio, Google Maps, OpenRoom, SingleKey, OCR, credit bureau, open banking, or DocuSign flows are live.

## Route Map

### Public Routes

- `/` - renter-focused homepage
- `/pricing` - tenant pricing page
- `/privacy` - placeholder public info page
- `/terms` - placeholder public info page
- `/contact` - placeholder public info page
- `/faq` - placeholder public info page
- `/demo` - investor/demo experience
- `/demo/passport-view` - secure viewer demo
- `/developers` - developer portal page

### Authentication Routes

- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/auth/callback`

### Tenant Protected Routes

- `/app`
- `/dashboard`
- `/profile`
- `/onboarding/profile`
- `/passport`
- `/passport/preview`
- `/passport/share`
- `/passport/activity`
- `/passport/settings`
- `/passport/rental-history`
- `/passport/employment`
- `/passport/references`
- `/passport/credit-report`
- `/passport/identity`

### Landlord Routes

- `/landlord`
- `/landlord/applications`
- `/landlord/secure-access`
- `/landlord/applications/:id/passport`
- `/landlord/applications/:id/employment`
- `/landlord/applications/:id/rental-history`
- `/landlord/applications/:id/references`
- `/landlord/applications/:id/credit-report`
- `/landlord/applications/:id/identity`

### Admin Routes

- `/admin`
- `/admin/verifications`
- `/admin/verifications/:id`

### API Placeholder Routes

Documented in `src/api/v1/endpoints.ts` and `supabase/functions/api/index.ts`, including:

- `POST /api/v1/auth/token`
- `GET /api/v1/users/me`
- `GET /api/v1/passports`
- `GET /api/v1/passports/:passportId`
- `GET /api/v1/verification/status/:passportId`
- `POST /api/v1/shares`
- `GET /api/v1/applications`
- `PATCH /api/v1/applications/:applicationId`
- `GET /api/v1/admin/verifications`
- `POST /api/v1/partner/applications`
- `POST /api/v1/webhooks/test`

Status: documented placeholder, not production API behavior.

## Database And Architecture Summary

Migrations exist for:

1. Identity foundation
2. Passport framework
3. Employment module
4. Rental history module
5. References module
6. Identity verification module
7. Credit report module
8. Secure sharing and landlord experience
9. Internal verification portal
10. API platform and partner ecosystem

Major tables include:

- Account foundation: `profiles`, `roles`, `user_roles`, `permissions`, `role_permissions`, `consent_records`, `audit_logs`
- Passport: `passports`, `passport_versions`, `passport_section_statuses`, `passport_activity_logs`
- Employment: `employment_records`, `employment_contacts`, `employment_documents`, `employment_verification_requests`, `employment_verification_signals`
- Rental history: `rental_history_records`, `rental_history_contacts`, `rental_history_documents`, `rental_history_verification_requests`, `rental_history_verification_signals`
- References: `references`, `reference_relationships`, `reference_verification_requests`, `reference_verification_signals`, `reference_notes`, `reference_documents`
- Identity: `identity_profiles`, `identity_documents`, `identity_selfies`, `identity_verification_requests`, `identity_verification_signals`, `phone_verification_status`, `identity_review_notes`
- Credit: `credit_providers`, `credit_reports`, `credit_report_documents`, `credit_verification_requests`, `credit_verification_signals`, `credit_consents`
- Sharing: `passport_shares`, `share_tokens`, `landlord_applications`, `application_status_history`, `application_messages`, `share_access_logs`, `document_access_logs`, `secure_view_sessions`
- Verification portal: `verification_cases`, `verification_assignments`, `verification_notes`, `verification_checklists`, `verification_decisions`, `fraud_flags`, `customer_information_requests`, `reviewer_activity`, `reviewer_roles`, `case_history`
- API platform: `developer_accounts`, `api_clients`, `api_keys`, `oauth_clients`, `oauth_tokens`, `partner_integrations`, `webhook_subscriptions`, `webhook_events`, `api_logs`, `rate_limit_records`, `integration_settings`

RLS is present in migrations for the foundational tables reviewed. Full security verification requires applying migrations to a real Supabase project and running policy tests.

## Feature Inventory

| Feature | Current Classification | Notes |
| --- | --- | --- |
| Public homepage | Working | Tenant-facing rewrite is live and aligned with "fill it out once" message. |
| Pricing page | Visually complete | Shows Free, Verified, Verified + Credit; pricing appears approved direction but recurrence/expiry/refund details need owner/legal review. |
| Privacy/Terms/FAQ/Contact pages | Placeholder | Routes exist, but content is placeholder. Needs real legal/support content. |
| Signup/login/password reset | Partially working | Supabase-backed if env is configured. Google OAuth route exists. Needs end-to-end production auth testing. |
| Email verification | Partially working | Supabase email confirmation state is checked. Copy exists. Needs real email template and redirect testing. |
| Google OAuth | Partially working | Code exists. Needs provider/dashboard/env verification. |
| Tenant profile | Partially working | Profile fields and save path exist. Needs production validation, consent UX, and completion rules. |
| Tenant dashboard | Partially working | Passport summary and section cards exist. Demo fallback creates fully verified state when Supabase is absent. |
| Passport framework | Partially working | Versioning, statuses, activity foundation exist. Publishing/reverification lifecycle incomplete. |
| Employment | Partially working | Forms, upload, consent, ready-for-review, signals. Manual review/provider verification incomplete. |
| Rental history | Partially working | Forms, documents, contacts, statuses. Manual verification completion incomplete. |
| References | Partially working | Reference entry and verification foundations. External contact/response workflow incomplete. |
| Identity verification | Partially working | ID document/selfie/upload foundations. Real ID provider/liveness/manual decisioning incomplete. |
| Credit report | Partially working | Upload/provider-request options and consents. No production credit provider integration. |
| Document uploads | Partially working | Supabase Storage upload paths exist for modules. Malware scanning, redaction, view-only production viewer, and retention policy incomplete. |
| Secure sharing | Partially working | Share creation, token hashing, expiry, recipient email, revoke, logs. Needs production email delivery and stronger backend enforcement tests. |
| Landlord secure access | Partially working | Invitation validation and landlord account creation flow exist. Needs production invitation email and legal UX review. |
| Landlord application review | Partially working | Landlord can view application summaries and sections. Actions are limited and do not create tenancy/lease in Rental Passport. |
| Landlord upsells | Dormant / should remain tenant-hidden | OpenRoom and AI Fraud Review upsells exist as landlord-facing components. Keep out of tenant experience. |
| Internal verification portal | Partially working / internal prototype | Queue, cases, checklists, decisions, fraud flags, AI assistance placeholders. Needs RBAC and operational QA before real data. |
| AI assistance | Placeholder / constrained | Local deterministic helper summaries exist. No external AI provider. Guardrails documented. |
| Developer portal | Visually complete / placeholder | API clients/OAuth/webhooks docs exist, but production API is not live. |
| Edge Function API | Placeholder | Returns documented route metadata only. |
| Webhooks | Dormant | Tables and route metadata exist. No delivery engine. |
| OAuth platform | Dormant | Tables and route metadata exist. No production OAuth server. |
| SDK | Dormant | JS SDK file exists. Not production package. |
| Payments | Dormant | Stripe env placeholders only. No purchase/checkout flow found. |
| Email | Dormant | Resend env placeholders only. No production sending flow found. |
| SMS/phone verification | Dormant/manual | Phone status table exists; no Twilio/OTP production flow. |
| Rental District integration | Placeholder/planned | Integration registry and partner docs exist. No live cross-app API sync verified in this repo. |
| Demo accounts/data | Present | Demo fallbacks and investor/demo pages exist. Must not be confused with production functionality. |

## User-Flow Map And Gaps

### Free Tenant Signup

Current path:

1. Visitor clicks Create Account.
2. User enters email/password or chooses Google.
3. Supabase handles signup/OAuth if configured.
4. Email/password user is told to verify email.
5. Verified user is routed toward onboarding/profile.

Gaps:

- Supabase production config must be verified.
- Email template/redirect behavior needs browser testing.
- Google OAuth callback should automatically resolve session instead of requiring manual "Continue" perception.
- No clear independent entry path for landlord invitation versus normal signup yet.

### Paid Verification Purchase

Current status: not implemented.

Gaps:

- No Stripe checkout.
- No product/price IDs.
- No payment state.
- No refund/expiry/reverification policy.
- Pricing page should eventually state whether fees are one-time, what expires, and what renewal means.

### Identity Verification

Current status: partial manual-first foundation.

Gaps:

- No production ID provider.
- No liveness integration.
- No malware scanning/redaction.
- No reviewer completion flow verified against RLS.
- Landlord exposure rules need enforced document viewer tests.

### Document Upload

Current status: module-level Supabase Storage upload helpers.

Gaps:

- Bucket policies were not verified in this audit.
- No malware scanning.
- No redaction pipeline.
- No production document preview service.
- No retention/deletion policy implementation verified.

### Employment And Income Verification

Current status: partial form/upload/consent/signals.

Gaps:

- Employer contact workflow incomplete.
- Self-employed, student, newcomer, gig worker, contractor, retiree, social assistance, multiple income-source paths need explicit UX and data model review.
- No provider or bank-data verification.

### Reference Verification

Current status: partial.

Gaps:

- No outbound reference request delivery verified.
- No distinction workflow fully tested for no response, unable to contact, declined, partial confirmation, confirmed, conflicting information.

### Credit Inclusion

Current status: partial manual/provider request foundation.

Gaps:

- No production SingleKey/FrontLobby/credit bureau integration.
- Consent/legal wording needs review.
- Credit summary exposure rules need production tests.
- Do not use credit as applicant ranking.

### Landlord Sharing

Current status: partial.

Current path:

1. Tenant creates a share.
2. Token is generated and hashed.
3. Landlord application record is created.
4. Landlord access is restricted by recipient email.
5. Landlord can view summary and section details.
6. Tenant can revoke share.

Gaps:

- Invitation email delivery not implemented.
- Magic link flow not implemented.
- Share access policy tests needed.
- Expired/revoked link tests needed.
- Download package not implemented.
- Tenant visibility into every document view needs testing.

### Tenant Editing A Shared Passport

Current status: incomplete.

Gaps:

- Versioning exists, but effect of editing after share is not fully specified or implemented.
- Need rules for whether a landlord sees the old shared version or updated version.

### Disputed Findings And Clarification

Current status: partial in verification portal data model.

Gaps:

- Tenant-facing dispute/clarification UX is not complete.
- Internal reviewer workflow needs operational definition.

### Account Deletion

Current status: not implemented.

Gaps:

- Needs privacy/legal retention policy first.

## Pricing Audit

Current public pricing:

- Free: $0
- Verified Passport: $29 CAD
- Verified Passport + Credit Report: $45 CAD

Status: clear enough for a tenant-facing MVP story, but not yet complete for a paid production checkout.

Open pricing questions:

- Is Verified a one-time fee, per passport version, per year, or per reverification?
- What expires and when?
- What does renewal cost?
- Is manual review included?
- Is credit provider pass-through included in the $45 CAD price?
- Are refunds available?
- Can landlords request additional paid checks?
- Are taxes included or added?
- What legal consent is required for credit?

Do not add Stripe checkout until these decisions are approved.

## Messaging Audit

### Strengths

- Homepage is renter-first and avoids technical infrastructure language.
- Pricing page is simple and tenant-focused.
- Docs and UI repeatedly state no tenant score, no approval recommendation, and no ranking.
- Sharing copy emphasizes sensitive document protection.
- Credit module states raw credit reports are not exposed.

### Copy Requiring Review

- "Stand Out" on homepage is acceptable but should remain grounded. Avoid implying guaranteed approval.
- "Verified applications accepted instantly" in mock rental-site cards may overstate external platform acceptance. Consider "Verified applications can be shared instantly."
- Demo mockups with "Fully Verified" and sample credit/income should be clearly identified as examples.
- Admin statuses use "approved/rejected" for verification cases. Clarify these mean verification decision, not housing approval.
- `fraud_flags` language is internal, but tenant-facing copy should prefer "possible inconsistency" or "manual review recommended" where appropriate.

### Avoid Going Forward

- AI startup language
- risk scoring for tenant desirability
- guarantees of approval
- "safe/dangerous tenant" framing
- fraud certainty without evidence
- unexplained one-number scores

## Trust Engine Capability Map

### Present Foundations

- Section completeness and verification states
- Evidence/document records per module
- Consent records
- Activity logs
- Verification signals per module
- Internal verification cases
- Fraud flag table
- Reviewer activity/case history
- AI assistance helper with no approval/rejection recommendation
- API route metadata for future verification status

### Not Yet Production-Implemented

- Document text extraction
- OCR
- malware scanning
- document tamper analysis
- identity provider integration
- credit provider integration
- bank/open-banking income verification
- employer domain/business registry checks
- phone/email risk signals
- duplicate document detection
- PDF metadata analysis
- cross-document contradiction detection
- tenant clarification workflow
- dispute workflow
- manual review operational QA

### Required Design Rule

The Trust Engine must report separate dimensions:

- completeness
- identity verification
- employment verification
- income verification
- rental-history verification
- reference verification
- credit status
- document consistency
- unresolved issues

It must not collapse these into an unexplained tenant score.

## Rental District Integration Map

Current repo evidence:

- Partner integration registry includes Rental District.
- Product docs define Rental District as landlord/property-management system.
- API endpoint metadata includes partner application submission.
- Sharing model can create landlord application records inside Rental Passport.
- Homepage mentions future "Apply with RentalPassport.io" style use.

Not yet verified:

- Live Rental District to Rental Passport API integration.
- Shared Trust Engine package reused natively by both apps.
- Traditional Rental District application screened through same Trust Engine.
- Profile claim from Rental District application.
- Duplicate screening avoidance.
- Approved applicant connected to tenancy.
- "Powered by RentalPassport.io" display inside Rental District production.

Owner/product rule:

- Tenants must not be forced to buy Rental Passport to submit a traditional Rental District application.

## Consent And Privacy Gap Analysis

Present:

- `consent_records`
- credit-specific consents
- employment consents
- sharing consents/recipient controls
- share revocation foundation
- access logs foundation

Gaps:

- Consent taxonomy should be normalized across identity, employment, income, bank data, references, rental history, credit, AI analysis, landlord sharing, Rental District integration, reusable storage, and partner API sharing.
- Revocation effects need formal behavior per consent type.
- Account deletion and optional data deletion are not implemented.
- Data retention periods are not approved.
- Raw document minimization policy is not implemented.
- Landlord document viewer permissions need production tests.
- Tenant correction/dispute workflows are incomplete.

## Security Risk List

- Real Supabase RLS policies need applied-environment tests.
- Storage bucket policies were not verified.
- Raw document upload pipeline lacks malware scanning.
- Sensitive document preview is placeholder, not a hardened viewer.
- No production audit-log coverage test suite.
- CSP is strong but could block future approved cross-product embedding.
- API placeholder must not be mistaken for production partner API.
- OAuth platform tables exist but server is not implemented.
- No rate-limit enforcement for live APIs beyond planned tables/helpers.
- No evidence of production monitoring/alerting.
- No break-glass access workflow implementation verified.
- No formal retention/deletion process verified.

## Bias And Discrimination Risk List

Risk areas for legal/product review:

- Credit display and credit provider workflows.
- Income multiple display, especially for non-traditional income.
- Employment verification for self-employed, gig, newcomer, student, retiree, cash income, and multiple-income applicants.
- Reference non-response must not be treated as negative reference.
- Fraud/risk language must remain internal and evidence-scoped.
- Landlord filters must adapt by jurisdiction.
- No protected-characteristic inference, proxy inference, social-media review, writing-style character judgment, or occupation prestige scoring.
- Do not sort applicants by desirability.

## Legal-Review List

Requires legal review before production use:

- Privacy policy and terms.
- Credit consent and credit report handling.
- Identity document retention and deletion.
- Employment/reference/rental history contact consent.
- AI-assisted document analysis disclosure.
- Landlord sharing permissions and document exposure.
- Data retention and account deletion.
- PIPEDA/CASL/GDPR readiness.
- Housing-law compliant questions and filters by jurisdiction.
- OpenRoom or tribunal/records searches.
- Escrow/Verified Deposit.
- Regional lease generation and signing workflows.
- Refunds, renewal, expiry, and reverification policy.
- Partner API data sharing contracts.

## Owner Decisions Required

1. Confirm whether $29 CAD and $45 CAD are one-time, per version, annual, or renewal-based prices.
2. Confirm whether the public homepage should keep the current "Stand Out" phrase or soften it.
3. Confirm exact expiry windows for identity, employment, rental history, references, credit, and passport verification.
4. Decide whether `/developers` should remain publicly visible now or become dormant until partner API is real.
5. Decide whether `/demo` should stay in public navigation on production.
6. Decide whether landlord upsells such as OpenRoom and AI Fraud Review remain in code but hidden from tenant flows.
7. Confirm whether Rental Passport should ever iframe inside Rental District. If yes, current Vercel frame policy needs a secure alternative.
8. Approve product language for "fraud" versus "possible inconsistency" in tenant-facing contexts.
9. Approve whether sample applicant names/data remain in production demo routes.
10. Confirm account deletion and retention requirements before implementing deletion UX.
11. Confirm the first production verification workflow to make real: identity, employment, rental history, references, or credit.
12. Confirm whether profile claim from Rental District is in near-term scope.

## Dormant-Feature Plan

Keep, but mark as dormant or remove from public navigation until production-ready:

- Developer portal and external API claims.
- OAuth platform.
- Webhooks.
- JavaScript SDK.
- OpenRoom upsell.
- AI Fraud Review upsell.
- Stripe payment placeholders.
- Resend email placeholders.
- Twilio phone verification placeholders.
- Direct credit provider references beyond manual/provider-assisted MVP.
- DocuSign/lease-signing references inside Rental Passport unless scoped to Rental District handoff.

Do not delete these without owner approval.

## Implementation Sequence

### Stage 1 - Stabilize Existing Foundations

- Create an explicit feature flag map.
- Mark demo-only routes and demo-only data.
- Add route/page capability labels: live, partial, placeholder, dormant.
- Verify Supabase auth, RLS, and storage policies in a real project.
- Write tests for protected routing and auth redirects.

### Stage 2 - Public Website And Policy Completion

- Replace placeholder privacy, terms, FAQ, and contact pages.
- Refine homepage phrase "Verified applications accepted instantly."
- Clarify pricing recurrence, expiry, renewal, refund, and credit details after approval.
- Add no-approval-guarantee language where appropriate.
- Add subtle Rental District credibility line without making tenants feel funnelled.

### Stage 3 - Tenant Onboarding Production Path

- Normalize onboarding sections.
- Separate reusable profile data from property-specific application data.
- Add required/optional explanations and who-can-see-this copy.
- Support non-standard income paths.
- Add tenant clarification and correction patterns.

### Stage 4 - Trust Engine Backend Boundary

- Move verification operations out of frontend services into secured backend/API services.
- Add source tracking and freshness fields consistently.
- Implement manual-first reviewer workflow for one module end to end.
- Add audit logging tests.

### Stage 5 - Secure Sharing Hardening

- Implement email/magic-link delivery.
- Harden document viewer.
- Test revoked/expired/multiple landlord shares.
- Build downloadable application package fallback.
- Add tenant-facing share history.

### Stage 6 - Rental District Integration

- Define API contract for Apply with RentalPassport.io.
- Ensure traditional Rental District applications can be screened by the same Trust Engine.
- Preserve tenant consent and prevent landlord data leakage into tenant profiles.
- Add profile claim workflow.

### Stage 7 - Payments And Verification Products

- Implement Stripe only after pricing/legal decisions are approved.
- Add purchase, receipt, refund, expiry, and reverification states.

### Stage 8 - AI Assistance After Guardrails

- Add provider abstraction, schema validation, redaction, prompt-injection handling, cost controls, and human review.
- Keep AI scoped to investigation, interpretation, and communication.

## What Remained Untouched

- No routes changed.
- No navigation changed.
- No code behavior changed.
- No migrations changed.
- No features deleted.
- No dormant features removed.
- No deployment configuration changed.

## Audit Conclusion

Rental Passport has a strong foundation and a large amount of useful work that should be preserved. The main risk is not lack of code; it is over-presenting partially implemented foundations as production verification infrastructure.

The next phase should make status honesty explicit, complete legal/policy pages, verify Supabase security in a real environment, and choose one production verification workflow to finish end to end before expanding.
