# Rental Passport Database Audit

Date: 2026-07-23  
Source: `supabase/migrations/*.sql`

## Schema Summary

The migration set defines 69 public tables across identity, passport framework, employment, rental history, references, identity verification, credit, sharing, internal verification, and API platform. RLS is enabled in each migration that creates domain tables. This is a serious schema foundation, but it has not been verified against a live Supabase project in this audit.

## Migration Inventory

| Migration | Tables | Notes |
|---|---|---|
| `202607010001_phase1_identity_foundation.sql` | `profiles`, `roles`, `user_roles`, `permissions`, `role_permissions`, `consent_records`, `audit_logs` | Auth/profile/RBAC/consent/audit foundation; includes `SECURITY DEFINER` functions. |
| `202607010002_phase2_passport_framework.sql` | `passports`, `passport_versions`, `passport_section_statuses`, `passport_activity_logs` | Passport shell, versions, section status, activity. |
| `202607020001_phase3_employment_module.sql` | `employment_records`, `employment_contacts`, `employment_documents`, `employment_verification_requests`, `employment_verification_signals` | Data and document metadata for employment. |
| `202607060001_phase4_rental_history_module.sql` | `rental_history_records`, `rental_history_contacts`, `rental_history_documents`, `rental_history_verification_requests`, `rental_history_verification_signals` | Rental history data/evidence foundation. |
| `202607060002_phase5_references_module.sql` | `references`, `reference_relationships`, `reference_documents`, `reference_notes`, `reference_verification_requests`, `reference_verification_signals` | References foundation. |
| `202607060003_phase6_identity_verification_module.sql` | `identity_profiles`, `identity_documents`, `identity_selfies`, `identity_verification_requests`, `identity_verification_signals`, `identity_review_notes`, `phone_verification_status` | Manual identity review and phone placeholder state. |
| `202607060004_phase7_credit_report_module.sql` | `credit_providers`, `credit_reports`, `credit_report_documents`, `credit_consents`, `credit_verification_requests`, `credit_verification_signals` | Manual/provider-assisted credit model. |
| `202607060005_phase8_secure_sharing_landlord_experience.sql` | `passport_shares`, `share_tokens`, `share_access_logs`, `landlord_applications`, `application_status_history`, `application_messages`, `secure_view_sessions`, `document_access_logs` | Sharing, access logs, view session placeholders. |
| `202607060006_phase9_internal_verification_portal.sql` | `verification_cases`, `verification_assignments`, `verification_notes`, `verification_checklists`, `verification_decisions`, `fraud_flags`, `customer_information_requests`, `reviewer_activity`, `reviewer_roles`, `case_history` | Internal operations tables and reviewer policies. |
| `202607060007_phase9_senior_reviewer_seed.sql` | none | Seed only. |
| `202607060008_phase10_api_platform_partner_ecosystem.sql` | `developer_accounts`, `api_clients`, `api_keys`, `oauth_clients`, `oauth_tokens`, `partner_integrations`, `webhook_subscriptions`, `webhook_events`, `api_logs`, `rate_limit_records`, `integration_settings` | Partner/API platform foundation. |

## Ownership

Rental Passport owns: all profile/passport/verification/evidence/share/audit/API tables listed above.

Rental District owns: properties, units, listings, application workflow, showing scheduling, tenancy, lease, maintenance, inspections, payments, reports, and operational documents. Those are intentionally not present in this Rental Passport schema.

Shared identifiers required:

- `rental_passport_account_id`
- `passport_id`
- `passport_version_id`
- `partner_id`
- `partner_application_id`
- `rental_district_listing_id`
- `rental_district_application_id`

## RLS and Policy Findings

- RLS is enabled broadly.
- Policies mostly constrain rows by `auth.uid()`, owner user id, tenant user id, landlord email, or internal reviewer functions.
- The implementation should avoid relying on `TO authenticated` alone; policies should always be reviewed for row ownership.
- `SECURITY DEFINER` functions must be checked for `search_path`, EXECUTE grants, and whether they are callable by public roles.
- Live Supabase advisors were not run in this audit because no production database changes were requested.

## Storage Findings

Named buckets appear in service code and table checks:

- `identity-documents`
- `employment-documents`
- `rental-history-documents`
- `credit-report-documents`

Required next checks:

- Confirm buckets exist in the live Supabase project.
- Confirm buckets are private.
- Confirm storage RLS policies restrict paths by tenant user id and authorized viewer sessions.
- Confirm signed URLs are short-lived and logged.

## Schema-Code Mismatches / Risks

- Frontend services directly insert many rows; backend orchestration is absent.
- Verification case creation is not consistently linked from section request rows.
- Share tokens are hashed, but token validation and viewer-session issuance need server enforcement.
- Document access tables exist, but no complete view-session implementation is proven.
- Provider/API tables exist but production OAuth/API key logic is placeholder.

## Recommendation

Before production data:

1. Apply migrations to a disposable Supabase project.
2. Run Supabase advisors.
3. Run live RLS tests for tenant, landlord, reviewer, and anonymous roles.
4. Implement backend-only operations for partner APIs, secure document viewing, and verification decisions.
5. Add a schema contract test that fails on missing tables/policies.

