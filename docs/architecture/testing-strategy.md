# Testing Strategy

Testing must protect the three product promises: fill it out once, apply anywhere, and protect your information.

## Required Test Areas

- Passport Completeness calculations
- Section verification status transitions
- Verification confidence labels as authenticity, not applicant quality
- Passport versioning and reverification
- Permission and consent enforcement
- Secure invitation and intended recipient enforcement
- Create Secure Access flow
- Applications dashboard access boundaries
- Raw document access denial for landlords by default
- View-only document viewer expiry, revocation, logging, and watermarking
- Jurisdiction-aware questions and filters
- Regional application generation
- Income presentation without approval recommendations
- Document Integrity Assessment separation from tenant scoring
- Activity history and audit logging

## Frontend Tests

- Public pages and navigation
- Accessibility checks
- Mobile responsiveness
- Status label readability
- Empty, loading, success, and error states once real data exists

## Backend Tests, Future

- RLS policies
- API authorization
- Provider webhook validation
- Upload validation
- Verification workflow idempotency
- Manual review queue auditability
- AI assistance cannot finalize legal identity decisions
- Audit log immutability
- Legal filter suppression by jurisdiction

## Current Scope

No backend tests exist because backend workflows are not implemented yet.
