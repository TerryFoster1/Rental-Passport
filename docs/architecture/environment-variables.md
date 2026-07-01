# Environment Variables

Environment variables must be owned, documented, and reviewed before sensitive workflows go live.

## Principles

- Never expose service-role keys to the browser.
- Public `VITE_` variables must not contain secrets.
- Provider credentials must be scoped to the minimum required capability.
- Verification providers, OpenRoom, escrow, credit, identity, email, maps, and lease-signing integrations must each have clear ownership and rotation procedures.
- Jurisdiction rules should be deployed through controlled backend configuration, not hard-coded browser secrets.

## Current Frontend Variables

See `.env.example` for the current inventory.

## Future Backend Variables

Future backend configuration may include:

- Supabase project URL and service role keys
- Identity verification provider credentials
- Credit provider credentials
- Email provider credentials
- Stripe credentials
- OpenRoom integration credentials
- Escrow provider credentials, legal review required
- Lease-signing provider credentials
- Webhook signing secrets
- AI document integrity provider credentials

## Deployment Mapping

Every variable should be mapped for local development, Vercel preview, Vercel production, and Supabase Edge Functions before use.
