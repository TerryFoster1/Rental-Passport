# Developer and Partner Portal

Rental Passport should eventually provide a hidden developer/API portal for partners integrating the trusted rental identity layer.

The broader integration model is defined in `docs/api/partner-integration-strategy.md`.

## Audiences

- Listing websites
- Property management software
- Brokerages
- Landlords
- Marketplaces
- Screening providers
- Enterprise partners

## Portal Goals

- Explain the value of "Apply with RentalPassport.io"
- Document secure passport sharing
- Document verification status retrieval
- Support partner onboarding
- Provide sandbox credentials and test passports
- Explain legal and privacy constraints

## Future Documentation Areas

- OAuth 2.0 and OpenID Connect
- REST APIs
- JavaScript SDK
- Webhooks
- Partner onboarding
- "Apply with RentalPassport.io" button
- Application acceptance
- Application withdrawal
- Lease handoff
- Rental District integration

## API Philosophy

Partner APIs expose verified facts, Passport Completeness, section verification statuses, evidence summaries, and permitted application outputs. They must not expose raw documents by default or provide applicant ranking.
