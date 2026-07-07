# Rental Passport

Rental Passport is the trusted digital identity for renting: one secure, verified rental profile renters control and can reuse across rental applications.

## Core Product Statement

Rental Passport verifies information.

Rental Passport protects renter privacy.

Rental Passport ensures legal compliance.

Rental Passport standardizes rental applications.

Rental Passport reduces fraud.

Rental Passport does not make rental decisions.

Rental Passport does not rank people.

Rental Passport gives landlords trusted facts so they can make informed decisions.

## Product Direction

Rental Passport is an API-first verification platform for the rental industry. The React web application is only the first client. Backend services must own business logic, workflows, validation, permissions, verification, compliance decisions, data access, and integration contracts.

The long-term goal is to support "Apply with RentalPassport.io" across listing websites, brokerages, landlords, property management systems, and third-party rental platforms.

## Current Product Language

- Use Passport Completeness, not Applicant Score or Tenant Score.
- Use section verification status for Identity, Employment, Income, Rental History, References, Credit Report, and Documents.
- Use verification confidence only to describe authenticity and evidence quality.
- Use Document Integrity Assessment for AI fraud outputs.
- Use manual-first verification for MVP before paid automation.
- Use secure recipient-specific sharing, not public passport links.
- Present income facts and income multiples, not approval recommendations.
- Keep documents private by default.
- Make filtering jurisdiction-aware.

## Stack

- React, TypeScript, Vite
- TailwindCSS and shadcn/ui conventions
- Supabase, PostgreSQL, Edge Functions, Row Level Security
- Vercel hosting
- Stripe, Resend, Google Maps API, and Supabase Storage integration points

## Current Scope

The repository contains the Phase 1 production foundation through Phase 11 MVP launch readiness foundation: authentication screens, protected application shell, initial account profile model, role-aware routing, shared components, tenant passport dashboard, passport overview, employment section, rental history section, references section, identity section, credit report section, secure sharing page, landlord secure access flow, landlord applications dashboard, landlord passport review pages, internal verification dashboard, verification case queue, verification case workspace, hidden developer portal, versioned API route manifest, integration registry, webhook catalog, SDK plan, AI assistance guardrails, security hardening, monitoring/audit readiness, launch reports, activity foundation, production-readiness assets, architecture documentation, and Supabase migrations for profiles, roles, permissions, consent, audit logging, passports, versions, section statuses, passport activity, employment verification foundations, rental history verification foundations, reference verification foundations, identity verification foundations, credit report verification foundations, recipient-specific sharing, landlord applications, access logging, internal verification cases, checklists, decisions, notes, fraud flags, customer information requests, developer accounts, API clients, API keys, OAuth clients, OAuth tokens, partner integrations, webhook subscriptions, webhook events, API logs, rate limits, and integration settings.

Production OAuth, live public APIs, webhook delivery, SDK publishing, live provider integrations, OCR, automated fraud detection, automatic approval, full messaging, document watermark viewing, escrow, and digital lease workflows are not implemented yet.

## Foundational Docs

- Product Bible: `docs/product/product-bible.md`
- Architecture Overview: `docs/architecture/architecture-overview.md`
- Verification Engine: `docs/architecture/verification-engine.md`
- Trust Framework: `docs/verification/trust-framework.md`
- Verification Operations: `docs/verification/verification-operations.md`
- Manual-First MVP: `docs/architecture/manual-first-mvp.md`
- MVP Implementation Plan: `docs/architecture/mvp-implementation-plan.md`
- Phase 1 Foundation: `docs/architecture/phase-1-foundation.md`
- Phase 2 Passport Framework: `docs/architecture/phase-2-passport-framework.md`
- Phase 3 Employment Module: `docs/architecture/phase-3-employment-module.md`
- Phase 4 Rental History Module: `docs/architecture/phase-4-rental-history-module.md`
- Phase 5 References Module: `docs/architecture/phase-5-references-module.md`
- Phase 6 Identity Verification Module: `docs/architecture/phase-6-identity-verification-module.md`
- Phase 7 Credit Report Module: `docs/architecture/phase-7-credit-report-module.md`
- Phase 8 Secure Sharing and Landlord Experience: `docs/architecture/phase-8-secure-sharing-landlord-experience.md`
- Phase 9 Internal Verification Portal: `docs/architecture/phase-9-internal-verification-portal.md`
- Phase 10 API Platform and Partner Ecosystem: `docs/architecture/phase-10-api-platform-partner-ecosystem.md`
- Phase 10 API Platform Docs: `docs/api/phase-10-api-platform.md`
- Phase 11 AI, Security, and Launch Readiness: `docs/architecture/phase-11-ai-security-launch-readiness.md`
- Launch Checklist: `docs/launch/launch-checklist.md`
- Production Readiness Report: `docs/launch/production-readiness-report.md`
- Known MVP Limitations: `docs/launch/known-limitations.md`
- Internal Reviewer Portal: `docs/architecture/internal-reviewer-portal.md`
- Regional Compliance: `docs/architecture/regional-compliance.md`
- User Flows: `docs/features/user-flows.md`
- API Design: `docs/api/api-design.md`
- Partner Integration Strategy: `docs/api/partner-integration-strategy.md`
- Developer Portal: `docs/api/developer-portal.md`
- Database Design: `docs/database/database-design.md`
- Permissions Model: `docs/security/permissions-model.md`
- Permissions Matrix: `docs/security/permissions-matrix.md`
- Security Architecture: `docs/security/security-architecture.md`
- Compliance Blueprint: `docs/security/compliance-blueprint.md`
- Privacy Model: `docs/security/privacy-model.md`
- Secure Sharing Model: `docs/security/secure-sharing-model.md`
- Fraud Detection: `docs/security/fraud-detection.md`
- Security Checklist: `docs/security/security-checklist.md`
