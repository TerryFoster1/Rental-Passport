# Architecture Overview

Rental Passport is an API-first identity platform for the rental industry. The web application is the first client, not the system boundary.

## Architectural North Star

All business logic, workflows, validation, permissions, verification, and data access must live in backend services exposed through secure APIs. The React frontend should consume those APIs using the same contracts future third-party clients, mobile apps, browser extensions, and enterprise integrations will use.

## Platform Capabilities To Support

- Public REST APIs
- Internal APIs
- OAuth 2.0 and OpenID Connect
- Webhooks
- JavaScript SDK first, future SDKs later
- Event-driven integrations
- Versioned APIs
- Third-party integrations
- Enterprise customers
- Mobile applications
- Browser extensions
- Future desktop applications

## System Boundaries

- `src/` contains the first-party web client only.
- `supabase/functions/` is reserved for backend Edge Function entry points.
- `supabase/migrations/` is reserved for database migrations.
- `docs/api/` owns integration contracts and API standards.
- `docs/security/` owns authentication, authorization, privacy, and data protection strategy.

## Non-Negotiable Constraints

- Business logic must never be tightly coupled to the web interface.
- Renter data ownership and consent must be central to all workflows.
- Security and privacy take precedence over convenience.
- Every major capability should be modular enough to become independently deployable in the future.
- Architecture decisions must support millions of users and thousands of third-party integrations without requiring major redesign.

## Current Scope

The frontend MVP is a production-facing prototype. It demonstrates the renter and landlord experience, but it must not be treated as the source of business logic. Verification workflows, permissions, audit trails, data access, regional application generation, lease workflows, and fraud review must be implemented behind secure backend APIs before real customer data is processed.

## Core Architecture Documents

- `docs/product/product-bible.md` defines the product north star.
- `docs/architecture/verification-engine.md` defines the verification system and passport confidence model.
- `docs/security/privacy-model.md` defines document privacy and permissions boundaries.
- `docs/security/fraud-detection.md` defines fraud signals and mitigation strategy.
- `docs/api/api-design.md` defines the future API-first integration surface.
