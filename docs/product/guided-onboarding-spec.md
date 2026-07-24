# Guided Onboarding Spec

Date: 2026-07-23  
Status: implementation-ready specification, not implemented in this pass.

## Purpose

Guided onboarding should help a renter create a complete Rental Passport without feeling like they are filling out another generic application. The experience must make progress visible, explain why each item is needed, and keep verification status separate from application completeness.

## Product Rules

- The renter owns the passport.
- The renter can save progress and return later.
- Completeness means requested information is present.
- Verification means Rental Passport has reviewed evidence and recorded a method.
- A section cannot be marked verified only because a renter filled it out.
- Google login confirms account access, not legal identity.
- Email verification confirms access to an email address, not identity.
- Phone verification remains manual until an SMS provider is implemented.

## Recommended Onboarding Steps

| Step | Goal | Required Before Continuing | Verification State |
|---|---|---|---|
| Account | Create secure account | Email/password or Google login | Email verified for password users |
| Profile | Capture legal/contact profile | Legal name, email, phone, region, language, timezone | Self reported until reviewed |
| Consent | Record permissions | Terms, privacy, verification consent, document handling consent | Consent recorded with version |
| Identity | Upload ID evidence | Government ID and selfie placeholder | Needs Review until manual/provider review |
| Employment and Income | Collect employment facts and evidence | Employer, role, income range/amount, proof document or direct verification request | Needs Review until evidence reviewed |
| Rental History | Collect prior tenancy facts | Address, dates, landlord contact, rent amount | Needs Verification until landlord/docs reviewed |
| References | Collect references | Reference names, relationship, contact details, consent | Needs Verification until references respond |
| Credit | Capture consent and report path | Consent plus uploaded report or future provider flow | Needs Review until report reviewed |
| Review | Confirm before sharing | User reviews passport summary | Ready to Share when required sections are complete |

## User Experience Requirements

- Each step needs a clear title, one-sentence reason, and current state.
- Use progressive disclosure. Show the next required action first.
- Use plain-language trust labels: `Not started`, `In progress`, `Needs review`, `Verified`, `Expired`.
- Do not show landlord-only upsells in tenant onboarding.
- Do not imply approval, risk scoring, or tenancy eligibility.
- Avoid technical architecture language on renter-facing screens.

## Save and Resume

Each section should support:

- Draft save.
- Required-field validation.
- Evidence upload status.
- Consent timestamp.
- Last updated timestamp.
- Change-after-verification warning.

If a verified field changes, the section should become `Needs Reverification` and retain the previous verification record for audit history.

## Communication Workflow

Tenant-facing communication must support:

- Email verification messages.
- More information requested by reviewer.
- Verification completed.
- Verification unable to complete.
- Passport shared.
- Passport access revoked or expired.
- Credit report renewal/reminder when expiry is approaching.

MVP delivery may use manual reviewer actions, but every message must be triggered through a recorded event or case note so it can later be automated.

## Empty, Error, and Loading States

- Empty state: show the next useful action, not a marketing explanation.
- Upload error: preserve the user input and explain acceptable formats.
- Verification error: say the section needs human review; do not expose internal suspicion labels.
- Session timeout: route to sign in and return to the previous onboarding step after login.

## Acceptance Criteria

- A renter can complete a passport without understanding Rental Passport's internal architecture.
- A verified badge appears only after evidence review is recorded.
- A passport can be complete but not verified.
- A passport can be verified but later require reverification after a material change.
- Every step records a durable audit or consent event where required.

