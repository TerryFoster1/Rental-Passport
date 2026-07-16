# Rental Passport Partner Import Contract

Status: documented and demo-mode implemented.

## Partner Input

Rental Passport may receive:

- Partner ID.
- Partner application ID.
- Applicant name and email.
- Property/listing reference.
- Landlord or organization name.
- Requested package.
- Credit included flag.
- Selected payer.
- Safe application data available for import.

## Import Rules

- Import only fields the applicant confirms.
- Preserve partner provenance per field.
- Record import timestamp and consent.
- Do not overwrite verified Rental Passport data silently.
- Flag field-level conflicts.
- Do not copy sensitive source documents to partners.

## Demo Conflicts

The demo includes a current-address conflict to show applicant confirmation before import.

