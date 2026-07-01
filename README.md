# Rental Passport

Rental Passport is the trusted digital identity for renting: one secure, verified rental profile renters control and can reuse across rental applications.

This repository is intentionally structure-only at this stage. It contains the development architecture, configuration, documentation placeholders, and folder conventions needed to grow into a production-grade SaaS platform.

## Product Direction

Rental Passport is an API-first identity platform for the rental industry. The React web application is only the first client. Backend services must own business logic, workflows, validation, permissions, verification, data access, and integration contracts.

The long-term goal is to support "Apply with RentalPassport.io" across listing websites, brokerages, landlords, property management systems, and third-party rental platforms.

## Stack

- React, TypeScript, Vite
- TailwindCSS and shadcn/ui conventions
- Supabase, PostgreSQL, Edge Functions, Row Level Security
- Vercel hosting
- Stripe, Resend, Google Maps API, and Supabase Storage integration points

## Current Scope

No product features, UI screens, database tables, API handlers, or business logic have been implemented yet.

## Foundational Docs

- Product Bible: `docs/product/product-bible.md`
- Architecture Overview: `docs/architecture/architecture-overview.md`
- API Design: `docs/api/api-design.md`
- Database Design: `docs/database/database-design.md`
- Security Checklist: `docs/security/security-checklist.md`