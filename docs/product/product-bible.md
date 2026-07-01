# Rental Passport Product Bible

## Core Product Statement

Rental Passport verifies information.

Rental Passport protects renter privacy.

Rental Passport ensures legal compliance.

Rental Passport standardizes rental applications.

Rental Passport reduces fraud.

Rental Passport does not make rental decisions.

Rental Passport does not rank people.

Rental Passport gives landlords trusted facts so they can make informed decisions.

This statement is the guiding principle for all future architecture, product, design, and feature decisions.

## Vision

Rental Passport is the trusted digital identity for renting.

It allows renters to create one secure, verified rental profile that can be reused anywhere. Instead of repeatedly completing rental applications, renters maintain a living Rental Passport that they control.

Landlords receive standardized, trustworthy information that reduces fraud, saves time, and supports informed decision-making without exposing unnecessary private documents.

Rental Passport is designed to become an industry standard that can integrate with any rental platform. Rental District is one application built on top of Rental Passport, but Rental Passport itself is platform-agnostic.

## Mission

- Reduce friction in renting.
- Increase trust between renters and landlords.
- Standardize rental applications.
- Protect renter data.
- Give renters ownership over their rental identity.
- Verify facts without judging people.
- Become the "Sign in with Google" equivalent for rental applications.

## Product Philosophy

Rental Passport is not a tenant scoring platform.

Rental Passport is a verification platform.

The product verifies information. It does not determine whether someone deserves housing, recommend approval, or rank applicants by desirability.

The platform should answer one landlord question: "Can I trust that this information is real?"

A renter with poor credit can still have a 100% Complete and Verified Passport if the information requested for that passport version has been supplied and independently verified.

## Core Principles

- The renter owns their data.
- The renter controls who can access it.
- Verification is transparent.
- Security comes before convenience.
- Every feature should reduce application friction.
- Every feature should increase trust.
- Every feature should protect renter privacy.
- Legal compliance must shape questions, filters, workflows, leases, and landlord views.
- Rental Passport must integrate with existing systems instead of replacing them.

## Primary Customer

The primary customer is residential renters.

Secondary customers include small landlords, property managers, brokerages, listing websites, property management software vendors, and future enterprise customers.

## Core Product

Each renter has a Rental Passport.

A Rental Passport may contain identity, contact information, government ID, employment, income, rental history, previous landlords, references, emergency contacts, pets, vehicles, uploaded documents, credit report, supporting documentation, verification status, activity history, and sharing permissions.

The passport is versioned. Verification applies to a passport version, not permanently to a user account.

## Passport Completeness

Passport Completeness replaces any concept of applicant score or tenant score.

A passport can be:

- 100% Complete and Verified
- Partially Verified
- In Progress

Completeness measures whether requested information has been supplied and independently verified. It never measures whether someone is a better tenant.

## Section Verification Status

Every major passport section has its own verification state:

- Identity
- Employment
- Income
- Rental History
- References
- Credit Report
- Documents

Supported section states:

- Verified
- Self Reported
- Needs Review
- Needs Verification
- Expired
- Needs Reverification
- Missing

Where appropriate, a section may also show confidence about authenticity:

- High Confidence
- Medium Confidence
- Low Confidence
- Manual Review Required

Confidence describes authenticity of information, not applicant quality.

## Sharing

A passport can be shared by secure URL, temporary link, QR code, downloadable application package, and future API integration.

The renter controls expiration dates, permissions, and revocation.

Documents remain private by default. Landlords receive verified information, evidence summaries, and application packages, not raw private files.

Shared passports must never be simple public links. Secure sharing requires a unique token, intended recipient email, authentication or magic link, expiry, revocation, access logs, and tenant visibility into views.

## Verification

Verification is a paid service.

Verification may include identity verification, government ID validation, employment verification, income verification, pay stub review, reference verification, previous landlord verification, credit report verification, and document authenticity review.

Verification produces a versioned Rental Passport with timestamps, expiry dates, evidence summaries, and audit history.

The MVP should be manual-first. Tenants upload documents, Rental Passport reviews them manually or semi-manually, and AI may assist reviewers only where inexpensive, safe, reviewable, and auditable. Paid OCR, paid ID verification, credit bureau APIs, and open banking should be later enhancements.

## Landlord Workflow

A landlord receives a passport, reviews information and verification status, requests additional information when needed, then makes their own rental decision.

Rental Passport may help generate regional rental applications and digital lease agreements after acceptance, but it must not recommend approval or rank people.

The first passport page should be a trusted summary, not a dashboard. A landlord should understand whether the application is worth deeper review within about 15 seconds.

Secure landlord access should feel like applicant protection, not software registration. Use language such as Create Secure Access, Secure This Application, Protect Applicant Information, and Continue Securely.

After secure access is created, the landlord should land in a simple Applications dashboard containing the invited application. As more passports are shared, they appear automatically.

## Default Applicant Sorting

Default applicant lists should sort by:

1. Passport Completeness
2. Fully Verified Passports
3. Date Applied

Optional landlord sorting may include newest, oldest, recently updated, verification status, and application date.

No algorithmic ranking of people should exist.

## Filtering Philosophy

Filtering is allowed. Scoring people is not.

Supported filters may include fully verified, identity verified, employment verified, income verified, rental history verified, credit report verified, references verified, document complete, application date, move-in date, monthly income, verified income multiple, pets where legally permitted, smoking preference where legal, parking required, and other legal search criteria.

Filters must automatically adapt to local housing regulations.

## Regional Compliance

Rental Passport must understand jurisdiction: country, province, state, territory, and future municipality.

Features, filters, leases, and workflows must adapt automatically. Illegal screening questions must not appear in jurisdictions where prohibited, including questions around pets, family status, disability, marital status, age, or other protected characteristics where applicable.

## Income Presentation

Rental Passport should present facts, not recommendations.

Income presentation should show:

- Verified Monthly Income
- Verified Annual Income
- Income Verification Method
- Income Multiple relative to advertised rent

Example:

- Monthly Rent: $2,000
- Verified Income: $6,500/month
- Income Multiple: 3.25x

The landlord makes the decision.

## Trust Signals

Every verified section should explain how it was verified.

Examples:

- Employment: direct employer contact, pay stub review, employment letter, bank deposit confirmation
- Rental History: lease agreement, previous landlord contact, payment history
- Credit: Equifax, TransUnion, SingleKey, FrontLobby
- Identity: government ID, facial verification, document authentication
- References: direct contact, phone verification, email verification

The emphasis is trust and transparency, not document access.

## Activity History

Passport Activity History should track auditable events such as:

- Employment verified
- Identity verified
- Credit report refreshed
- Passport shared
- Passport viewed
- Verification expired
- Landlord accepted application
- Documents updated

## Future Product Capabilities

Future capabilities include:

- Rental Passport Verified Deposit, subject to legal review
- AI Document Integrity Assessment
- Jurisdiction-specific digital lease library
- Regional application generator
- API-first third-party integrations
- OpenRoom search as an optional landlord upsell
- Enhanced verification reports as optional landlord upsells

## Business Model

Potential renter revenue:

- Passport Verification
- Premium renter subscriptions
- Future financial services
- Future rent reporting
- Future insurance partnerships

Potential landlord and partner revenue:

- API usage
- Enterprise integrations
- OpenRoom search
- AI Fraud Review
- Enhanced Credit Analysis
- Employment Reverification
- Reference Deep Dive
- Document Authenticity Review
- Corporate Verification
- Identity Risk Analysis
- Additional verification reports

Verified Deposit is a future roadmap item and requires legal review because escrow rules differ across jurisdictions.

## Future Integrations

Potential integrations include Rental District, Apartments.com, Realtor.ca, Property Vista, Yardi, Buildium, AppFolio, RentCafe, independent landlord websites, third-party screening providers, credit bureaus, identity verification providers, OpenRoom, and lease-signing providers.

## Long-Term Vision

Rental Passport becomes the universal rental identity layer.

Listing sites display "Apply with RentalPassport.io" instead of proprietary application forms. Rental Passport becomes the common application format accepted across the rental industry.

## Out of Scope

Rental Passport does not cover rental property management, maintenance, messaging, inspections, payment collection, accounting, or vendor management.

Rental Passport owns the pre-tenancy workflow through application, verification, approval support, regional lease generation, digital signature, and executed lease handoff. Active tenancy management belongs inside Rental District or integrated platforms.

## UX Direction

Tenant experience: build once, verify once, apply everywhere.

Landlord experience: open link, trust immediately, review only the sections that matter, click deeper only when necessary.

The passport itself is not a dashboard. It is a trusted summary. The first page should include only applicant name, passport ID, verification date, passport expiry, fully verified badge, Passport Completeness, core section verification badges, quick summary, and landlord actions such as message, save, and accept.

Every major section should be clickable. Detail pages contain what was verified, how it was verified, supporting documentation, confidence level, and verification history.

The interface should feel simple, calm, and trustworthy. It should use cards, trust badges, verification badges, clear status indicators, minimal navigation, generous whitespace, and professional document-style layouts.

The product should feel closer to Apple, Stripe, Plaid, modern banking, insurance portals, and government digital identity than CRM software or complex analytics platforms.

## Technical Philosophy

Rental Passport is API-first, security-first, privacy-first, compliance-first, mobile-first, accessibility-first, enterprise-ready, internationalization-ready, modular, and event-driven.

Every major capability should be independently deployable in the future. The codebase should be organized to support millions of users without requiring major architectural redesign.

## API-First Architecture

Rental Passport is not just a web application. It is an API-first identity platform for the rental industry.

The React web application is the first client built on top of the platform. All business logic, workflows, validation, permissions, verification, compliance decisions, and data access must live in backend services exposed through secure APIs.

The frontend should consume those APIs exactly as any future third-party integration would.

The architecture must support public REST APIs, internal APIs, OAuth 2.0 and OpenID Connect, webhooks, SDKs, event-driven architecture, versioned APIs, third-party integrations, enterprise customers, mobile applications, browser extensions, and future desktop applications.

Business logic must never be tightly coupled to the web interface.

Every architectural decision should support the long-term goal of establishing "Apply with RentalPassport.io" as a trusted rental industry standard, similar to "Sign in with Google" or "Continue with Apple."
