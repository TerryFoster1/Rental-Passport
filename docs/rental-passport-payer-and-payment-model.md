# Rental Passport Payer And Payment Model

Status: demo states implemented, live Stripe disabled.

## Payer Modes

- Applicant pays.
- Landlord or partner pays.
- Included verification credit.

## Demo Payment States

- `awaiting_payment`
- `payment_completed`
- `payment_failed`
- `payment_waived`
- `verification_credit_redeemed`

Applicant-paid requests show a demo price. Landlord-paid requests show "Paid by organization." Included-credit requests show "Covered by your landlord's plan."

## Production Requirements

Use server-created checkout sessions, webhook-confirmed payment state, idempotency keys, and server-side authorization. Applicants must not be able to manipulate payment state.

