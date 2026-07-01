# Manual-First MVP Verification

The MVP should avoid expensive third-party automation where possible. Manual and semi-manual review workflows should launch first, with paid OCR, facial ID matching, automated document verification, credit bureau APIs, and open banking added later only when justified.

## MVP Verification Model

- Tenants upload documents.
- Rental Passport reviewers inspect evidence manually or semi-manually.
- Low-cost AI may assist internal reviewers where safe.
- Final verification decisions must remain reviewable and auditable.
- The MVP must not depend on paid OCR or paid ID verification providers.

## Identity Verification MVP

Tenant uploads:

- Front of government ID
- Back of government ID
- Selfie

Tenant-facing message:

"Identity review is usually completed within 24 hours."

Internal reviewer checks:

- ID name
- ID date of birth
- ID expiry
- ID photo
- Selfie
- Document clarity
- Signs of alteration

Identity phases:

- Manual ID Review in MVP
- AI-Assisted ID Review in future
- Provider-Based ID Verification in later versions

AI may help flag whether a selfie and ID appear to match, but it must not be treated as final legal identity verification unless a compliant provider is added.

## Employment Verification MVP

Employment confidence should be built from multiple signals, not only an email address typed by the applicant.

Signals may include:

- Employer email uses company domain
- Company domain exists
- Employer website exists
- Employer appears to be a real business
- Employer confirmation received through secure link
- Confirmation came from company email
- Pay stub uploaded
- Employment letter uploaded
- Income amount matches uploaded document
- Bank deposit proof uploaded only if tenant chooses
- Manual reviewer confirms consistency

Bank statements should not be mandatory. Bank proof should be optional or requested only when confidence is low.

Landlord-facing wording should say: "Verified by employer confirmation, company domain review, and pay stub review."

## Rental History Verification MVP

Rental history is difficult to verify perfectly. MVP verification should answer:

- Was this tenancy real?
- Did the previous landlord confirm it?
- Were there reported issues?
- Would the previous landlord rent to them again?

Tenant may provide:

- Past address
- Lease document
- Previous landlord contact
- Property manager contact
- Move-in date
- Move-out date
- Reason for leaving
- Optional rent payment proof

Confidence signals:

- Lease confirms residency
- Landlord or property manager responds through secure link
- Landlord contact details appear plausible
- Property address exists
- Landlord phone or email verified
- Tenant-provided dates match lease
- Optional documentation supports payment history

Do not require bank statements by default. Do not add useless metrics such as average response time.

## Reference Verification MVP

References should stay simple.

MVP verifies:

- Reference responded
- Phone or email works
- Relationship declared
- Response captured
- Response date logged

Avoid meaningless reference analytics. Show useful landlord-facing summaries only.

## Credit Verification MVP

For MVP, credit may be handled manually through tenant consent.

Tenant options:

- Upload a recent credit report
- Authorize Rental Passport to manually run a report through an external service such as SingleKey or FrontLobby where legally permitted

Until direct API integrations exist, this is manual provider-assisted credit verification.

Landlord-facing credit summary should show:

- Provider or source
- Report date
- Credit score
- Score range or status
- Collections
- Public records
- Bankruptcy
- Consumer proposal
- Payment history summary
- Whether report was uploaded or sourced through Rental Passport

Do not rank applicants by credit score. Poor credit can still be part of a fully verified passport.
