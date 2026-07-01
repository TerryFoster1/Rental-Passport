# Partner Integration Strategy

Rental Passport should become trusted identity infrastructure for rental applications.

## Integration Principles

- API-first.
- Consent-first.
- Versioned contracts.
- No raw document exposure by default.
- No tenant scoring or approval recommendation.
- Partner access is scoped, auditable, and revocable.

## Rental District

Rental District consumes accepted applicant and executed lease handoff data. Rental Passport remains the trust and verification platform. Rental District owns active tenancy management.

## Listing Websites

Listing sites can embed "Apply with RentalPassport.io" and receive application status and verification summary events.

## Property Management Software

PMS partners may retrieve application packages, verification summaries, status events, and lease handoff payloads through scoped APIs.

## Credit Providers

Credit providers may supply manual provider-assisted reports initially and direct API integrations later. Raw credit reports are not exposed to landlords by default.

## Identity Providers

Identity providers may support later provider-based ID verification after manual MVP review. Provider decisions must remain auditable.

## OpenRoom

OpenRoom search is an optional landlord premium service and requires legal review.

## Escrow Providers

Future Verified Deposit integrations require legal review, provider due diligence, and region-specific controls.

## Developer Portal

The hidden developer portal should document OAuth, REST APIs, SDKs, webhooks, onboarding, sandbox test data, and the Apply with RentalPassport.io button.

## OAuth Partner Flow

Future partner flow:

1. Partner redirects renter to Rental Passport.
2. Renter authenticates.
3. Renter selects passport/application data to share.
4. Renter grants scoped consent.
5. Partner receives authorization code.
6. Partner exchanges code for scoped token.
7. Partner receives verification facts and permitted application data.

## Webhook Events

Initial partner events:

- passport.shared
- passport.viewed
- verification.completed
- verification.expired
- application.accepted
- application.withdrawn
- lease.executed
