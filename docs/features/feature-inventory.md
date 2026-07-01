# Feature Inventory

This inventory is directional only and does not define database schema, UI, or API contracts.

## Current Feature State

The project currently contains a frontend MVP and architecture documentation. Backend verification, database schema, provider integrations, real authentication, real uploads, and APIs are not implemented yet.

## Core Feature Domains

- Renter identity
- Contact information
- Government ID
- Employment
- Income
- Rental history
- Previous landlords
- References
- Emergency contacts
- Pets, only where legally permitted
- Vehicles
- Uploaded documents
- Credit report summaries
- Supporting documentation
- Section verification status
- Verification confidence levels for authenticity
- Passport Completeness
- Passport Activity History
- Sharing permissions
- Secure recipient-specific passport invitations
- Create Secure Access for landlords
- Landlord Applications dashboard
- Landlord review
- Regional application generation
- Digital lease library
- Third-party integrations

## Verification Status Features

Every major section should support:

- Verified
- Self Reported
- Needs Review
- Needs Verification
- Expired
- Needs Reverification
- Missing

Where appropriate, sections may also show:

- High Confidence
- Medium Confidence
- Low Confidence
- Manual Review Required

## Explicitly Excluded Features

- Applicant Score
- Tenant Score
- Desirability ranking
- Approval recommendation
- Algorithmic housing decisioning
- Raw document downloads for landlords by default

## Future Premium Landlord Services

- OpenRoom search
- AI Fraud Review
- Enhanced Credit Analysis
- Employment Reverification
- Reference Deep Dive
- Document Authenticity Review
- Corporate Verification
- Identity Risk Analysis
- Additional verification reports

These services must support trust and document integrity, not tenant scoring.

## Future Applicant Comparison

Applicant comparison may compare factual information only:

- Passport Complete
- Identity Verified
- Employment Verified
- Income Verified
- Credit Report Verified
- Rental History Verified
- References Verified
- Move-in Date
- Monthly Income
- Income Multiple
- Credit Score
- Supporting Documentation

It must never recommend, rank, or score applicants.
