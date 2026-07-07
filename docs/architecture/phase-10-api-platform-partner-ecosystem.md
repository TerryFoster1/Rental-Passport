# Phase 10 - API Platform and Partner Ecosystem

Phase 10 starts the platform layer for Rental Passport. The goal is to support future `Apply with RentalPassport.io` integrations without coupling partner workflows to the React web client.

## Implemented Scope

- Hidden developer portal at `/developers`
- Versioned API route manifest for `/api/v1`
- API request context, response envelope, authorization, scope, role, and rate-limit middleware contracts
- Supabase Edge Function placeholder at `supabase/functions/api`
- OAuth architecture service for future authorize, token, revoke, and introspection routes
- Webhook event catalog and envelope helper
- API logging record helper
- Integration provider registry
- Rental District handoff placeholder service
- Future JavaScript/TypeScript SDK package plan
- Phase 10 database migration for API, OAuth, webhooks, integrations, rate limits, and developer accounts

## API Philosophy

The React application remains the first client. Business logic must move behind secure API services as the platform matures. External platforms should receive only tenant-approved, scoped access to passport data.

## API Versioning

The first API namespace is `/api/v1`. Endpoints are documented as production-ready contracts, but most return documented placeholders until a future backend implementation phase connects live handlers.

## OAuth Foundation

Production OAuth is not implemented in Phase 10. The architecture reserves:

- `/oauth/authorize`
- `/oauth/token`
- `/oauth/revoke`
- `/oauth/introspect`

Future partners will request scopes, receive tokens, refresh tokens, revoke access, and audit access.

## Webhook Foundation

Webhook delivery is not implemented in Phase 10. The event catalog includes passport, application, verification, document, user, and consent events. Future delivery will use signed subscriptions and delivery attempts.

## Integration Architecture

Provider-specific logic belongs in `src/services/integrations/providers`. Phase 10 registers:

- Rental District
- SingleKey
- FrontLobby
- OpenRoom
- Stripe
- Resend
- Twilio
- Google
- DocuSign
- Future identity providers
- Future payment providers
- Future escrow providers

## Out of Scope

- Production OAuth server
- Production SDK packages
- Enterprise billing
- Partner marketplace
- Webhook delivery
- Live integrations
- Escrow
- Developer billing
- Usage analytics
- Enterprise admin
