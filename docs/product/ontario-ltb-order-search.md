# Ontario LTB Order Search

Date: 2026-08-03  
Status: capability model and manual MVP contract added; automated ingestion deferred.

## Product Purpose

Official Ontario LTB order search is an evidence source inside the Rental Passport verification process. It reports available official records and possible identity matches. It does not approve, reject, score, blacklist, or characterize an applicant.

Required disclaimer:

> Rental Passport reports available official records and possible identity matches. It does not provide legal advice or an automatic tenancy recommendation.

## Capability Key

`ontario_ltb_order_search`

## Capability States

- `not_requested`
- `consent_required`
- `queued`
- `searching`
- `possible_match`
- `no_match_found`
- `manual_review_required`
- `match_confirmed`
- `match_rejected`
- `applicant_disputed`
- `corrected`
- `source_unavailable`
- `expired`

Do not use `passed` or `failed`.

## No-Match Meaning

`no_match_found` means:

> No matching record was found in the sources and coverage searched at that time.

It must not mean:

- the applicant has never had an LTB matter.
- the historical dataset is complete.
- the applicant is risk-free.
- Rental Passport recommends approval.

## Matching Model

Matching must be conservative and explainable.

Allowed inputs when lawfully collected with consent:

- full legal name.
- previous legal names.
- rental address.
- prior address.
- declared tenancy date range.
- applicant-supplied case number.
- role in proceeding.
- other lawful corroborating fields approved later.

Match states:

- `strong_confirmed_match`
- `probable_match_requiring_manual_review`
- `ambiguous_possible_match`
- `rejected_mismatch`

Reason codes include:

- exact full name plus matching rental address.
- exact name but no corroborating identifier.
- similar name with matching address.
- exact name with conflicting address.
- record names applicant as landlord or agent.
- record names applicant as tenant or occupant.
- record names applicant as co-op member.
- order outside declared tenancy period.
- case number supplied by applicant.

A name-only match cannot be confirmed.

## Normalized Order Model

The normalized model must support:

- official source.
- source record URL.
- source dataset version/date.
- retrieval timestamp.
- case/file number.
- order date.
- publication date where available.
- applicant role.
- landlord/tenant/other party role.
- application type.
- order/disposition type.
- short factual summary.
- monetary amount when explicitly ordered.
- possession/termination outcome when explicitly ordered.
- dismissal/withdrawal status.
- confidentiality/redaction state.
- amendment/review/stay/appeal indicators.
- superseded/replaced status.
- document hash or integrity reference where lawful.
- match status.
- match reasons.
- reviewer.
- review timestamp.
- applicant dispute/correction state.

Neutral wording is required. Use `Possible official LTB order match found.` Do not use loaded labels.

## Manual MVP Workflow

1. Rental District requests an Ontario LTB order search for an application.
2. Rental Passport checks that application-scoped consent exists.
3. Reviewer searches the official Ontario Data Catalogue resource.
4. Reviewer reviews candidate CSV fields and linked PDF orders.
5. Reviewer records source, role, order context, match reasons, and limitations.
6. Applicant sees a potentially adverse confirmed result where feasible.
7. Applicant may dispute, explain, upload supporting information, or identify an amendment/review/appeal/stay.
8. Reviewer resolves or corrects the normalized result.
9. Rental Passport returns a partner-safe result to Rental District.

## Prohibited Product Behavior

Do not create:

- a bad tenant flag.
- an automatic rejection.
- an eviction-history score.
- a hidden blacklist.
- a general character judgment.
- a negative result based only on a name match.
- an adverse recommendation based merely on an order existing.
- a public search UI.
- bulk browsing of named individuals.

