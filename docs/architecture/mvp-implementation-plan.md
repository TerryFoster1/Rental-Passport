# MVP Implementation Plan

This plan defines recommended build order after documentation approval.

## Phase 1: Authentication And Roles

Build tenant accounts, landlord secure access, reviewer/admin roles, session handling, password reset, and base RLS.

Dependencies: security architecture, permissions matrix.

## Phase 2: Passport Core

Build tenant profile, passport, passport versions, sections, Passport Completeness, and activity history.

Dependencies: database blueprint, trust framework.

## Phase 3: Secure Documents

Build private storage, upload intents, document metadata, document versions, signed viewing infrastructure, and download restrictions.

Dependencies: security architecture, storage strategy.

## Phase 4: Manual Verification

Build verification cases, reviewer queues, reviewer decisions, evidence records, confidence levels, expiry, reverification, and requests for more information.

Dependencies: verification operations manual, internal reviewer portal design.

## Phase 5: Secure Sharing

Build recipient-specific invitations, share tokens, landlord secure access, revocation, access logs, and tenant visibility into views.

Dependencies: secure sharing model, permissions matrix.

## Phase 6: Landlord Applications Dashboard

Build Applications dashboard, minimal passport cover page, drill-down sections, application package downloads, and legal sorting/filtering.

Dependencies: UX docs, regional compliance.

## Phase 7: Compliance And Regional Rules

Build jurisdiction model, compliance rules, legal filter suppression, application templates, and lease template planning.

Dependencies: compliance blueprint, regional compliance doc.

## Phase 8: Reviewer Portal

Build queues, assignment, case details, evidence viewer, notes, escalation, fraud flags, QA, and reviewer audit history.

Dependencies: manual verification.

## Phase 9: Public And Internal APIs

Stabilize v1 API contracts for first-party clients, internal reviewer APIs, admin APIs, and future partner contracts.

Dependencies: previous phases.

## Phase 10: Partner Integrations

Add developer portal, OAuth partner flow, webhooks, SDK foundations, Rental District handoff, and selected provider integrations.

Dependencies: API stability, compliance review.

## Phase 11: Future Automation

Add AI assistance, OCR, provider-based identity verification, direct credit APIs, open banking, and Verified Deposit only after legal and security review.

Dependencies: manual workflows, audit model, compliance approval.
