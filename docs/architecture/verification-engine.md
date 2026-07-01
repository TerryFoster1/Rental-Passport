# Verification Engine Architecture

Rental Passport is a verification platform, not a document sharing platform and not a tenant scoring platform. The verification engine converts private evidence into trusted, permissioned facts landlords can review.

## Product Promises

Every verification capability must reinforce:

- Fill It Out Once.
- Apply Anywhere.
- Protect Your Information.

## Non-Negotiable Rule

Rental Passport verifies information. It does not judge people, rank applicants, or recommend who deserves housing.

## Core Principle

Documents remain private by default. Landlords receive verification status, evidence summaries, verification freshness, completeness, and audit context. They do not receive raw documents unless the renter explicitly grants that permission in a future document-sharing workflow.

## Passport Completeness

Passport Completeness replaces applicant scoring and tenant scoring.

Supported completeness states:

- 100% Complete and Verified
- Partially Verified
- In Progress

Completeness measures whether requested information has been supplied and independently verified for the current passport version. It never measures whether someone is a better tenant.

## Section Verification Status

Every major section has an independent verification state:

- Identity
- Employment
- Income
- Rental History
- References
- Credit Report
- Documents

Allowed section states:

- Verified
- Self Reported
- Needs Review
- Needs Verification
- Expired
- Needs Reverification
- Missing

Where appropriate, a section may also show confidence levels:

- High Confidence
- Medium Confidence
- Low Confidence
- Manual Review Required

Confidence describes authenticity of the information, not the quality of the applicant.

Verification applies to a passport version, not permanently to the user account.

## Verification Record

Every verification result should produce an independently versioned record with:

- Verification status
- Verification method
- Verification date
- Verified by: internal reviewer, provider, automated system, or partner integration
- Evidence quality: high, medium, low, or manual-review required
- Expiry date
- Reverification requirements
- Evidence summary
- Document integrity assessment where applicable
- Fraud signals reviewed
- Audit trail
- Passport version reference
- Consent reference

## Verification Domains

## Manual-First MVP

The MVP should use manual and semi-manual review before paid automation. See `docs/architecture/manual-first-mvp.md` for identity, employment, rental history, reference, and credit MVP review methods.

Paid OCR, facial ID matching, automated document verification, credit bureau APIs, and open banking should be future enhancements, not MVP dependencies.

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
- Evidence quality assessment

### Employment

Employment verification should allow several paths:

- Direct employer contact
- Employment letter review
- HR verification
- Corporate email verification
- Pay stub review
- Bank deposit matching
- Future payroll provider integration

Employment may resolve to Verified, Self Reported, Needs Verification, Expired, Needs Reverification, or Missing.

### Income

Income verification should support renters with traditional and non-traditional income:

- Pay stubs
- Bank deposits
- Employment verification
- Tax documents
- Government income statements
- Gig worker income
- Self-employed income

Income presentation must show facts, not recommendations:

- Verified Monthly Income
- Verified Annual Income
- Income Verification Method
- Income Multiple relative to advertised rent

Example:

- Monthly Rent: $2,000
- Verified Income: $6,500/month
- Income Multiple: 3.25x

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
- References: direct contact, phone verification, email verification

## Document Integrity Assessment

Rental Passport AI may assess document integrity in the future. This is not a tenant score.

Checks may include:

- Fake pay stubs
- Altered PDFs
- Photoshopped documents
- Synthetic identities
- Disposable email addresses
- Employer legitimacy
- Phone validation
- Reference fraud
- Device fingerprint anomalies
- Document metadata inconsistencies

Outputs should describe document integrity and review requirements, not tenant desirability.

## Default Landlord Sorting

Default applicant lists should sort by:

1. Passport Completeness
2. Fully Verified Passports
3. Date Applied

Optional sorting may include newest, oldest, recently updated, verification status, and application date.

No algorithmic ranking of people should exist.

## Filtering Philosophy

Filtering is allowed. Scoring people is not.

Supported filters may include:

- Fully Verified
- Identity Verified
- Employment Verified
- Income Verified
- Rental History Verified
- Credit Report Verified
- References Verified
- Document Complete
- Application Date
- Move-in Date
- Monthly Income
- Verified Income Multiple
- Pets, only where legally permitted
- Smoking Preference, where legal
- Parking Required
- Other legal search criteria

The platform must automatically enable or disable filters based on local housing regulations.

## Passport Versioning

Every passport must support version history.

Example:

1. Version 1 is fully verified.
2. Employment changes.
3. Version 2 marks employment as Needs Reverification.
4. Other verified sections remain intact until they expire or are changed.

Versioning must track:

- Version history
- Change history
- Verification history
- Consent history
- Activity history
- Audit log

## Passport Activity History

Activity history should include:

- Employment verified
- Identity verified
- Credit report refreshed
- Passport shared
- Passport viewed
- Verification expired
- Landlord accepted application
- Documents updated

## Regional Application Engine

The application engine should auto-detect country, province, state, territory, region, and future municipality, then generate the appropriate application format.

Targets include:

- Ontario rental application
- British Columbia rental application
- California application
- Texas application
- Custom landlord application
- Future jurisdictions

The renter should never type the same information twice.

## Digital Lease Library

Future lease capabilities should include:

- Jurisdiction-specific lease templates
- Automatic template selection based on location
- Pre-fill from verified passport data
- Electronic signatures
- Version history
- Audit trail
- Secure storage
- Future integration with Rental District

## Lease Workflow Boundary

Rental Passport owns the pre-tenancy lifecycle:

Passport -> Verification -> Application -> Landlord decision -> Regional lease generation -> Lease auto-fill -> Digital signatures -> Executed lease -> Rental District.

Rental District should be treated as powered by Rental Passport for active tenancy management after acceptance.

## Verified Deposit

Rental Passport Verified Deposit is a future roadmap capability and requires legal review.

Concept:

- Tenant places a single verified deposit into escrow.
- The same deposit can support multiple active applications.
- Funds remain securely held.
- If rejected or withdrawn, the deposit remains available.
- If accepted, the deposit is released to the chosen landlord.

Benefits include fewer duplicate cheques, less deposit uncertainty, fewer bounced payments, and verified available funds.

Escrow rules differ across jurisdictions, so this must not be implemented without legal review.

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
