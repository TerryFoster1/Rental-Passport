# Internal Reviewer Portal

This document designs the back-office interface for Rental Passport staff. It is documentation only.

## Portal Purpose

The reviewer portal helps staff verify evidence, manage cases, record decisions, and maintain auditability.

## Core Views

- Review Queues
- My Assigned Cases
- Escalated Cases
- Fraud Flags
- More Information Requested
- SLA Watchlist
- QA Review

## Case Management

Each case should show:

- Passport ID
- Passport version
- Tenant profile summary
- Section under review
- Evidence list
- Previous verification history
- Consent record
- Jurisdiction
- SLA due time
- Assigned reviewer
- Status

## Evidence Viewer

Evidence viewer requirements:

- Private document rendering
- No local download by default
- Watermark for reviewer identity and timestamp
- Access logging
- Document version history
- Side-by-side comparison where useful

## Notes

Reviewer notes must support:

- Internal-only notes
- Compliance-only notes
- Tenant-facing requests
- Landlord-facing verification summaries

## Escalation

Escalation reasons:

- Fraud concern
- Jurisdiction uncertainty
- Credit authorization issue
- Identity mismatch
- Duplicate identity
- AI uncertainty
- Reviewer conflict

## Fraud Flags

Fraud flags should show severity, evidence, source, status, and resolution path. They must not be landlord-visible by default.

## Audit History

Reviewer portal must show immutable history of views, notes, decisions, AI suggestions, human overrides, status changes, and escalations.

## Reviewer Metrics

Metrics may include queue volume, SLA adherence, QA pass rate, escalation rate, and review throughput.

Metrics must evaluate process quality, not applicant quality.
