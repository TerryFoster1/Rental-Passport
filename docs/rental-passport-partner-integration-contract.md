# Rental Passport Partner Integration Contract

Status: implementation-ready demo contract  
Owner: Rental Passport  
Primary demo partner: Rental District V2

## Core Rule

Partner platforms may display a summary, but Rental Passport displays the authoritative application.

Rental Passport owns the verified application record, consent trail, document permissions, verification status, and reviewer audit history. Partner platforms may store only the minimum metadata required to show an application card, route the landlord into the viewer, and continue their own property workflow.

## Source Of Truth

Rental Passport is authoritative for:

- Applicant identity and contact details.
- Passport completeness and verification statuses.
- Uploaded document metadata and document view permissions.
- Verification outcomes, reviewer notes, consent records, and audit events.
- Secure viewer launch sessions.

Partner platforms are authoritative for:

- Property listing data.
- Landlord organization and user identity.
- Application pipeline state inside the partner product.
- Approval, rejection, waitlist, lease generation, digital signature, and tenancy creation.

## Required Identifiers

Every partner-created application must carry:

- `partner_id`: stable partner key, for example `rental_district`.
- `partner_application_id`: partner-side application identifier.
- `partner_property_reference`: partner-side listing/property identifier.
- `rental_passport_application_id`: Rental Passport application identifier.
- `rental_passport_account_id`: Rental Passport account identifier.
- `submitted_at`: ISO timestamp.

## Viewer Launch Contract

Partner platforms request a short-lived viewer session from Rental Passport, then open:

```text
/partner/application/:applicationId?launch_token=:viewerToken
```

The token must be scoped to:

- One application.
- One partner.
- One landlord or property-manager user.
- One set of viewer permissions.
- A short expiration window.

The token must be revocable. Permanent public application links are not allowed.

## Allowed Partner Summary Fields

Rental District may show these fields on an application card:

- Applicant display name.
- Applied with RentalPassport.io.
- Submitted timestamp.
- Property reference.
- Completeness label.
- Identity, employment, rental history, references, and credit status labels.
- Unresolved issue count.
- Viewer launch availability.

Rental District must not persist full documents, sensitive verification evidence, full credit reports, hidden reviewer notes, or raw consent records.

## Action Split

Inside Rental Passport viewer:

- Review verified sections.
- Inspect permitted documents or document summaries.
- Request missing information.
- Request updated documents.
- Request re-verification.
- Mark the application reviewed.

Inside Rental District:

- Approve application.
- Reject application.
- Save or shortlist applicant.
- Schedule showing if it belongs to the property workflow.
- Generate regionally valid lease.
- Send lease for signature.
- Create tenancy after signature.

## Demo Route

Current demo route:

```text
/partner/application/demo-rp-app-001?launch_token=demo-valid-rental-district
```

Demo tokens are front-end only and exist for investor workflow validation. Production must replace them with backend-issued signed sessions.

## Production Requirements

- OAuth client credentials for Rental District.
- Backend endpoint for viewer session issuance.
- Backend token validation and revocation.
- Audit logging for every launch, action request, document view, and close event.
- Tenant consent verification before any landlord access.
- Frame allowlist only for approved partner origins.
- No secrets in browser code.

