# Permissions Model

Rental Passport permissions are rooted in renter ownership and explicit consent.

## Principles

- The renter owns their data.
- The renter controls who can access it.
- Access must be scoped, time-bound where appropriate, and auditable.
- Verification status must be transparent without exposing unnecessary underlying sensitive data.
- Security comes before convenience.

## Future Permission Surfaces

No permission model is implemented yet. Future surfaces may include renter-owned passport access, landlord review access, temporary sharing links, QR-code access, downloadable PDF access, third-party integration access, service-role verification workflows, and enterprise administrator boundaries.

## RLS Expectations

Supabase Row Level Security must enforce data access at the database layer. Application checks are not a substitute for RLS policies.

## Current Scope

No roles, policies, permission tables, sharing tokens, or access workflows are implemented yet.