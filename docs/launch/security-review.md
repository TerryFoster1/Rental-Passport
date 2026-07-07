# Security Review

## Implemented Controls

- Role-aware app route gates
- Supabase RLS policies across tenant, landlord, reviewer, and developer data
- Private document bucket architecture
- Signed URL and secure viewer preparation
- Secure sharing tokens stored as hashes
- Security headers in `vercel.json`
- Audit and activity logging foundations
- API scope and role middleware contracts

## Remaining Required Reviews

- External penetration test
- Supabase auth log export and retention verification
- Production CORS allowlist for API functions
- Production rate-limit enforcement
- Secret rotation procedure
- Incident response exercise

## Sensitive Document Rules

Landlords cannot download ID, selfies, credit reports, pay stubs, employment letters, bank statements, or reference responses. Future document viewer must keep view-only, watermark-ready, recipient-specific, time-limited access.
