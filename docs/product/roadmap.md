# Roadmap

This roadmap is directional. It does not authorize implementation until product, legal, security, and technical plans are approved.

## Strategic Direction

Rental Passport should evolve from a renter-controlled profile into an API-first rental identity layer that can power first-party and third-party application workflows.

The product verifies facts, protects renter privacy, supports legal compliance, and standardizes rental applications. It does not rank people or make rental decisions.

## Phase 1: Production Readiness

- Public homepage and trust pages
- Privacy-first copy and legal placeholders
- Favicon, social metadata, sitemap, and robots
- Public FAQ and contact path
- Clear MVP limitations before real user data collection

## Phase 2: Verification Engine Foundation

- Passport Completeness states
- Section-level verification states
- Confidence levels for authenticity where appropriate
- Manual-first verification review workflows
- Versioned verification records
- Evidence summaries
- Reverification requirements
- Passport Activity History
- Audit trail planning
- Document privacy and permission model

## Phase 3: Compliance-Aware Application Platform

- Jurisdiction detection
- Regional application generator
- Legal filter/question rules
- Illegal question suppression
- Income presentation by facts only
- Default landlord sorting by completeness, verification, and date applied

## Phase 4: Landlord Review Experience

- Applicant list sorted by Passport Completeness and application date
- Secure invitation and Create Secure Access flow
- Simple Applications dashboard created from invited passports
- Minimal passport cover page with only high-value trust signals
- Legal filters only
- Verification evidence drill-down
- Application package downloads
- No raw document downloads by default
- Optional premium verification reports

## Phase 5: API and Integration Platform

- Versioned public REST APIs
- Internal APIs
- OAuth 2.0 and OpenID Connect
- Webhooks
- JavaScript SDK
- Hidden developer/API portal
- "Apply with RentalPassport.io" button documentation
- Enterprise partner integration tooling
- "Apply with RentalPassport.io" integration surface

## Phase 6: Premium Verification and Fraud Services

- OpenRoom search
- AI Fraud Review
- Enhanced Credit Analysis
- Employment Reverification
- Reference Deep Dive
- Document Authenticity Review
- Corporate Verification
- Identity Risk Analysis
- Additional verification reports

AI outputs must be Document Integrity Assessments, not tenant scores.

## Phase 7: Digital Lease Library

- Jurisdiction-specific lease templates
- Automatic template selection
- Lease pre-fill from verified passport data
- Electronic signatures
- Version history
- Audit trail
- Secure executed lease storage
- Future integration with Rental District

## Phase 8: Verified Deposit

Rental Passport Verified Deposit is a future feature requiring legal review.

Concept:

- Tenant places a single verified deposit into escrow.
- The same deposit supports multiple active applications.
- Funds remain securely held.
- Rejected or withdrawn applications leave funds available.
- Accepted applications release funds to the chosen landlord.

Escrow rules differ by jurisdiction and must be reviewed before implementation.
