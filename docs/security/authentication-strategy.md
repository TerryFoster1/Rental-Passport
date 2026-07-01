# Authentication Strategy

Rental Passport authentication must support renters, landlords, future partners, and future enterprise integrations without coupling identity to the web interface.

## Planned Authentication Modes

- Email/password
- Google OAuth
- Magic links, future-ready
- OAuth 2.0 / OpenID Connect for future third-party integration

## Principles

- Authentication must be separate from authorization.
- Renter consent must govern data access, not mere account possession.
- Future public integration flows should support "Apply with RentalPassport.io" without exposing unnecessary renter data.
- Account recovery, MFA, session management, and device trust should be designed before sensitive workflows go live.
- Authentication must not imply landlord access to raw documents.
- Authentication events should feed Passport Activity History where relevant.
- Partner authentication must preserve jurisdiction-aware permissions and filters.

## Current Scope

No authentication flows are implemented yet.
