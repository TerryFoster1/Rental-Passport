# Phase 3 Employment Module

Status: Implemented tenant-facing employment module

Phase 3 makes Employment the first full Rental Passport section. It adds tenant employment data entry, supporting document upload, consent capture, verification readiness signals, and passport section status updates.

## Implemented Scope

- Employment page at `/passport/employment`
- Employer details form
- Job and income form
- Supporting document upload areas
- Optional bank deposit proof upload
- Consent checkboxes
- Verification readiness card
- Save draft action
- Mark ready for review action
- Under review placeholder action
- Employment section status updates in the passport framework
- Passport activity entries for employment events
- Private employment document storage metadata
- Supabase Storage private bucket policy for employment documents
- Employment-specific migration

## Data Model

Phase 3 adds:

- `employment_records`
- `employment_contacts`
- `employment_documents`
- `employment_verification_requests`
- `employment_verification_signals`

Employment records belong to a passport version. Future versioning and reverification workflows can compare employment changes against the version that was reviewed.

## Verification States

Supported employment lifecycle states:

- Not Started
- In Progress
- Ready for Review
- Under Review
- Verified
- Needs More Information
- Needs Reverification
- Expired

Phase 3 implements tenant-driven transitions:

- Not Started to In Progress
- In Progress to Ready for Review
- Ready for Review to Under Review placeholder

Manual verification outcomes are structurally supported but not implemented as operational reviewer workflows.

## Consent

The tenant must consent before requesting employment review:

- Contacting employer
- Reviewing employment documents
- Using employment information in Rental Passport
- Sharing a verified employment summary with intended landlords in future sharing flows

Consent is written to `consent_records` using `employment-consent-v1`.

The current consent infrastructure supports user ID, timestamp, consent type, consent version, metadata, and optional IP hash. Device capture is not implemented yet.

## Upload Security

Employment documents are stored in the private `employment-documents` Supabase Storage bucket.

Storage object paths begin with the authenticated user ID and RLS policies restrict read, upload, update, and delete access to that owner path.

The app stores document metadata but does not generate public download URLs.

## API-First Boundary

The employment page calls `employmentService`.

The service layer owns persistence, upload paths, consent logging, verification signals, passport section status updates, and activity logging. UI components render state and call service functions only.

## Explicitly Out of Scope

- Landlord employment detail page
- Employer email automation
- Employer secure response portal
- AI verification
- OCR
- Pay stub parsing
- Bank integrations
- Credit workflows
- Rental history module
- References module
- Identity module
- Payments
