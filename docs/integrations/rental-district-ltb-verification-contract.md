# Rental District LTB Verification Contract

Date: 2026-08-03  
Status: versioned domain contract; production endpoint pending.

## Boundary

Rental Passport owns applicant consent, official-source search, matching, normalization, manual review, applicant disclosure/dispute, audit history, and structured partner-safe results.

Rental District must not independently scrape or interpret LTB records when Rental Passport can provide the normalized verification result.

## Request

`POST /verification-checks`

```json
{
  "type": "ontario_ltb_order_search",
  "applicant_ref": "rp_user_123",
  "passport_ref": "rp_passport_123",
  "application_ref": "rd_application_456",
  "organization_ref": "rd_org_789",
  "consent_ref": "consent_ltb_123"
}
```

Required authentication:

- signed service-to-service authentication.
- organization/application scoping.
- idempotency key.
- request ID.
- least-privilege scope such as `verification-checks.write`.

## Partner-Safe Statuses

Rental District may receive:

- `pending`
- `no_match_found`
- `possible_match_reviewing`
- `verified_record_found`
- `applicant_disputed`
- `unavailable`
- `expired`

## Response

```json
{
  "type": "ontario_ltb_order_search",
  "status": "possible_match_reviewing",
  "checked_at": "2026-08-03T12:00:00Z",
  "coverage_statement": "No matching record found means only that no matching record was found in the available official Ontario LTB final-order sources searched as of 2026-08-03.",
  "verified_result_summary": "Possible official LTB order match found. Applicant role and context require review.",
  "official_source_references": [
    {
      "source": "Ontario Data Catalogue",
      "url": "https://data.ontario.ca/dataset/ltb-order-catalogue",
      "file_number": "LTB-L-000001-26",
      "document_id": "DOC-123",
      "order_date": "2026-03-12"
    }
  ],
  "applicant_role_in_proceeding": "tenant",
  "review_dispute_status": "under_manual_review",
  "expiration_recheck_date": "2026-11-03",
  "reason_codes_safe_for_landlord_display": [
    "exact_name_without_corrob",
    "manual_review_required"
  ],
  "disclaimer": "Rental Passport reports available official records and possible identity matches. It does not provide legal advice or an automatic tenancy recommendation."
}
```

## Do Not Return

- universal risk score.
- automatic approve/reject instruction.
- unrelated records.
- raw identity data not required by Rental District.
- private reviewer notes.
- internal fraud heuristics.
- applicant notes not intended for disclosure.

## Event Names

Future events may include:

- `verification_check.ontario_ltb_order_search.queued`
- `verification_check.ontario_ltb_order_search.source_unavailable`
- `verification_check.ontario_ltb_order_search.no_match_found`
- `verification_check.ontario_ltb_order_search.possible_match_reviewing`
- `verification_check.ontario_ltb_order_search.match_confirmed`
- `verification_check.ontario_ltb_order_search.applicant_disputed`
- `verification_check.ontario_ltb_order_search.corrected`
- `verification_check.ontario_ltb_order_search.expired`

## Audit

Every request and result disclosure must write an audit event with:

- partner ID.
- organization ID.
- application ID.
- passport ID.
- consent ID.
- requester/service identity.
- source coverage date.
- result status.
- redacted metadata.

