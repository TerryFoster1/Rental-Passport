# Security Architecture

Rental Passport handles sensitive identity, credit, income, employment, rental history, and document data. Security must be designed before real renter data is processed.

## Authentication

Supported paths:

- Tenant email/password
- Google OAuth
- Magic link, future-ready
- Landlord secure access from recipient-specific invitation
- Reviewer and administrator accounts with MFA
- Future partner OAuth

## Authorization

Authorization must be role-based, resource-scoped, and enforced by backend APIs and Row Level Security.

Permission checks must consider actor role, organization, passport owner, intended recipient, share token status, document grant status, jurisdiction, and consent.

## Encryption

- TLS for all traffic.
- Encryption at rest for database and storage.
- Private buckets for sensitive documents.
- No service-role keys in browser code.
- Secrets managed in Vercel/Supabase environment stores.

## Secure Document Viewing

Supporting document access must be authenticated, recipient-specific, time-limited, view-only, logged, revocable, and watermarkable.

Use signed URLs only for short-lived controlled viewing, not permanent document downloads.

## Share Expiration And Revocation

Share tokens require intended recipient email, expiry date, token hash, status, and revocation support.

Revocation should immediately disable passport access and document viewer grants.

## Access Logging

Log:

- Passport views
- Document views
- Downloads
- Share creation
- Share revocation
- Login attempts
- Reviewer access
- Admin access
- Partner API access

## Device Sessions

Track device sessions for risk monitoring and account protection. Device tracking should support privacy and legal review.

## Password Reset

Password reset flows must use short-lived tokens, rate limits, audit logs, and session invalidation after sensitive account recovery.

## Consent Tracking

Consent records must include consent type, text version, timestamp, actor, IP hash, and revocation where applicable.

## Audit Logs

Audit logs must be append-only or tamper-evident and must preserve verification, access, sharing, support, compliance, and administration history.

## Watermark Strategy

Document viewer watermark should include recipient email, timestamp, passport/application identifier, and "View Only - Rental Passport".

## Download Restrictions

Allowed downloads:

- Completed rental application
- Verification certificate
- Verification methods page
- Signed lease documents where appropriate

Blocked by default:

- ID documents
- Pay stubs
- Credit reports
- Bank records
- Employment letters
- Leases before executed lease download is appropriate
- Reference responses

## Threat Model

Primary threats:

- Stolen share links
- Account takeover
- Unauthorized landlord access
- Reviewer overreach
- Internal data leakage
- Storage bucket misconfiguration
- Signed URL leakage
- Document tampering
- Fake employers or landlords
- Partner API abuse
- Webhook replay
- Jurisdictional compliance failure

## Future Penetration Testing

Penetration testing should cover authentication, sharing, document viewing, RLS, partner APIs, upload handling, webhook validation, and reviewer/admin portals before real data launch.
