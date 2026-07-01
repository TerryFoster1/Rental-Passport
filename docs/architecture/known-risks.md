# Known Risks

## Platform Risks

- Over-coupling early workflows to the React web client would undermine the API-first platform goal.
- Sensitive renter data creates significant privacy, security, compliance, and trust obligations.
- Verification workflows may depend on third-party providers with different accuracy, latency, cost, and geographic coverage.
- Credit, identity, escrow, financial services, insurance, and rent reporting may require legal and regulatory review.
- Public API, OAuth, SDK, and webhook surfaces will need strong abuse prevention, monitoring, rate limiting, and auditability.

## Scope Risks

Rental Passport must not drift into property management, maintenance, messaging, inspections, payment collection, accounting, vendor management, or lease administration. Those belong inside Rental District or other downstream systems.

## Current Scope

Risks are documented for planning only. No product workflows or integrations are implemented yet.