# Provider Audit

Date: 2026-07-23

| Provider | Code / Config Evidence | Current Status | Launch Dependency |
|---|---|---:|---|
| Supabase Auth | `@supabase/supabase-js`, `AuthProvider`, migrations | Partially configured in code; runtime credentials unknown | Required for any real account/passport data. |
| Supabase Postgres | migrations define schema | Schema planned; live DB not verified | Required. |
| Supabase Storage | services upload to named buckets | Partially implemented; bucket policies not verified | Required for secure evidence vault. |
| Supabase Edge Functions | `supabase/functions/api/index.ts` | Placeholder only | Required for production API boundary. |
| Vercel | `.vercel`, `vercel.json` | Hosting configured historically | Required for Rental Passport frontend. |
| Render | Rental District provider, not Rental Passport | Not owned here | Rental District only. |
| Neon | Rental District provider, not Rental Passport | Not owned here | Rental District only. |
| Resend | `.env.example` only | Missing | Required for verification communications. |
| Twilio / SMS | no implementation | Missing | Optional Phase C; manual phone confirmation for MVP. |
| Stripe | env vars/docs only | Disabled/missing | Not launch dependency if billing disabled. |
| Google OAuth | Supabase OAuth call, env var | Partially implemented; credentials unverified | Required if Google login is offered. |
| SingleKey | demo copy only | Not integrated | Do not claim provider integration. |
| FrontLobby | no implementation found | Missing | Deferred. |
| OpenRoom | no tenant-facing implementation | Missing / landlord-side future | Must not appear in tenant marketing. |
| DocuSign/e-signature | no Rental Passport ownership | Rental District responsibility | Not a Rental Passport launch dependency. |
| Identity verification provider | no provider integration | Missing | Phase C. |
| AI provider/OCR | service/docs placeholders only | Missing | Internal-only Phase B/C after legal/security review. |

## Provider Risks

- `package.json` uses `"latest"` dependencies, which is not production-grade for provider SDK stability.
- No provider credentials should be committed. Current `.env.example` is safe placeholders.
- Provider claims must stay disabled until a sandbox and production test are completed.

