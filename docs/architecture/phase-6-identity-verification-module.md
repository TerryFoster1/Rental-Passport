# Phase 6 Identity Verification Module

Status: Implemented tenant-facing identity verification module

Phase 6 makes Identity Confirmation the fourth full Rental Passport section. It allows tenants to enter legal identity details, upload government ID images and a selfie, view email and phone verification states, provide consent, and prepare the section for manual review.

## Implemented Scope

- Identity Verification page at `/passport/identity`
- Legal identity details
- Date of birth and current address fields
- Contact verification status
- Email verification state from Supabase Auth
- Phone verification manual placeholder
- Government ID front upload
- Government ID back upload
- Selfie upload
- Private uploaded-file metadata
- Privacy and consent card
- Verification readiness checklist
- Save draft action
- Mark ready for review action
- Under review placeholder action
- Passport section status updates
- Passport activity entries for identity events
- Identity review notes placeholder table

## Data Model

Phase 6 adds:

- `identity_profiles`
- `identity_documents`
- `identity_selfies`
- `identity_verification_requests`
- `identity_verification_signals`
- `phone_verification_status`
- `identity_review_notes`

Identity data belongs to a passport version. Editing a verified identity profile can mark only Identity Confirmation as needing reverification.

## Upload Security

Identity documents and selfies are stored in the private `identity-documents` Supabase Storage bucket.

Storage object paths begin with the authenticated user ID and RLS policies restrict read, upload, update, and delete access to that owner path.

The app does not generate public links, does not expose raw ID files in landlord views, and does not use selfies as profile photos.

## Consent

The tenant must consent before requesting identity review:

- Reviewing government ID
- Reviewing selfie
- Confirming legal identity details
- Storing identity verification result
- Sharing identity verification status with intended landlords in future sharing flows

Consent is written to `consent_records` using `identity-consent-v1`.

## Explicitly Out of Scope

- Paid ID verification provider integration
- OCR
- AI face matching
- Document tamper detection
- Landlord identity detail page
- Internal reviewer portal
- Public document access
- Identity scoring
- Tenant risk scoring
