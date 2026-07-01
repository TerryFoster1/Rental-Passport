# Production Readiness Status

This document tracks production-facing polish for the current frontend MVP. It does not authorize collection of real renter data before backend security, legal review, and verification workflows are implemented.

## Completed In Frontend MVP

- Browser title
- Meta description
- Open Graph metadata
- Twitter card metadata
- Canonical URL
- SVG favicon
- Social sharing image
- `robots.txt`
- `sitemap.xml`
- SPA refresh support through Vercel rewrite and client route mapping
- Public landing page
- Contact page
- FAQ page
- Privacy Policy page
- Terms of Service page
- Footer
- 404 state for unknown client routes
- Visible document-privacy messaging
- Focus-visible accessibility styling

## Intentionally Deferred Until Backend Implementation

- Real authentication loading states
- Real form validation
- Real upload validation
- Real empty states from database-backed records
- Real success states from persisted workflows
- Cookie consent banner for non-essential analytics or advertising
- Provider-backed verification status
- Manual reviewer workflows
- Secure sharing, intended recipient, and magic-link access
- Landlord Applications dashboard
- Authenticated, view-only, time-limited supporting document viewer
- Audit log UI sourced from backend events
- Error states sourced from API failures

## Cookie Position

The MVP does not require a cookie banner while it avoids non-essential analytics, advertising, and tracking cookies. If those are introduced, cookie notice and consent controls must be implemented before release.

## Launch Blockers Before Real User Data

- Legal review of Privacy Policy and Terms of Service
- PIPEDA and GDPR privacy assessment
- CASL review for email invitations and verification outreach
- Credit authorization review
- Employment and reference consent review
- Identity document handling review
- Deletion and data export request process
- Data retention policy
- Jurisdiction-specific screening and filter review
- Security review of storage and access controls
- RLS policy review
- Provider contracts for identity, credit, employment, and fraud checks
- Incident response and audit logging plan
- Confirmation that no tenant/applicant scoring exists in product, API, or data model
