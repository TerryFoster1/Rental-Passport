# Rental Passport Partner Events

Status: browser demo events implemented, durable webhooks pending

## Browser Events

When embedded, the viewer can emit:

- `viewer.closed`
- `application.updated`
- `auth.expired`

Payload envelope:

```json
{
  "source": "rentalpassport.io",
  "event": "application.updated",
  "version": "2026-07-16",
  "payload": {
    "applicationId": "demo-rp-app-001",
    "action": "request_missing_information"
  }
}
```

Rental District must validate the origin, source, version, and application id before updating UI.

## Future Webhooks

Production partner webhooks should cover:

- `application.submitted`
- `application.summary.updated`
- `viewer.session.revoked`
- `verification.status.changed`
- `information.requested`
- `document.updated`
- `application.withdrawn`

Webhook delivery must include signing, retries, idempotency keys, and replay protection.

