# Rental Passport Consent Model

Status: demo granular consent implemented, production persistence pending.

Consent must be explicit, timestamped, request-scoped, partner-associated, and auditable.

## Consent Categories

- Identity verification.
- Employment verification.
- Income and document review.
- Rental-history verification.
- Reference contact.
- Supporting document review.
- Credit authorization when requested.
- Sharing completed results with the requesting landlord and partner.

No consent checkbox is pre-selected in the demo.

## Production Requirements

Persist consent records, support revocation where legally required, and enforce consent before provider checks, document viewing, or partner sharing.

