# Marketing Claims Matrix

Date: 2026-07-23  
Status: approved-language guardrail for relaunch planning.

## Purpose

This matrix defines what Rental Passport and Rental District may safely say at each maturity stage.

## Current Prototype / Demo

| Claim | Allowed? | Notes |
|---|---:|---|
| "Create one reusable rental application." | Yes | Supported as product direction and demo flow. |
| "Apply with RentalPassport.io." | Demo only | Must be labelled demo unless real partner integration is live. |
| "Verified Rental Passport" | Limited | Allowed for seeded/demo records; production claims require reviewer evidence. |
| "Independently verified by Rental Passport." | Limited | Only if the specific demo/user record was manually configured for demonstration. |
| "Automated verification." | No | Provider workflows are not implemented. |
| "Credit pulled directly from bureaus." | No | Credit provider integrations are not implemented. |
| "AI fraud review." | No | AI can be future reviewer assistance only. |
| "Tenant approved" or "recommended." | No | Rental Passport does not approve tenants. |

## Phase A Manual MVP

| Claim | Allowed? | Conditions |
|---|---:|---|
| "Information reviewed by Rental Passport." | Yes | Reviewer case and audit trail exist. |
| "Verified by document review." | Yes | Evidence and reviewer method recorded. |
| "Verified directly." | Yes | Direct third-party confirmation recorded. |
| "Full credit report is not shared by default." | Yes | Access controls and summaries implemented/tested. |
| "Landlords receive a trusted summary." | Yes | Partner-safe summary contract implemented. |
| "Bank-level security." | Avoid | Use specific security claims instead. |

## Phase C Provider-Assisted

| Claim | Allowed? | Conditions |
|---|---:|---|
| "Provider-sourced identity verification." | Yes | Provider integration live and tested. |
| "Credit report included." | Yes | Provider or approved manual purchase workflow live. |
| "Credit report verified." | Yes | Verification method/date/provider recorded. |
| "Fast verification." | Limited | Only if operational SLA supports it. |

## Rental District Safe Claims

Rental District may say:

- "Applied with RentalPassport.io."
- "Open Passport."
- "This application has been pre-screened and verified by RentalPassport.io" only when Rental Passport returns a verified passport state for that application.
- "Application form auto-filled from Rental Passport" when the form fields are populated from passport data.

Rental District must not say:

- "Approved by Rental Passport."
- "Guaranteed tenant."
- "Risk-free applicant."
- "Fraud-free."
- "Credit verified by bureau" unless Rental Passport returns a provider-sourced claim.

## Disabled Capabilities

Do not expose these in production copy until implemented and tested:

- OpenRoom/tribunal search.
- AI fraud review.
- Automated identity provider verification.
- Automated credit provider pull.
- Public API self-serve integration.
- Background checks.
- Landlord screening add-ons in tenant flows.

