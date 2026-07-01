# Backlog

Backlog items are planning candidates only. Do not implement until scoped, designed, legally reviewed where required, and approved.

## Product Philosophy Guardrails

- Remove all Applicant Score and Tenant Score concepts.
- Use Passport Completeness instead.
- Use Document Integrity Assessment for AI fraud outputs.
- Never recommend approval or rank people by desirability.
- Keep raw renter documents private by default.

## Tenant Backlog

- Build renter passport profile
- Show Passport Completeness
- Show section-level verification states
- Support Identity, Employment, Income, Rental History, References, Credit Report, and Documents
- Support Verified, Self Reported, Needs Review, Needs Verification, Expired, Needs Reverification, and Missing states
- Show High Confidence, Medium Confidence, Low Confidence, or Manual Review Required where appropriate
- Add Passport Activity History
- Add share links, QR codes, and access revocation
- Add document vault and upload consent language

## Landlord Backlog

- Secure invitation flow for intended recipient email
- Create Secure Access flow instead of generic sign-up language
- Simple Applications dashboard populated automatically by received passports
- Minimal passport cover page with highest-value trust signals only
- Applicant list sorted by Passport Completeness, fully verified status, and date applied
- Optional sorting by newest, oldest, recently updated, verification status, and application date
- Legal filters only
- Verification evidence drill-down
- Income presentation with verified monthly income, annual income, method, and income multiple
- Application package download
- No raw document downloads by default

## Verification Backlog

- Manual ID Review in MVP
- Manual and semi-manual document review queues
- Manual provider-assisted credit verification
- Optional AI assistance for internal reviewers
- Versioned verification records
- Identity verification provider abstraction
- Employment verification methods
- Income verification methods
- Rental history verification without requiring a lease
- Reference verification workflows
- Credit summary verification
- Document authenticity review
- Reverification rules

## Compliance Backlog

- Jurisdiction detection
- Country/province/state/territory support
- Future municipality support
- Legal question and filter matrix
- Protected-characteristic suppression
- Regional application generation
- Jurisdiction-specific lease template selection

## Premium Services Backlog

- OpenRoom search
- AI Fraud Review
- Enhanced Credit Analysis
- Employment Reverification
- Reference Deep Dive
- Document Authenticity Review
- Corporate Verification
- Identity Risk Analysis
- Additional verification reports

## Future Financial and Lease Backlog

- Rental Passport Verified Deposit, legal review required
- Jurisdiction-specific digital lease library
- Lease pre-fill from verified passport data
- Electronic signatures
- Executed lease storage
- Rental District handoff

## Platform Backlog

- Public REST APIs
- Internal service APIs
- OAuth 2.0 and OpenID Connect
- Webhooks
- JavaScript SDK
- Hidden developer/API portal
- Apply with RentalPassport.io button docs
- Enterprise integrations
- Stripe payments
- Resend email workflows
- Google Maps integration
