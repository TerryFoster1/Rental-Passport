# Rental Passport Application Viewer Spec

Status: demo implemented, production backend pending

## Purpose

The application viewer is a Rental Passport-branded, read-only landlord review surface that partners can open from their own application workflow.

It allows a landlord to review a verified tenant application without Rental District copying the full Rental Passport record into its own product.

## Route

```text
/partner/application/:applicationId?launch_token=:viewerToken
```

Current demo:

```text
/partner/application/demo-rp-app-001?launch_token=demo-valid-rental-district
```

## Required States

The viewer must handle:

- Missing token.
- Invalid token.
- Expired token.
- Revoked token.
- Wrong partner.
- Wrong scope.
- Wrong application.
- Demo token disabled in production.
- Valid session.

## Current Demo Data

The demo application uses fake test data for Kathryn Casey. It includes:

- Applicant and property metadata.
- Verified identity, employment, income, references, rental history, and credit summary statuses.
- One optional document issue requiring review.
- Declarations and consent timestamps.
- Audit history.
- Permitted document metadata.

No real production data is included.

## Viewer Actions

The demo viewer supports safe action placeholders:

- Mark reviewed.
- Request missing information.
- Request re-verification.
- Request updated document.
- Return to partner.

These actions currently emit local UI state and partner `postMessage` events where the referrer origin is allowlisted. Production actions must be persisted through backend APIs and audit logs.

## Non-Goals

The viewer must not approve applicants, reject applicants, create tenancies, generate leases, or trigger lease signatures. Those are partner/property-management workflows.

