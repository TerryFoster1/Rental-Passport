# Rental Passport Partner Event Contract

Status: documented and demo event model implemented.

Partner status events must be safe summaries only.

## Events

- `verification_request.received`
- `applicant.invited`
- `applicant.viewed`
- `applicant.accepted`
- `applicant.declined`
- `payment.pending`
- `payment.completed`
- `verification.started`
- `additional_information.requested`
- `verification.completed`
- `verification.needs_review`
- `request.expired`
- `request.cancelled`

## Envelope

```json
{
  "eventId": "evt_rp_ver_req_rd_001_1",
  "version": "2026-07-16",
  "partnerId": "rental_district",
  "partnerApplicationId": "rd_app_2026_0712_001",
  "rentalPassportRequestId": "rp_ver_req_rd_001",
  "rentalPassportApplicationId": "demo-rp-app-001",
  "status": "needs_review",
  "timestamp": "2026-07-16T00:00:00.000Z",
  "safeSummary": {}
}
```

## Production Requirements

Add webhook signatures, replay protection, idempotency keys, retries, dead-letter handling, partner scoping, and audit logs.

