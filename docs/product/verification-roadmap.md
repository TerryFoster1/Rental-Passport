# Verification Roadmap

Date: 2026-07-23  
Status: relaunch implementation sequence.

## Objective

Move Rental Passport from a strong demo/prototype into a production-capable manual verification MVP, then into provider-assisted verification.

## Phase A: Trustworthy Manual MVP

Goal: ship a limited production workflow that is honest, auditable, and privacy-safe.

Required:

- Guided onboarding with clear completeness vs verification states.
- Production Supabase project connected and tested.
- RLS tests for profiles, passport data, evidence, sharing, and reviewer roles.
- Secure Storage buckets with signed access, upload limits, and access logs.
- Reviewer queues for identity, employment, income, rental history, references, and credit.
- Tenant-facing information request workflow.
- Manual credit report upload/review workflow.
- Verification certificate generated from recorded evidence, not demo state.
- Rental District receives only partner-safe application metadata and hosted passport links.

Do not launch broad public marketing until Phase A passes live security testing.

## Phase B: Integration-Ready Partner Workflow

Goal: support Rental District and future partners through real contracts rather than demo routes.

Required:

- Versioned internal/public API implementation.
- Signed partner launch tokens.
- Webhook delivery and retry logs.
- Partner application status sync.
- Passport share revocation and expiry enforcement.
- Lease/tenancy handoff metadata contract with Rental District.
- Production monitoring and incident response playbook.

## Phase C: Provider Verification

Goal: replace manual review where legally and technically appropriate.

Candidate integrations:

- Identity verification provider.
- Credit report provider/bureau connection.
- Email/SMS delivery provider hardening.
- Employment/income verification provider.
- Document extraction and tamper-detection assistance.

Claims unlocked only after implementation:

- Provider-sourced identity verification.
- Provider-sourced credit report.
- Automated status updates from trusted providers.
- Faster verification timelines where provider SLAs support them.

## Phase D: Enterprise Platform

Goal: make Rental Passport a reusable rental identity layer.

Required:

- OAuth/OIDC flows for third-party platforms.
- Developer dashboard.
- API key rotation and tenant scoping.
- SDKs.
- Enterprise audit exports.
- Formal security review and privacy impact assessment.

## Manual Labour Estimate

Early MVP verification is labour-intensive.

| Area | Expected Manual Work | Bottleneck |
|---|---|---|
| Identity | 5-10 minutes per clean case | Unclear photos, expired IDs, mismatched names |
| Employment/income | 10-30 minutes per case | Employer response time and inconsistent documents |
| Rental history | 10-45 minutes per tenancy | Landlord contact response time |
| References | 5-20 minutes per reference | Unresponsive references |
| Credit | 5-15 minutes per report | Cropped reports, missing pages, unsupported sources |
| Escalations | 15-60+ minutes | Compliance-sensitive inconsistencies |

The first production milestone should prioritize reviewer tooling and communication templates because manual operations will define user experience.

## Current Readiness

Rental Passport is ready to begin Phase A implementation. It is not ready for public production verification, automated provider claims, or open partner API access.

