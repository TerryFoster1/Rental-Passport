# Verification Evidence Framework

Date: 2026-07-23  
Status: operational specification, not a provider implementation.

## Purpose

This framework defines what Rental Passport reviewers can accept as evidence, how confidence should be described, and what the system may show to landlords.

## Evidence Principles

- Evidence belongs to the renter.
- Reviewers verify facts, not applicant worthiness.
- Every verification outcome needs an evidence source, method, date, reviewer/provider, expiry, and audit trail.
- Sensitive documents should not be exposed to landlords by default.
- Landlords receive verified summaries unless the renter grants document-specific access.

## Evidence Types

| Evidence Type | Examples | Default Sensitivity | MVP Handling |
|---|---|---:|---|
| Account evidence | Email confirmation, OAuth provider account | Low | Automated where Supabase supports it |
| Identity evidence | Government ID, selfie | High | Manual review until provider integration |
| Employment evidence | Pay stub, employer letter, employer confirmation | High | Manual review and manual/direct outreach |
| Income evidence | Pay stubs, tax documents, benefit statements, bank deposits | High | Manual review; redact unrelated transactions where possible |
| Rental history evidence | Lease, rent ledger, landlord confirmation | Medium/High | Manual review and manual/direct outreach |
| Reference evidence | Structured response, call note, email confirmation | Medium | Manual review |
| Credit evidence | Credit report PDF, bureau/provider metadata | High | Manual report upload/review until provider integration |
| Fraud signals | Inconsistency notes, document concerns, duplicate indicators | Restricted | Internal-only unless converted into tenant-facing request |

## Verification Methods

| Method | Meaning | Allowed Claim |
|---|---|---|
| User provided | Renter entered the information. | Self reported |
| Document reviewed | A reviewer reviewed uploaded evidence. | Verified by document |
| Direct contact | A reviewer or secure workflow confirmed with a third party. | Verified directly |
| Provider sourced | A trusted provider returned structured verification data. | Verified through provider |
| Manual exception | Reviewer accepted alternate evidence after escalation. | Manually verified, method retained internally |

## Confidence Levels

Confidence describes evidence quality only.

- High: direct/provider evidence or multiple consistent documents.
- Medium: plausible documents with limitations or incomplete direct confirmation.
- Low: weak, stale, inconsistent, or unclear evidence.
- Needs review: unresolved issue prevents a final state.

Confidence must never be described as a tenant recommendation.

## Landlord Display Rules

Landlords may see:

- Verification status.
- Verification method summary.
- Verification date and expiry.
- Evidence category summary.
- Unresolved requested information.
- Tenant-authorized documents only.

Landlords must not see by default:

- Full identity documents.
- Full credit report.
- Bank transactions unrelated to rent/income verification.
- Internal fraud notes.
- Reviewer private notes.
- Other landlord identities where not authorized.

## Internal Operations Requirements

- Reviewer queue assignment.
- Dual-review escalation for identity, credit, fraud, and adverse inconsistencies.
- Reviewer notes separated into internal, tenant-facing, and landlord-facing fields.
- Evidence redaction workflow before landlord document access.
- Audit log for every view, status change, download, and share action.
- Case reopening after material data changes.

## AI Assistance Boundaries

AI may assist with:

- Extracting fields from uploaded documents for reviewer confirmation.
- Detecting missing pages, blurred uploads, or mismatched dates.
- Drafting tenant-facing requests for more information.
- Summarizing reviewer-approved evidence.

AI must not:

- Make final verification decisions.
- Rank or recommend tenants.
- Decide fraud.
- Produce adverse-action style conclusions.
- Expose hidden reasoning to landlords or tenants.

