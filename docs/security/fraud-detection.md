# Fraud Detection Strategy

Rental Passport must detect fraud while preserving renter privacy and avoiding discriminatory decisioning. Fraud controls should protect the integrity of passport evidence, not create opaque tenant scoring.

## Product Boundary

Rental Passport AI may produce a Document Integrity Assessment.

It must not produce a Tenant Score, Applicant Score, approval recommendation, or desirability ranking.

AI may assist internal reviewers by summarizing passport details, flagging document inconsistencies, comparing names and dates across uploaded files, helping spot altered PDFs, helping compare selfie and ID photos, summarizing reference responses, summarizing employer confirmations, detecting suspicious employer domains, and detecting inconsistencies across passport sections.

AI must not make final legal identity decisions or replace human review where legal risk exists.

## Fraud Signals

Initial signals to evaluate:

- Fake employers
- Fake landlord references
- Disposable email domains
- Temporary or VoIP phone numbers
- Fake pay stubs
- Altered PDFs
- Photoshopped documents
- Synthetic identities
- Document tampering
- Duplicate identities
- Stolen identities
- Address inconsistencies
- Income inconsistencies
- Reference relationship anomalies
- Suspicious verification patterns
- Multiple passports using the same evidence
- IP and device anomalies
- Document metadata inconsistencies
- Employer legitimacy
- Phone validation
- Selfie and ID photo mismatch
- Mismatched names or dates across sections
- Suspicious employer domains

## Mitigation Patterns

- Require stronger evidence when evidence quality is low.
- Escalate suspicious verification records to manual review.
- Record all fraud signals in an audit trail.
- Separate document integrity from tenant quality.
- Do not expose raw fraud inputs to landlords by default.
- Provide renters with actionable reverification requirements when appropriate.
- Use provider and internal checks with least-privilege access.

## Review Outcomes

Fraud review outcomes should be explicit:

- No issue detected
- Requires additional evidence
- Requires manual review
- Unable to verify
- Confirmed mismatch
- Confirmed duplicate
- Revoked verification

## Compliance Notes

Fraud detection must be designed for PIPEDA, GDPR, SOC 2 readiness, and future ISO 27001 readiness. Any automated analysis must be explainable, reviewable, and narrowly scoped to evidence integrity.
