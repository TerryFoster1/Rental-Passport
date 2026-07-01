# Known Risks

## Product and Legal Risks

- Rental Passport must not drift into tenant scoring, applicant ranking, approval recommendations, or automated housing decisions.
- Filtering, questions, leases, credit usage, income presentation, and Verified Deposit escrow rules vary by jurisdiction.
- Illegal screening questions must be suppressed automatically.
- Verified Deposit requires legal review before implementation.
- OpenRoom search and enhanced landlord reports require careful compliance review.
- Manual-first MVP review creates operational quality and reviewer-training risk.

## Privacy and Security Risks

- Sensitive renter data creates significant privacy, security, compliance, and trust obligations.
- Raw documents must not become landlord downloads by accident.
- Shared passports must not become public links by accident.
- Supporting document viewers must be protected against casual sharing.
- Document Integrity Assessment must not expose sensitive fraud signals unnecessarily.
- Public API, OAuth, SDK, and webhook surfaces will need strong abuse prevention, monitoring, rate limiting, and auditability.

## Architecture Risks

- Business logic could drift into the React frontend unless API boundaries are enforced.
- Verification status could be modeled incorrectly as permanent user status rather than passport-version status.
- Activity history and audit logs must be tamper-evident enough for trust and compliance.
- Secure invitation, magic link, and landlord secure-access flows must not create account-takeover or data-leak paths.

## Scope Risks

Rental Passport owns the pre-tenancy workflow through application, verification, approval support, regional lease generation, digital signature, and executed lease handoff.

Rental Passport must not drift into active tenancy property management, maintenance, messaging, inspections, payment collection, accounting, or vendor management. Those belong inside Rental District or other downstream systems.
