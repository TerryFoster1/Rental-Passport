# Security Checklist

The implementation security model is defined in `docs/security/security-architecture.md`, `docs/security/permissions-matrix.md`, and `docs/security/compliance-blueprint.md`.

## Platform Security Themes

- Renter data ownership and explicit consent
- Strong authentication and session management
- Separation of authentication and authorization
- Row Level Security for all sensitive database records
- Secure document uploads and storage access controls
- Audit logs for access, sharing, verification, and integration events
- Scoped API access for third-party integrations
- Webhook signing and replay protection
- Rate limiting and abuse prevention
- Secrets management across local, Supabase, and Vercel environments
- Provider risk review for identity, credit, verification, email, storage, payments, maps, OpenRoom, escrow, and digital signing
- Recipient-specific secure passport invitations
- Magic link or login requirement for landlord access
- One-time code where appropriate
- Tenant-visible access logs
- Auto-revocation after tenant accepts a lease elsewhere where appropriate

## Product Safety Guardrails

- No Applicant Score.
- No Tenant Score.
- No approval recommendation.
- No desirability ranking.
- Passport Completeness may measure supplied and independently verified information only.
- Document Integrity Assessment may describe evidence integrity only.
- AI fraud outputs must be explainable and reviewable.

## Privacy Guardrails

- Raw documents must stay private by default.
- Landlord downloads must be limited to completed rental applications, verification certificates, summaries, and signed lease documents where appropriate.
- Raw document sharing must require explicit, scoped, revocable renter permission.
- Supporting document viewers must be authenticated, recipient-specific, time-limited, view-only, revocable, logged, and watermarkable.
- Activity history must record sharing, viewing, verification, expiry, and document updates.

## Compliance Guardrails

- Jurisdiction must determine allowed questions, filters, lease templates, and workflows.
- Illegal screening questions must be suppressed.
- Legal review is required before launch for PIPEDA, CASL, GDPR readiness, housing laws, credit authorization, employment verification consent, reference verification consent, identity document handling, retention, deletion, export, consent logging, audit logs, regional leases, and escrow regulations.
- Verified Deposit, credit usage, OpenRoom search, enhanced verification reports, and lease templates require legal review before implementation.

## MVP Verification Guardrails

- Use manual or semi-manual review first.
- Do not depend on paid OCR, paid ID verification, open banking, or direct credit bureau APIs for MVP launch.
- AI may assist reviewers but must not make final legal identity decisions.
- Verification confidence describes authenticity, not applicant quality.

## Current Scope

Phase 11 implements the security hardening foundation: Vercel security headers, private-storage architecture, route gates, RLS-backed data ownership, secure sharing token hashing, audit/activity foundations, API security contracts, and launch readiness documentation.

Before broad public launch, complete production environment verification, external penetration testing, Supabase auth log retention review, production CORS allowlists, and incident response drills.
