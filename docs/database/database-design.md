# Database Design

Placeholder for PostgreSQL and Supabase schema design.

## Data Philosophy

Rental Passport will store sensitive renter identity and application data. Schema design must be privacy-first, auditable, consent-aware, and compatible with strict Row Level Security.

## Future Data Domains

No database tables are defined yet. Future data domains may include renter passports, identity records, contact information, documents, verification status, sharing permissions, activity history, integrations, OAuth clients, webhook subscriptions, and audit logs.

## Constraints

- Do not design tables until product workflows and permissions are explicit.
- Row Level Security must be treated as a core design requirement, not an afterthought.
- Sensitive document storage and database metadata must be modeled separately.
- Sharing permissions and expiration rules must be auditable.

## Current Scope

No migrations, database tables, policies, triggers, functions, or seed data are implemented yet.