# Rental Passport Demo Application

Status: fake data only

## Purpose

The demo application lets an investor or partner see how a verified Rental Passport application opens from Rental District without modifying Rental District during this phase.

## Demo URL

```text
/partner/application/demo-rp-app-001?launch_token=demo-valid-rental-district
```

## Test Tokens

- `demo-valid-rental-district`: valid demo token.
- `demo-expired-rental-district`: expired token state.
- `demo-revoked-rental-district`: revoked token state.
- `demo-wrong-partner`: partner mismatch state.
- `demo-wrong-scope`: missing viewer scope state.
- `demo-wrong-application`: application mismatch state.

## Demo Applicant

- Name: Kathryn Casey.
- Property: 123 Maple St, Unit 1204, Toronto, ON.
- Partner: Rental District.
- Status: Complete with one optional document issue.

## Production Notes

This demo does not create real backend sessions, bill users, run webhooks, or expose production data. Production must move token issuance, validation, actions, document viewing, and audit writes behind backend services.

