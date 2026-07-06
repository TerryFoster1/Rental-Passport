# Phase 7 Credit Report Module

Status: Implemented tenant-facing credit report module

Phase 7 makes Credit Report the fifth full Rental Passport section. It lets tenants request a manual provider workflow or upload a recent credit report PDF, capture credit consent, prepare future landlord summary fields, and update passport completeness.

## Implemented Scope

- Credit Report page at `/passport/credit-report`
- Two tenant options:
  - Run my credit report through Rental Passport
  - Upload a recent credit report
- Manual provider request placeholder
- PDF credit report upload
- Credit report summary fields for future landlord-facing summary
- Consent capture for authorization, storage, review, landlord sharing, and expiration
- Verification readiness signals
- Save draft action
- Request verification action
- Under review placeholder action
- Credit Report section status updates
- Passport activity entries for credit events
- Private credit report document metadata
- Credit provider foundation table
- Credit consents foundation table

## Data Model

Phase 7 adds:

- `credit_reports`
- `credit_report_documents`
- `credit_verification_requests`
- `credit_verification_signals`
- `credit_providers`
- `credit_consents`

Credit report records belong to a passport version. Future expiry or replacement can mark only Credit Report as needing reverification.

## Verification Philosophy

Rental Passport verifies:

- Report authenticity
- Report source
- Report date
- Report belongs to the applicant

Rental Passport does not judge the applicant, recommend acceptance or rejection, or expose unnecessary raw bureau data.

## Upload Security

Credit report PDFs are stored in the private `credit-report-documents` Supabase Storage bucket.

Storage object paths begin with the authenticated user ID and RLS policies restrict read, upload, update, and delete access to that owner path.

The app does not create direct public file URLs and does not build landlord access to raw documents.

## Explicitly Out of Scope

- SingleKey API
- FrontLobby API
- Equifax API
- TransUnion API
- AI fraud review
- OCR
- Landlord credit page
- Provider integrations
- Automated report refresh
- Internal reviewer portal
