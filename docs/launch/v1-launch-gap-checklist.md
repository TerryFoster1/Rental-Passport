# V1 Launch Gap Checklist

Date: 2026-08-04  
Scope: concise status tied to current code and local runtime evidence.

## Baseline Evidence

- Repository: `C:\Users\kathr\Documents\Claude CoWork Files\Projects\Apps\rental-passport`
- Branch: `main`
- Remote: `https://github.com/TerryFoster1/Rental-Passport.git`
- Current local head before this sprint: `7c22147 Add Official Ontario LTB Order Search Model`
- Supabase CLI: installed as `supabase.cmd` version `2.109.1`
- Local staging credentials: not present
- `.env.local`: not present
- Live Supabase, Resend, Stripe, and Rental District staging validation: not run

## Launch Gaps

| Area | Status | Evidence | Launch Blocker |
| --- | --- | --- | --- |
| Tenant onboarding | Partial | Guided onboarding route, autosave, stage progress, consent capture, upload service exist. | Regional rental application field rules and live-backed validation remain incomplete. |
| Completeness vs verification | Improved | Fallback passport now shows complete/provided without issuing verified badge. | Live verification cases still need staging validation. |
| Secure evidence upload | Partial | Private bucket migrations and evidence metadata services exist. | Live bucket/RLS tests and signed document viewing are not proven. |
| OCR | Partial | Provider abstraction and supported document categories added. | No live OCR provider, processing job migration, extraction UI, or reviewer correction workflow. |
| Document consistency | Partial | Domain states exist for internal findings. | No persisted consistency jobs or reviewer queue integration. |
| Identity verification | Partial | ID upload, manual checklist, and reviewer concepts exist. | Live identity review workflow and selfie/ID access controls not proven. |
| Employment verification | Partial | Employer outreach, document upload, and manual review services exist. | Live Resend/outreach and business-research provider abstraction are incomplete. |
| Rental history verification | Partial | Rental history records, documents, contacts, outreach concepts exist. | Contact legitimacy research and live response workflow need staging proof. |
| References | Partial | Reference entry and response route foundations exist. | Reminder sequence and live recipient flow need staging proof. |
| Ontario LTB catalogue | Partial | Official source model and conservative matching tests exist. | No approved ingestion/indexing job, retention approval, or live reviewer workflow. |
| Paid verification | Partial | Product definitions distinguish $29 verification from credit. | Stripe orders, webhooks, duplicate prevention, refund handling, and live authorization are missing. |
| Verified credit | Partial | Manual credit status model exists and credit remains separate. | Provider work item, payment, secure evidence, and live review workflow not complete. |
| Reviewer portal | Partial | Case queue/detail, decisions, notes, evidence, outreach views exist. | Full V1 queues, OCR/consistency/LTB queues, and live permission tests are incomplete. |
| Landlord passport | Partial | One-screen partner viewer exists with section summaries. | Secure account flow, real received passports, and live access control need staging proof. |
| Rental District integration | Partial | Demo contract and partner-safe LTB contract exist. | Production service-to-service auth, events, and acceptance handoff are not live. |
| Security/privacy | Blocked | RLS policies and private storage architecture exist. | Live RLS/security test matrix has not run. |

## Current Safe Claims

- Create a reusable Rental Passport application.
- Track application completeness separately from verification.
- Share a passport through scoped Rental Passport flows when configured.
- Manual verification architecture exists for identity, employment, rental history, references, credit, and official Ontario LTB catalogue review.

## Claims Still Disabled

- Launch-ready verification platform.
- Instant verification.
- Fully automated fraud detection.
- Direct credit bureau integration.
- Complete LTB history.
- Automatic facial verification.
- Guaranteed tenant quality or rent payment.
- Automatic approval/rejection recommendation.

