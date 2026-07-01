# Fraud Detection Strategy

Rental Passport must detect fraud while preserving renter privacy and avoiding discriminatory decisioning. Fraud controls should protect the integrity of the passport, not create opaque tenant scoring.

## Fraud Signals

Initial signals to evaluate:

- Fake employers
- Fake landlord references
- Disposable email domains
- Temporary or VoIP phone numbers
- Document tampering
- Duplicate identities
- Stolen identities
- Address inconsistencies
- Income inconsistencies
- Reference relationship anomalies
- Suspicious verification patterns
- Multiple passports using the same evidence
- IP and device anomalies
- Document confidence scoring

## Mitigation Patterns

- Require stronger evidence when confidence is low.
- Escalate suspicious verification records to manual review.
- Record all fraud signals in an audit trail.
- Separate fraud confidence from tenant quality.
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

Fraud detection must be designed for PIPEDA, GDPR, SOC 2 readiness, and future ISO 27001 readiness. Any automated decisioning must be explainable, reviewable, and narrowly scoped to passport confidence.
