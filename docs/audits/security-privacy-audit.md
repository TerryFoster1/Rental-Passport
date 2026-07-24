# Security and Privacy Audit

Date: 2026-07-23

## Summary

The schema and frontend show a privacy-first intent: RLS, hashed share tokens, consent records, audit logs, document metadata, and share access logs exist. Production security is not yet proven because live RLS tests, backend viewer-session enforcement, signed document access, provider credential handling, and partner API authentication are not implemented end to end.

## Specific Findings

| Requirement | Current Status | Risk |
|---|---:|---|
| Landlord cannot enumerate passports | Not proven | Needs live RLS and API tests. |
| One landlord cannot view another landlord's passport | Partially designed | Sharing policies bind by landlord email; production viewer session enforcement needed. |
| Rental District cannot access raw documents by default | Designed, not proven | API is placeholder; document viewer incomplete. |
| Expired links fail closed | Partially implemented | `enforceShareActive` checks expiry; server-side enforcement required. |
| Revoked links fail closed | Partially implemented | share and token revocation updates exist; server-side validation required. |
| Document URLs are never public | Not proven | Storage buckets/policies not verified. |
| Verification history append-only | Partial | Activity/audit tables exist; no immutability controls verified. |
| Tenant changes invalidate affected sections only | Partially implemented | Some services set `needs_reverification`; needs version diffing and tests. |
| Partner-safe payloads only permitted data | Contracted/demo | Production API not implemented. |

## Supabase-Specific Concerns

- Review every `SECURITY DEFINER` function.
- Confirm no RLS policy relies only on broad `authenticated` role.
- Confirm storage bucket RLS and signed URL behavior.
- Run Supabase advisors before launch.

## Privacy Requirements Before Production

- Tenant-access dashboard for active shares, access logs, expiry, and revocation.
- Document retention/deletion policy.
- Data export and deletion workflow.
- Explicit consent text versioning.
- Administrator access logging and quality review.
- Feature flags for all incomplete integration paths.

