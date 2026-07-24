# Manual Credit Workflow

Date: 2026-07-23  
Status: MVP workflow specification.

## Purpose

Rental Passport may support a manual credit-report workflow before a direct credit bureau/provider integration exists. This workflow must avoid claiming automated bureau connectivity or full credit underwriting.

## Tenant Flow

1. Tenant consents to credit report handling.
2. Tenant uploads an accepted credit report document.
3. System records upload metadata, consent version, and report date if provided.
4. Reviewer confirms the document is readable, complete enough for MVP summary, and belongs to the tenant.
5. Reviewer records permitted summary fields.
6. Landlords see the summary only, not the full report, unless the tenant explicitly authorizes document access.

## Reviewer Checks

- Tenant name matches the passport identity profile.
- Report date is visible.
- Report source is visible when available.
- Score or summary fields are visible if the product intends to show them.
- Public record, collections, and utilization fields are recorded only when clearly supported.
- Any missing page, cropped page, or suspicious alteration is escalated.

## Allowed MVP Claims

- "Credit information reviewed by Rental Passport."
- "Credit summary available to authorized landlords."
- "Full credit report is not shared by default."
- "Credit report verified by document review" when a reviewer records that method.

## Disabled Claims Until Provider Integration

- "Credit pulled automatically."
- "Direct bureau connection."
- "Real-time credit check."
- "Credit verified by Equifax/TransUnion" unless an actual provider/bureau source and permission chain are implemented and tested.
- "No manual review required."

## Expiry and Renewal

Credit report summaries should expire on a configurable date. Renewal options may be offered when the report expires, but renewal pricing must not be invented in tenant-facing copy until approved.

## Privacy Requirements

- Store credit documents in a high-sensitivity bucket/path.
- Log every document access.
- Prefer summaries over full report sharing.
- Keep internal review notes separate from landlord-facing summaries.
- Redact or avoid storing irrelevant sensitive details where possible.

