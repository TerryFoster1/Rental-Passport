# Rental District / Rental Passport Ownership

Date: 2026-07-23

## Rule

Rental Passport owns trust and evidence. Rental District owns rental operations.

## Rental District Only

- Property, unit, and listing creation
- Showing scheduling
- Rental application initiation
- Property-specific questions
- Applicant status and landlord decision
- Lease generation and signing
- Tenant creation and tenancy management
- Maintenance, inspections, communications, rent/payment tracking
- Operational documents and reports

## Rental Passport Only

- Reusable renter profile
- Passport versioning and completeness
- Evidence collection and secure document vault
- Identity/contact/employment/income/rental history/reference/credit verification
- Consent records
- Verification status, expiry, reverification, certificates
- Internal verification operations
- Partner-safe summaries
- Secure viewer access and revocation
- Verification audit trail and API/webhook platform

## Shared Workflows

| Workflow | Authority of Record | Shared Data |
|---|---|---|
| Applicant applies with passport | Rental District for application; Rental Passport for passport | `partner_application_id`, `passport_id`, summary status |
| Applicant creates passport from Rental District invite | Rental Passport | invite token, partner application id |
| Landlord views passport summary | Rental Passport | viewer session, permitted summary |
| Landlord requests missing information | Rental District may initiate; Rental Passport owns verification/evidence request | request id, section key, message |
| Applicant accepted | Rental District | acceptance event metadata only |
| Passport revoked/expired | Rental Passport | revocation/expiry event to Rental District |

## Fields Rental District Must Not Own

- Raw ID images
- Selfie images
- Full credit report
- Internal reviewer notes
- Internal AI/inconsistency flags
- Verification evidence records
- Consent record source of truth

