# Database Design

This document describes future data domains only. No database tables are defined or implemented yet.

## Data Philosophy

Rental Passport will store sensitive renter identity and application data. Schema design must be privacy-first, auditable, consent-aware, jurisdiction-aware, and compatible with strict Row Level Security.

The database must support verification facts and audit history. It must not encode tenant desirability scores or applicant rankings.

## Future Data Domains

Future data domains may include:

- Renter passports
- Passport versions
- Passport Completeness state
- Section verification states
- Verification confidence levels
- Manual review queues
- Reviewer decisions
- Identity records
- Contact information
- Employment records
- Income records
- Rental history records
- References
- Credit summaries
- Documents and storage metadata
- Verification records
- Evidence summaries
- Document Integrity Assessments
- Sharing permissions
- Secure invitation tokens
- Intended recipient emails
- Document viewer grants
- Activity history
- Audit logs
- Jurisdiction and compliance rules
- Regional application templates
- Digital lease templates
- Executed leases
- Verified Deposit escrow records, legal review required
- Integrations
- OAuth clients
- Webhook subscriptions

## Constraints

- Do not design tables until product workflows and permissions are explicit.
- Row Level Security must be treated as a core design requirement, not an afterthought.
- Sensitive document storage and database metadata must be modeled separately.
- Sharing permissions and expiration rules must be auditable.
- Secure sharing must be recipient-specific, revocable, and logged.
- Document viewer grants must be time-limited, view-only, watermarkable, and auditable.
- Verification applies to a passport version, not permanently to the user account.
- Jurisdiction must be modeled early enough to suppress illegal questions and filters.
- Activity history must be append-only or otherwise tamper-evident.

## Current Scope

No migrations, database tables, policies, triggers, functions, or seed data are implemented yet.
