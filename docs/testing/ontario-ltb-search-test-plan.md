# Ontario LTB Search Test Plan

Date: 2026-08-03  
Status: unit tests added for domain model; live provider tests not run.

## Automated Unit Coverage

Current test file:

`scripts/tests/ltb-order-search.test.mjs`

Covered cases:

- consent required before search.
- name-only match cannot auto-confirm.
- tenant versus landlord role is distinguished.
- no-match coverage disclaimer includes limitations.
- ambiguous matches require review.
- mismatched address rejects false match.
- applicant dispute pauses partner release.
- expired result maps to recheck status.
- source unavailable fails transparently.
- private reviewer notes are not returned to Rental District.
- no risk score or recommendation is returned.

## Required Future Integration Tests

- organization/application authorization.
- audit event created for every search and review.
- cross-organization access denied.
- official CSV download failure handled as `source_unavailable`.
- malformed CSV row quarantined for manual review.
- PDF link extraction preserves official source URL.
- amended/replaced order updates status without deleting history.
- applicant correction changes partner-safe payload.
- private applicant notes remain private.
- Rental District receives only scoped results.

## Required Manual Review Tests

- reviewer can classify applicant role.
- reviewer can record exact match reasons.
- reviewer can reject a landlord-role match as not an applicant tenant match.
- reviewer can mark source coverage incomplete.
- reviewer can record appeal/review/stay indicators from the PDF.
- applicant can dispute before release where feasible.

