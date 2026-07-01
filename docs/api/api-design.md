# API Blueprint

Rental Passport is API-first. The API is the product platform; the web client is one consumer.

## API Principles

- Version public APIs from the beginning.
- Separate public, internal, reviewer, admin, and partner APIs.
- Keep business logic, permissions, verification, and compliance behind APIs.
- Return facts and evidence summaries, not approval recommendations.
- Never expose raw documents by default.
- Enforce jurisdiction-aware filters and questions.

## Versioning

Initial version namespace: `/v1`.

Future breaking changes require a new version namespace. Internal APIs may version independently but must not leak unstable contracts to partners.

## Authentication APIs

- `POST /v1/auth/sign-up`
- `POST /v1/auth/sign-in`
- `POST /v1/auth/magic-link`
- `POST /v1/auth/password-reset`
- `POST /v1/auth/logout`
- `GET /v1/auth/session`
- `POST /v1/auth/landlord/secure-access`

## Passport APIs

- `GET /v1/passports/current`
- `POST /v1/passports`
- `GET /v1/passports/{passportId}`
- `GET /v1/passports/{passportId}/versions`
- `GET /v1/passports/{passportId}/versions/{versionId}`
- `GET /v1/passports/{passportId}/completeness`
- `GET /v1/passports/{passportId}/sections`
- `PATCH /v1/passports/{passportId}/sections/{sectionType}`
- `GET /v1/passports/{passportId}/activity`

## Verification APIs

- `POST /v1/verifications/{sectionType}/request`
- `GET /v1/verifications/{verificationId}`
- `GET /v1/passports/{passportId}/verification-summary`
- `GET /v1/passports/{passportId}/verification-certificate`
- `POST /v1/verifications/{verificationId}/request-more-information`
- `POST /v1/verifications/{verificationId}/reverify`

## Document APIs

- `POST /v1/documents/upload-intent`
- `POST /v1/documents/{documentId}/complete-upload`
- `GET /v1/documents/{documentId}/metadata`
- `POST /v1/documents/{documentId}/viewer-grants`
- `POST /v1/documents/{documentId}/revoke-viewer-grant`
- `GET /v1/document-viewer/{grantId}`

## Sharing APIs

- `POST /v1/passports/{passportId}/shares`
- `GET /v1/passports/{passportId}/shares`
- `POST /v1/shares/{shareId}/revoke`
- `GET /v1/shares/{shareToken}/accept`
- `GET /v1/shares/{shareId}/access-logs`

## Application APIs

- `POST /v1/applications`
- `GET /v1/applications/{applicationId}`
- `PATCH /v1/applications/{applicationId}/withdraw`
- `PATCH /v1/applications/{applicationId}/accept`
- `PATCH /v1/applications/{applicationId}/archive`
- `GET /v1/applications/{applicationId}/package`

## Landlord Dashboard APIs

- `GET /v1/landlord/applications`
- `GET /v1/landlord/applications/{applicationId}/passport-summary`
- `GET /v1/landlord/applications/{applicationId}/verification-details`
- `POST /v1/landlord/applications/{applicationId}/save`
- `POST /v1/landlord/applications/{applicationId}/message`

## Notifications APIs

- `POST /v1/notifications/email`
- `GET /v1/notifications/preferences`
- `PATCH /v1/notifications/preferences`

## Internal Reviewer APIs

- `GET /internal/v1/reviewer/queues`
- `GET /internal/v1/reviewer/cases`
- `POST /internal/v1/reviewer/cases/{caseId}/assign`
- `GET /internal/v1/reviewer/cases/{caseId}`
- `POST /internal/v1/reviewer/cases/{caseId}/notes`
- `POST /internal/v1/reviewer/cases/{caseId}/decision`
- `POST /internal/v1/reviewer/cases/{caseId}/escalate`
- `POST /internal/v1/reviewer/cases/{caseId}/request-more-information`

## Administration APIs

- `GET /admin/v1/users`
- `GET /admin/v1/audit-logs`
- `GET /admin/v1/compliance-rules`
- `PATCH /admin/v1/compliance-rules/{ruleId}`
- `GET /admin/v1/integrations`
- `PATCH /admin/v1/integrations/{clientId}`

## Partner APIs

- `GET /partner/v1/passports/{passportId}/verification-status`
- `GET /partner/v1/applications/{applicationId}`
- `POST /partner/v1/applications/{applicationId}/accepted`
- `POST /partner/v1/applications/{applicationId}/withdrawn`
- `POST /partner/v1/lease-handoff`

## OAuth

Future OAuth scopes:

- `passport.read`
- `passport.verification.read`
- `application.read`
- `application.write`
- `webhook.manage`
- `lease.handoff`

## Webhooks

Future events:

- `passport.shared`
- `passport.viewed`
- `verification.completed`
- `verification.expired`
- `application.accepted`
- `application.withdrawn`
- `lease.executed`

Webhooks require signing, replay protection, retries, and delivery logs.

## SDKs

Initial SDK target: JavaScript. Future SDKs may include mobile and server-side languages.

## Error Handling

Use structured errors:

- `code`
- `message`
- `details`
- `request_id`
- `documentation_url`

Common codes: unauthorized, forbidden, expired_share, revoked_share, jurisdiction_not_supported, verification_required, validation_failed, rate_limited.

## Rate Limits

Rate limits should vary by actor:

- Guest and magic link flows: strict
- Tenant app: moderate
- Landlord dashboard: moderate
- Internal reviewer APIs: protected by role and session policy
- Partner APIs: contract-based

## Current Scope

No API endpoints, handlers, schemas, or SDKs are implemented yet.
