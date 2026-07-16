# Rental Passport Post-Application Request Flow

Status: demo vertical slice implemented, production backend pending.

## Purpose

Rental District may receive a traditional rental application first, then ask RentalPassport.io to verify that application. Rental Passport owns the invitation, consent, import confirmation, payment state, verification workflow, and final authoritative viewer.

## Demo Route

```text
/verification-request/demo-rd-applicant-pays
```

Alternate demo tokens:

- `demo-rd-landlord-pays`
- `demo-rd-included-credit`
- `demo-rd-declined`
- `demo-rd-expired`
- `demo-rd-wrong-applicant`

## Flow

1. Partner creates verification request.
2. Rental Passport issues an applicant invitation.
3. Applicant reviews request and accepts or declines.
4. Applicant links or creates a Rental Passport account.
5. Applicant reviews imported application data.
6. Applicant confirms import and resolves conflicts.
7. Applicant grants granular verification and sharing consent.
8. Demo payment is completed, waived, or redeemed.
9. Demo verification advances through safe states.
10. Partner receives safe status events.
11. Completed application opens in the hosted viewer.

## Production Blockers

Backend token issuance, persistent data tables, RLS, live email, live payment, provider integrations, signed webhooks, and durable audit logging remain pending.

