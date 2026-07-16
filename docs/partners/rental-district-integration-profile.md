# Rental District Integration Profile

Status: handoff-ready for Rental District V2

## Partner Identity

- Partner name: Rental District
- Partner id: `rental_district`
- Demo property reference: `rd_listing_123-maple-unit-1204`
- Demo Rental Passport application id: `demo-rp-app-001`

## Rental District Application Card

Rental District should create a card that says:

```text
Kathryn Casey applied with RentalPassport.io
```

The card may display:

- Applicant display name.
- Property address.
- Submitted timestamp.
- Verification summary badges.
- Unresolved issue count.
- Button: `Open Rental Passport`.

## Viewer Launch

For the demo, open:

```text
https://rentalpassport.io/partner/application/demo-rp-app-001?launch_token=demo-valid-rental-district
```

For local testing:

```text
http://127.0.0.1:5173/partner/application/demo-rp-app-001?launch_token=demo-valid-rental-district
```

Production must request a fresh launch token before every landlord viewer open.

## Rental District Responsibilities

Rental District remains responsible for:

- Notifications.
- Manual application workflow.
- Property dashboard.
- Approve or reject decision.
- Lease generation.
- Digital signature.
- Tenancy creation.
- Tenant profile after approval.

After tenancy creation, Rental District should keep tenant profile fields copied through the approved application package. It should not retain continued access to the tenant's Rental Passport or source documents unless the tenant grants a new permission.

## Rental Passport Responsibilities

Rental Passport remains responsible for:

- Verified application viewer.
- Document permissions.
- Consent records.
- Verification statuses.
- Reviewer audit trail.
- Partner-safe summary metadata.
- Short-lived viewer sessions.

