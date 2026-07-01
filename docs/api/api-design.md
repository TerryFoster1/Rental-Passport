# API Design

Rental Passport is API-first. The API is the product platform; the web client is one consumer.

## Design Goals

- Expose secure, versioned contracts for first-party and future third-party clients.
- Keep business logic, workflow rules, validation, permissions, verification, and data access behind backend APIs.
- Make future integrations possible for listing websites, brokerages, landlords, property management systems, screening providers, and enterprise customers.
- Support the long-term "Apply with RentalPassport.io" integration model.

## Future API Families

No API routes are implemented yet. Future API families may include:

- Passport profile APIs
- Consent and sharing APIs
- Verification APIs
- Landlord review APIs
- Document upload APIs
- OAuth 2.0 / OpenID Connect APIs
- Webhook delivery APIs
- Integration management APIs
- Audit and activity APIs

## Contract Principles

- Version public APIs from the beginning.
- Separate public APIs from internal service APIs.
- Use explicit permission and consent checks for all renter data access.
- Return standardized errors.
- Design idempotency for mutating workflows that may be retried.
- Treat auditability as part of the API contract.
- Avoid leaking storage paths, internal IDs, or provider-specific implementation details.

## Client Rule

The React frontend must call backend APIs rather than owning business workflows directly. Any action that would also be needed by a future mobile app, SDK, browser extension, or third-party platform belongs behind an API boundary.

## Current Scope

No API endpoints, handlers, schemas, or SDKs are implemented yet.