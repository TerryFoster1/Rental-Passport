# Phase 2 Passport Framework

Status: Implemented framework layer

Phase 2 creates the tenant-facing passport shell and the backend structure future passport modules will plug into.

## Implemented Scope

- Tenant dashboard at `/dashboard`
- Passport overview at `/passport`
- Tenant preview at `/passport/preview`
- Passport activity log at `/passport/activity`
- Passport settings placeholder at `/passport/settings`
- Section placeholder routes:
  - `/passport/rental-history`
  - `/passport/employment`
  - `/passport/references`
  - `/passport/credit-report`
  - `/passport/identity`
- Passport completeness model
- Five modular passport section cards
- Section navigation
- Draft passport state
- Draft version state
- Reverification placeholder fields
- Passport activity log foundation
- Service-layer passport operations
- Supabase migration for passport shell, versions, section status, and activity

## Explicitly Out of Scope

The following remain unimplemented:

- Rental history forms
- Employment forms
- References forms
- Credit report workflow
- Identity upload workflow
- Landlord dashboard
- Secure sharing
- Verification reviewer portal
- Payments
- Third-party integrations

## Completeness Language

Passport completeness is not a tenant score.

Approved language:

- "Your passport is 40% complete"
- "Complete sections"
- "Verified sections"
- "Missing sections"
- "Needs reverification"

Disallowed language:

- Tenant score
- Applicant score
- Ranking
- Approval recommendation

## Data Model

Phase 2 adds:

- `passports`
- `passport_versions`
- `passport_section_statuses`
- `passport_activity_logs`

The section status table stores only framework status, progress, verification state, and reverification placeholders. It does not store section payloads.

## API-First Boundary

Frontend pages consume `passportService` through `usePassportSummary`.

Components render data and trigger navigation only. Supabase access and passport calculations live outside UI components so future REST APIs, SDKs, mobile clients, and partner integrations can reuse the same product boundary.

## Security

All Phase 2 passport routes are protected.

RLS restricts passport records, versions, section statuses, and activity logs to the owning authenticated user.

Landlord access is not implemented in Phase 2.
