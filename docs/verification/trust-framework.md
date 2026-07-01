# Trust Framework

This is the source of truth for Rental Passport verification. It defines how Rental Passport communicates trust without scoring, ranking, or recommending applicants.

## Verification Principles

- Rental Passport verifies information.
- Rental Passport does not rank people.
- Rental Passport does not recommend approval.
- Confidence describes evidence authenticity and review strength, not applicant quality.
- Landlords receive trusted facts and evidence summaries.
- Sensitive evidence remains private unless the renter explicitly authorizes view-only access.

## Verification Language

### Verified

Information is marked Verified when Rental Passport has reviewed sufficient evidence for the current passport version and recorded the method, reviewer or provider, date, expiry, evidence summary, and audit trail.

### High Confidence

High Confidence means evidence is strong, recent, internally consistent, and reviewed through a reliable method. Examples include employer confirmation from a company domain plus matching pay stub, landlord confirmation plus lease consistency, or government ID plus selfie review with no alteration concerns.

### Medium Confidence

Medium Confidence means evidence supports the claim but has limitations. Examples include a clear uploaded document without direct third-party confirmation, a landlord response from a plausible non-business email, or income evidence that is consistent but incomplete.

### Low Confidence

Low Confidence means evidence is weak, stale, inconsistent, or difficult to independently confirm. Low Confidence does not describe the applicant. It describes the evidence.

### Manual Review Required

Manual Review Required means automation or initial review found uncertainty that must be evaluated by a trained reviewer before a verification state is finalized.

## Section Statuses

Allowed statuses:

- Verified
- Self Reported
- Needs Review
- Needs Verification
- Expired
- Needs Reverification
- Missing

## Evidence Strength

Strong evidence:

- Direct confirmation through secure link
- Company-domain confirmation
- Provider-sourced report
- Government-issued identity document with matching selfie
- Lease plus matching dates
- Multiple consistent evidence sources

Optional evidence:

- Bank deposit proof
- Rent payment proof
- Additional employment letters
- Additional reference context
- Supporting documents not required by jurisdiction

Weak evidence:

- Unverified free-email confirmation
- Old documents
- Incomplete documents
- Documents with mismatched names, dates, or addresses
- Evidence that cannot be tied to the renter or current passport version

## Reverification

Reverification is required when:

- Employment changes
- Income changes materially
- Identity document expires
- Credit report becomes stale
- Rental history is updated
- A section's expiry date passes
- Fraud flags or inconsistencies appear
- A document is replaced
- A jurisdiction-specific rule requires renewed consent or evidence

## Expiry Guidance

Final expiry windows require legal and product approval. Planning defaults:

- Identity: expires when ID expires or when provider/reviewer rules require refresh
- Employment: 90 to 180 days
- Income: 60 to 120 days
- Credit: 30 to 90 days depending on jurisdiction and use case
- Rental history: refreshed when new tenancy history is added
- References: refreshed when reference age or application context makes the response stale

## Landlord Visibility

Landlords see:

- Passport Completeness
- Section status
- Confidence level where appropriate
- Verification date
- Expiry or reverification date
- Verification method
- Evidence summary
- Permitted application and certificate downloads

Landlords do not see by default:

- Raw ID documents
- Pay stubs
- Bank records
- Raw credit reports
- Employment letters
- Leases
- Reference responses
- Internal reviewer notes
- Fraud investigation details

## Uncertainty Communication

Uncertainty should be plain and factual:

- "Employer confirmation not yet received."
- "Document uploaded, pending manual review."
- "Evidence supports the claim, but direct third-party confirmation is unavailable."
- "This section needs reverification because the evidence expired."

Avoid vague or judgmental labels.

## Fraud Handling

Fraud concerns are handled as evidence integrity issues. Fraud flags may trigger manual review, requests for more information, or verification revocation. Fraud outputs must never become tenant scores.

## AI Assistance

AI may assist reviewers by flagging inconsistencies, summarizing responses, comparing names and dates, spotting possible alteration, and prioritizing manual review.

AI cannot:

- Make final housing decisions
- Recommend approval
- Rank tenants
- Make final legal identity determinations
- Override human reviewers

## Human Override

Human reviewers may override AI suggestions when evidence, policy, or legal context supports the decision. Overrides must record reviewer identity, reason, timestamp, and affected passport version.

## Audit Requirements

Every verification decision must record:

- Passport version
- Section
- Evidence reviewed
- Status
- Confidence level where applicable
- Method
- Reviewer or provider
- Decision date
- Expiry date
- Reviewer notes
- Tenant-facing summary
- Landlord-facing summary
- Internal-only fraud notes where applicable
