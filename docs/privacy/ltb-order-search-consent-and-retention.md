# LTB Order Search Consent and Retention

Date: 2026-08-03  
Status: privacy model for manual MVP; counsel review required before production launch.

## Consent Requirement

Rental Passport must record explicit, application-scoped consent before starting an official Ontario LTB order search.

Consent must explain:

- what official sources will be searched.
- that records may be publicly available.
- why Rental Passport is searching.
- what information may be returned to the landlord.
- limits of name matching.
- limits of historical coverage.
- retention period.
- applicant access and correction rights.
- that a record does not automatically determine application outcome.
- that consent can be declined, subject to the landlord's disclosed screening requirements and applicable law.

## Consent Record

Record:

- consent version.
- timestamp.
- application ID.
- passport ID.
- applicant identity.
- purpose: `official_ontario_ltb_order_search`.
- requesting organization.
- source coverage at search time.
- expiry/recheck date.

Do not reuse consent indefinitely or across unrelated applications.

## Retention

Until counsel approves final retention rules:

- Store source metadata, normalized result, match reasons, reviewer decision, applicant disclosure/dispute state, and audit events.
- Avoid storing full downloaded PDFs unless required for evidence preservation and legally approved.
- If storing a PDF is approved, store in private evidence storage with least-privilege reviewer access and a lawful retention period.
- Prefer storing source URL and document hash/integrity reference where lawful.
- Expire verification results after a configurable reverification period.
- Never silently overwrite historical verification evidence.

## Applicant Review and Correction

Before releasing a potentially adverse confirmed result to a landlord where feasible, the applicant must be able to:

- see the matched source reference.
- state that it is not them.
- explain context.
- upload supporting information.
- identify an amendment, review, appeal, stay, set-aside, or correction.
- request manual review.
- receive the outcome of the review.

Private applicant notes must not be returned to Rental District unless the applicant explicitly intends disclosure.

## Security Controls

Required controls:

- purpose limitation.
- organization/application scoping.
- least-privilege reviewer permissions.
- audit logs for search, review, disclosure, correction, and partner access.
- no search-engine indexing.
- no public search UI.
- rate limiting for any future API.
- no bulk browsing of named individuals.
- no protected-ground inference.
- no automatic adverse action.

## Legal Questions for Canadian Counsel

- Required consent wording under PIPEDA and Ontario privacy/fair housing obligations.
- Whether the Open Government Licence - Ontario permits local indexing for this use case.
- Attribution requirements for landlord-facing summaries.
- Retention/deletion period for source metadata and downloaded PDFs.
- Applicant correction/dispute timing before disclosure.
- Whether landlords may require this search in each target jurisdiction and under what disclosed criteria.

