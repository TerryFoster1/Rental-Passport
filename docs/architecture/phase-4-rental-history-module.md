# Phase 4 Rental History Module

Status: Implemented tenant-facing rental history module

Phase 4 makes Rental History the second full Rental Passport section. It adds tenant rental records, landlord/property manager contacts, supporting document uploads, consent capture, verification readiness signals, and passport section status updates.

## Implemented Scope

- Rental History page at `/passport/rental-history`
- Add, edit, and remove rental records
- Current residence toggle
- Address fields
- Date range fields
- Landlord/property manager contact fields
- Supporting document upload areas
- Optional rent payment proof upload
- Consent checkboxes
- Verification readiness card
- Save draft action
- Mark ready for review action
- Under review placeholder action
- Rental History section status updates in the passport framework
- Passport activity entries for rental history events
- Private rental history document storage metadata
- Supabase Storage private bucket policy for rental history documents
- Rental-history-specific migration

## Data Model

Phase 4 adds:

- `rental_history_records`
- `rental_history_contacts`
- `rental_history_documents`
- `rental_history_verification_requests`
- `rental_history_verification_signals`

Rental history records belong to a passport version. Future versioning and reverification workflows can compare rental history changes against the version that was reviewed.

## Verification Philosophy

Rental history verification answers:

- Was this tenancy real?
- Did the tenant live at this address during these dates?
- Can a landlord or property manager confirm the tenancy?
- Do supporting documents match the tenant claim?

Rental Passport does not create a tenant quality score, rank tenants, or promise proof beyond available evidence.

## Consent

The tenant must consent before requesting rental history review:

- Contacting the landlord or property manager
- Reviewing rental history documents
- Using rental history information in Rental Passport
- Sharing a verified rental history summary with intended landlords in future sharing flows

Consent is written to `consent_records` using `rental-history-consent-v1`.

The current consent infrastructure supports user ID, timestamp, consent type, consent version, metadata, and optional IP hash. Device capture is not implemented yet.

## Upload Security

Rental history documents are stored in the private `rental-history-documents` Supabase Storage bucket.

Storage object paths begin with the authenticated user ID and RLS policies restrict read, upload, update, and delete access to that owner path.

The app stores document metadata but does not generate public download URLs.

## Explicitly Out of Scope

- Landlord rental history detail page
- Automated landlord email verification
- Landlord secure response portal
- AI verification
- OCR
- Property ownership lookup
- Bank integrations
- Credit workflows
- References module
- Identity module
- Landlord dashboard
- Payments
