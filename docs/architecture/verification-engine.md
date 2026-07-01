# Verification Engine Architecture

Rental Passport is a verification platform, not a document sharing platform. The verification engine is the core product layer that converts private evidence into trusted, permissioned summaries landlords can rely on.

## Product Promises

Every verification capability must reinforce:

- Fill It Out Once.
- Apply Anywhere.
- Protect Your Information.

If a verification feature does not reduce repeated applications, improve portability, or protect renter data, it should be deferred or redesigned.

## Core Principle

Documents remain private by default. Landlords receive verification status, evidence summaries, confidence, freshness, and audit context. They do not receive raw documents unless the renter explicitly grants that permission in a future document-sharing workflow.

## Verification Record

Every verification result should produce an independently versioned record with:

- Verification status: `verified`, `partially_verified`, `unable_to_verify`, `requires_review`, `expired`, `revoked`
- Verification method
- Verification date
- Verified by: internal reviewer, provider, automated system, or partner integration
- Confidence level: high, medium, low, or manual-review required
- Expiry date
- Reverification requirements
- Evidence summary
- Fraud signals reviewed
- Audit trail
- Passport version reference
- Consent reference

## Verification Domains

### Identity

Identity verification should support multiple providers and methods:

- Government ID
- Facial match
- Phone
- Email
- Address
- Date of birth
- Legal name
- Document authenticity
- Duplicate identity detection
- Expired document detection
- Confidence scoring

### Employment

Employment verification should allow several paths:

- Direct employer contact
- Employment letter review
- HR verification
- Corporate email verification
- Pay stub review
- Bank deposit matching
- Future payroll provider integration

Employment may resolve to verified, partially verified, unable to verify, or requires review.

### Income

Income verification should support renters with traditional and non-traditional income:

- Pay stubs
- Bank deposits
- Employment verification
- Tax documents
- Government income statements
- Gig worker income
- Self-employed income

Each income verification must document methodology, evidence freshness, period covered, and confidence level.

### Rental History

Rental history must never require a lease. Multiple evidence paths should be available:

- Direct landlord contact
- Property manager confirmation
- Lease review
- Payment history review
- Bank transfer matching
- Inspection records
- Executed lease confirmation
- Landlord questionnaire

### References

Reference verification should support personal references, professional references, property managers, roommates, and former employers.

Reference evidence should track:

- Contacted
- Responded
- Verified identity
- Relationship confirmed
- Would recommend applicant
- Additional notes

### Credit

Credit verification should support:

- Provider pull through Rental Passport
- Recent report upload
- Future provider APIs

Initial provider targets include Equifax, TransUnion, SingleKey, FrontLobby, and future regional providers. Raw credit reports must not be exposed to landlords by default. Landlords receive verified summaries and key factors only.

## Verification Evidence

Landlords should understand how a claim was verified without receiving the underlying private documents.

Example evidence summaries:

- Employment: employer contacted directly, employment letter reviewed, pay stub reviewed, bank deposits matched
- Rental history: previous landlord contacted, lease reviewed when available, payment history reviewed
- Identity: government ID verified, facial verification passed, address confirmed
- Credit: provider source confirmed, report current, key credit factors summarized

## Rental Passport Confidence

The confidence score measures the reliability and freshness of the passport, not the quality of the tenant.

Inputs may include:

- Identity verification
- Employment verification
- Income verification
- Rental history verification
- Reference verification
- Credit verification
- Document authenticity
- Fraud indicators
- Passport completeness
- Verification freshness
- Version consistency

The score must avoid discriminatory tenant ranking. Labels should describe passport confidence, for example `Highly Trusted`, not personal worthiness.

## Passport Versioning

Every passport must support version history.

Example:

1. Version 1 is fully verified.
2. Employment changes.
3. Version 2 marks employment as requiring reverification.
4. Other verified sections remain intact until they expire or are changed.

Versioning must track:

- Version history
- Change history
- Verification history
- Consent history
- Audit log

## Regional Application Engine

The application engine should auto-detect country, province, state, and region, then generate the appropriate application format.

Targets include:

- Ontario rental application
- British Columbia rental application
- California application
- Texas application
- Custom landlord application
- Future jurisdictions

The renter should never type the same information twice.

## Lease Workflow Boundary

Rental Passport owns the pre-tenancy lifecycle:

Passport -> Verification -> Application -> Approval -> Regional lease generation -> Lease auto-fill -> Digital signatures -> Executed lease -> Rental District.

Rental District should be treated as powered by Rental Passport for active tenancy management after acceptance.

## Landlord Downloads

Allowed downloads:

- Completed Rental Application
- Verification Summary
- Employment Summary
- Rental History Summary
- Identity Summary
- Credit Summary
- Reference Summary
- Executed Lease
- Application Package

Not allowed by default:

- Driver's licence
- Pay stubs
- Bank statements
- Credit reports
- Employment letters
- Supporting documents

Raw documents require explicit renter authorization in a future permissioned sharing workflow.
