# API Design

Rental Passport is API-first. The API is the product platform; the web client is one consumer.

## Design Goals

- Expose secure, versioned contracts for first-party and future third-party clients.
- Keep business logic, workflow rules, validation, permissions, verification, compliance decisions, and data access behind backend APIs.
- Make future integrations possible for listing websites, brokerages, landlords, property management systems, screening providers, OpenRoom, and enterprise customers.
- Support the long-term "Apply with RentalPassport.io" integration model.
- Avoid any API that ranks people, recommends approval, or exposes raw documents by default.

## Future API Families

No API routes are implemented yet. Future API families may include:

- Passport profile APIs
- Passport Completeness APIs
- Section verification status APIs
- Verification evidence APIs
- Consent and sharing APIs
- Secure invitation APIs
- Landlord Applications dashboard APIs
- Landlord review APIs
- Legal sorting and filtering APIs
- Regional compliance APIs
- Regional application generation APIs
- Digital lease library APIs
- Deposit escrow APIs, legal review required
- Document upload APIs
- Document Integrity Assessment APIs
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
- Return verification facts and evidence summaries, not approval recommendations.

## Sorting and Filtering Rules

Default applicant sorting must be:

1. Passport Completeness
2. Fully Verified Passports
3. Date Applied

Allowed optional sorting includes newest, oldest, recently updated, verification status, and application date.

Filtering is allowed only when legal for the jurisdiction. Filtering APIs must accept jurisdiction context and suppress illegal criteria automatically.

## Income Presentation

Income APIs should present:

- Verified Monthly Income
- Verified Annual Income
- Income Verification Method
- Income Multiple relative to advertised rent

The API must not return approval recommendations.

## Client Rule

The React frontend must call backend APIs rather than owning business workflows directly. Any action that would also be needed by a future mobile app, SDK, browser extension, or third-party platform belongs behind an API boundary.

## Developer Portal

Future partner documentation belongs in a hidden developer/API portal. See `docs/api/developer-portal.md`.

## Current Scope

No API endpoints, handlers, schemas, or SDKs are implemented yet.
