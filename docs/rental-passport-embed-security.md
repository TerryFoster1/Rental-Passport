# Rental Passport Embed Security

Status: required before partner production embed

## Default Posture

Rental Passport application records are private by default. Partner embedding is allowed only for approved origins and only through short-lived viewer sessions.

## Frame Policy

Production should send a restrictive `Content-Security-Policy` using `frame-ancestors`.

Example partner allowlist:

```text
frame-ancestors 'self' https://rentaldistrict.ca https://www.rentaldistrict.ca;
```

Do not use wildcard frame ancestors.

## Session Requirements

Viewer sessions must be:

- Short-lived.
- Partner-scoped.
- Application-scoped.
- User-scoped.
- Permission-scoped.
- Revocable.
- Audited.

Tokens must be issued by a backend service. They must never contain browser-visible signing secrets.

## Document Protection

Documents must be rendered through short-lived view sessions. Partner platforms should receive document labels, statuses, and allowed access type only until a landlord opens a permitted view.

Sensitive files should support:

- Expiring URLs.
- Watermarking.
- Download restrictions where required.
- View audit logs.
- Tenant consent checks.

## Messaging

When embedded, Rental Passport may send `postMessage` events only to a known parent origin. The parent must validate:

- `source === "rentalpassport.io"`.
- Expected event name.
- Expected application id.
- Expected version.

The viewer currently allowlists Rental District production and localhost demo origins.

