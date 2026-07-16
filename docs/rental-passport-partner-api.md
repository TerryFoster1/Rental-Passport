# Rental Passport Partner API

Status: API contract documented, endpoint metadata added, production handlers pending

## Authentication

Partner APIs use OAuth client authentication in production. API keys may exist for internal sandbox tooling only.

## Endpoints

### Safe Application Summary

```http
GET /api/v1/partner/applications/:applicationId/summary
```

Required scope:

```text
applications.summary.read
```

Returns metadata safe for a partner application card. It does not return full documents, full credit reports, raw verification evidence, or hidden reviewer notes.

### Viewer Session

```http
POST /api/v1/partner/applications/:applicationId/viewer-sessions
```

Required scope:

```text
applications.viewer.write
```

Creates a short-lived launch token for:

```text
/partner/application/:applicationId?launch_token=:viewerToken
```

### Revoke Viewer Session

```http
POST /api/v1/partner/viewer-sessions/:sessionId/revoke
```

Required scope:

```text
applications.viewer.write
```

Revokes an active session after logout, role change, application withdrawal, or landlord access removal.

## Safe Summary Shape

```json
{
  "application_id": "demo-rp-app-001",
  "rental_passport_account_id": "rp_acct_demo_kathryn_casey",
  "applicant_display_name": "Kathryn",
  "partner_id": "rental_district",
  "partner_property_reference": "rd_listing_123-maple-unit-1204",
  "submitted_at": "2026-07-12T14:15:00.000Z",
  "completeness_status": "Complete with one item needing review",
  "identity_status": "Verified directly",
  "employment_status": "Verified directly",
  "references_status": "Verified directly",
  "rental_history_status": "Verified directly",
  "credit_included": true,
  "unresolved_issue_count": 1,
  "viewer_launch_path": "/partner/application/demo-rp-app-001",
  "current_application_state": "under_review"
}
```

## Versioning

Partner APIs are versioned under `/api/v1`. Breaking changes require a new API version and a migration window.

