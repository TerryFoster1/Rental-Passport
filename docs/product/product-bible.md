# Rental Passport Product Bible

## Vision

Rental Passport is the trusted digital identity for renting.

It allows renters to create one secure, verified rental profile that can be reused anywhere. Instead of repeatedly completing rental applications, renters maintain a living Rental Passport that they control.

Landlords receive standardized, trustworthy information that reduces fraud, saves time, and improves decision-making.

Rental Passport is designed to become an industry standard that can integrate with any rental platform. Rental District is one application built on top of Rental Passport, but Rental Passport itself is platform-agnostic.

## Mission

- Reduce friction in renting.
- Increase trust between renters and landlords.
- Standardize rental applications.
- Protect renter data.
- Give renters ownership over their rental identity.
- Become the "Sign in with Google" equivalent for rental applications.

## Core Principles

- The renter owns their data.
- The renter controls who can access it.
- Verification is transparent.
- Security comes before convenience.
- Every feature should reduce application friction.
- Every feature should increase trust.
- Rental Passport must integrate with existing systems instead of replacing them.

## Primary Customer

The primary customer is residential renters.

Secondary customers include small landlords, property managers, brokerages, listing websites, property management software vendors, and future enterprise customers.

## Core Product

Each renter has a Rental Passport.

A Rental Passport may contain identity, contact information, government ID, employment, income, rental history, previous landlords, references, emergency contacts, pets, vehicles, uploaded documents, credit report, supporting documentation, verification status, activity history, and sharing permissions.

## Sharing

A passport can be shared by secure URL, temporary link, QR code, downloadable PDF, and future API integration.

The renter controls expiration dates and permissions.

## Verification

Verification is a paid service.

Verification may include identity verification, government ID validation, employment verification, income verification, pay stub verification, reference verification, previous landlord verification, credit report verification, and document authenticity review.

Verification produces a certified Rental Passport with timestamps and expiration dates.

## Landlord Workflow

A landlord receives a passport, reviews information and verification status, requests additional information when needed, then rejects or accepts.

If accepted, the landlord can send a lease and continue onboarding inside Rental District or another integrated platform.

## Future Integrations

Potential integrations include Rental District, Apartments.com, Realtor.ca, Property Vista, Yardi, Buildium, AppFolio, RentCafe, independent landlord websites, third-party screening providers, credit bureaus, and identity verification providers.

## Long-Term Vision

Rental Passport becomes the universal rental identity layer.

Listing sites display "Apply with RentalPassport.io" instead of proprietary application forms. Rental Passport becomes the common application format accepted across the rental industry.

## Business Model

Potential revenue lines include verification fees, premium renter subscriptions, API usage, enterprise integrations, identity verification, credit verification, landlord screening tools, escrow services subject to legal review, future financial services, future rent reporting, and future insurance partnerships.

## Out of Scope

Rental Passport does not cover rental property management, maintenance, messaging, inspections, payment collection, accounting, vendor management, or lease administration.

Those capabilities belong inside Rental District. Rental Passport exists before the lease is signed. Rental District exists after the renter is accepted.

## Technical Philosophy

Rental Passport is API-first, security-first, privacy-first, mobile-first, accessibility-first, enterprise-ready, internationalization-ready, modular, and event-driven.

Every major capability should be independently deployable in the future. The codebase should be organized to support millions of users without requiring major architectural redesign.

## API-First Architecture

Rental Passport is not just a web application. It is an API-first identity platform for the rental industry.

The React web application is the first client built on top of the platform. All business logic, workflows, validation, permissions, verification, and data access must live in backend services exposed through secure APIs.

The frontend should consume those APIs exactly as any future third-party integration would.

The architecture must support public REST APIs, internal APIs, OAuth 2.0 and OpenID Connect, webhooks, SDKs, event-driven architecture, versioned APIs, third-party integrations, enterprise customers, mobile applications, browser extensions, and future desktop applications.

Business logic must never be tightly coupled to the web interface.

Every architectural decision should support the long-term goal of establishing "Apply with RentalPassport.io" as a trusted rental industry standard, similar to "Sign in with Google" or "Continue with Apple."