# Phase 5 References Module

Status: Implemented tenant-facing references module

Phase 5 makes References the third full Rental Passport section. It allows tenants to add personal and professional references, capture consent, prepare future verification requests, track readiness signals, and update passport section status.

## Implemented Scope

- References page at `/passport/references`
- Add, edit, and remove multiple references
- Reference categories:
  - Previous Landlord
  - Professional
  - Personal
  - Property Manager
  - Character Reference
  - Other
- Relationship and preferred contact method fields
- Consent checkboxes
- Verification readiness card
- Save draft action
- Mark ready for review action
- Under review placeholder action
- References section status updates in the passport framework
- Passport activity entries for reference events
- Reference verification request and signal foundations
- Reference notes and optional future document metadata tables

## Data Model

Phase 5 adds:

- `references`
- `reference_relationships`
- `reference_verification_requests`
- `reference_verification_signals`
- `reference_notes`
- `reference_documents`

Reference records belong to a passport version. Future verification workflows can update each reference independently without changing unrelated passport sections.

## Verification Philosophy

References answer:

- Have independent people confirmed this applicant's information?
- Is contact information complete enough for future review?
- Has the tenant consented to reference contact and summary sharing?

Rental Passport does not create a reference score, ranking, recommendation algorithm, or tenant quality metric.

## Consent

The tenant must consent before requesting reference review:

- Contacting references
- Verifying supplied information
- Storing verification results
- Sharing verified reference summaries with intended landlords in future sharing flows

Consent is written to `consent_records` using `references-consent-v1`.

## Explicitly Out of Scope

- Landlord reference page
- Automated emails
- Secure reference portal
- AI summaries
- SMS verification
- Reference scoring
- Recommendation algorithms
- Fraud detection
- Internal reviewer workflows
