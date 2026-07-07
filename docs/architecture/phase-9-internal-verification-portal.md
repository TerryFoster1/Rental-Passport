# Phase 9 - Internal Verification Portal

Phase 9 introduces the internal operations portal used by authorized Rental Passport staff to review verification cases. This portal is never visible to tenants or landlords.

## Implemented Scope

- `/admin` internal verification dashboard
- `/admin/verifications` searchable case queue
- `/admin/verifications/:id` primary verification case workspace
- Internal role gate for verification reviewers, senior reviewers, compliance, support, and administrators
- Applicant summary, passport status, section review, uploaded evidence placeholder, checklist, internal notes, timeline, activity, and decision panel
- Reviewer assignment and priority controls
- Internal-only notes
- Fraud flag placeholders
- Customer information request placeholder workflow
- Structured checklist storage
- Verification decisions for approve, reject, needs more information, escalate, and fraud review
- Passport section status updates from reviewer decisions
- Passport activity and audit log writes from service operations

## Data Model

Phase 9 adds:

- `verification_cases`
- `verification_assignments`
- `verification_notes`
- `verification_checklists`
- `verification_decisions`
- `fraud_flags`
- `customer_information_requests`
- `reviewer_activity`
- `reviewer_roles`
- `case_history`

## Security Rules

- `/admin` routes are protected in the application shell.
- UI access is restricted to internal roles.
- RLS limits verification tables to internal verification users.
- Internal notes and fraud flags are internal only.
- Sensitive evidence uses a secure viewer placeholder and is prepared for future document access logging.
- Reviewer actions are logged in reviewer activity and audit logs.

## AI Preparation

The portal uses structured case, checklist, evidence, decision, note, and fraud-flag records so future AI can summarize cases, highlight inconsistencies, compare documents, flag anomalies, and suggest checklist items. Human reviewers remain the final decision-makers.

## Out of Scope

- AI reviewer
- OCR
- Automatic fraud detection
- Automatic approval
- Third-party provider integrations
- Performance dashboards
- Productivity scoring
- Team management
- Enterprise admin tools
