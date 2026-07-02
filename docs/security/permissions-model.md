# Permissions Model

Rental Passport permissions are rooted in renter ownership and explicit consent.

The detailed role-by-role implementation boundary is defined in `docs/security/permissions-matrix.md`.

## Principles

- The renter owns their data.
- The renter controls who can access it.
- Access must be scoped, time-bound where appropriate, revocable, and auditable.
- Verification status must be transparent without exposing unnecessary underlying sensitive data.
- Security comes before convenience.
- Landlords receive trusted facts, not raw private documents by default.

## Permissioned Outputs

Landlords may access:

- Completed Rental Application
- Verification Summary
- Verification Certificate
- Employment Summary
- Rental History Summary
- Identity Summary
- Credit Summary
- Reference Summary
- Executed Lease
- Application Package
- Verification evidence summaries
- Passport Activity History entries relevant to their access

Landlords may not access by default:

- Driver's licence
- Pay stubs
- Bank statements
- Credit reports
- Employment letters
- Supporting documents
- Leases
- Reference responses

Raw documents require explicit renter authorization in a future document-specific sharing workflow.

## Authorized Document Viewer

If supporting documents are viewable online in the future, the viewer must be:

- Authenticated
- Recipient-specific
- Time-limited
- Revocable
- Logged
- View-only
- Watermarkable
- Inaccessible after expiry or tenant revocation

## Future Permission Surfaces

Phase 1 implements only the foundational account role and permission layer required for protected routing and future access control. It does not grant access to passport data because passport data is not implemented yet.

Implemented Phase 1 roles:

- `tenant`
- `landlord`
- `property_manager`
- `verification_reviewer`
- `support`
- `compliance`
- `administrator`

Future surfaces may include renter-owned passport access, landlord secure access, recipient-specific invitation access, landlord Applications dashboard access, temporary sharing links, QR-code access, downloadable application package access, third-party integration access, service-role verification workflows, enterprise administrator boundaries, escrow access boundaries, and lease-signing access boundaries.

## Sorting and Filtering Permissions

The landlord experience may support legal sorting and filtering, but must not support ranking people by desirability.

Default sorting:

1. Passport Completeness
2. Fully Verified Passports
3. Date Applied

Filters must be jurisdiction-aware and automatically disabled where prohibited.

## RLS Expectations

Supabase Row Level Security must enforce data access at the database layer. Application checks are not a substitute for RLS policies.

## Current Scope

No roles, policies, permission tables, sharing tokens, or access workflows are implemented yet.
