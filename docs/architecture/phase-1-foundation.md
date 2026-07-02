# Phase 1 Foundation

Status: Implemented application foundation

Phase 1 creates the production skeleton for Rental Passport without implementing passport business modules.

## Implemented Scope

- React, TypeScript, Vite, Tailwind application shell
- Supabase client configuration with session persistence
- Email and password authentication screens
- Sign up flow with required email verification
- Forgot password and reset password screens
- Google OAuth entry point
- OAuth callback route
- Protected route handling
- Role-aware route handling
- Tenant application layout
- Landlord layout placeholder with role gate
- Authentication layout
- Public layout
- Loading, error, empty, and alert states
- Initial profile form for account identity only
- Email verification trust state
- Phone verification placeholder for manual workflows
- Reusable shared components
- Phase 1 Supabase migration for profiles, roles, permissions, consent, and audit logs

## Explicitly Out of Scope

The following remain unimplemented until later phases:

- Rental Passport records
- Employment history
- Rental history
- References
- Identity verification
- Credit report workflows
- Document upload workflows
- Passport sharing
- Landlord application dashboard
- Reviewer portal
- Public APIs
- Third-party integrations
- Stripe payments
- Automated phone verification

## Authentication Boundary

The frontend uses Supabase Auth for email/password and Google OAuth.

Email/password users must verify email before accessing protected onboarding. Google users authenticate through the same protected shell and must complete the required profile onboarding.

The application derives the current email verification state from the Supabase user session. The database profile record is synchronized from `auth.users` using database triggers rather than trusting client-side writes for verification fields.

## Profile Boundary

Phase 1 profiles are account profiles only. They include:

- Legal first name
- Middle name
- Legal last name
- Preferred name
- Email
- Phone
- Country
- Province or state
- Language
- Timezone
- Account status
- Verification status
- Email verification state
- Phone verification state

No passport data is stored in the Phase 1 profile.

## Role Boundary

Phase 1 includes the durable role and permission tables required for protected routing and future access control.

Implemented roles:

- `tenant`
- `landlord`
- `property_manager`
- `verification_reviewer`
- `support`
- `compliance`
- `administrator`

The first signed-up user is not automatically elevated. New users receive the `tenant` role by default.

## Manual Phone Verification

Phone verification exists as a placeholder trust state only.

Manual confirmation workflows may update `phone_verified` and `verification_status` through trusted operational tooling in a later phase. No SMS, OTP, Twilio, or automated provider integration is implemented in Phase 1.

## Route Inventory

Public routes:

- `/`
- `/privacy`
- `/terms`
- `/contact`
- `/faq`

Authentication routes:

- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/auth/callback`

Protected routes:

- `/app`
- `/profile`
- `/onboarding/profile`
- `/landlord`

## Deployment Notes

The app remains a Vite single-page application deployed to Vercel. `vercel.json` rewrites all routes to `index.html`, so protected and public routes can refresh directly.

Required production environment variables:

- `VITE_APP_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The frontend must never expose service-role keys, Resend secrets, Stripe secrets, or provider admin credentials.
