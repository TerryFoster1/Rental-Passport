# Rental District Staging Contract Test

Date: 2026-07-24  
Status: prepared; live Rental District staging execution required.

## Purpose

This contract test confirms Rental District can demonstrate an application submitted with Rental Passport while keeping product ownership boundaries clear.

Rental Passport owns:

- Verified passport viewer.
- Consent and document permissions.
- Verification status.
- Evidence access rules.
- Partner-safe summary metadata.

Rental District owns:

- Application notifications.
- Manual application flow.
- Property dashboard.
- Application accept/reject decision.
- Lease generation.
- Digital signature.
- Tenancy creation.
- Post-approval tenant profile.

## Required Demo Records

- Applicant: Kathryn Casey.
- Partner: Rental District.
- Partner id: `rental_district`.
- Rental Passport application id: `demo-rp-app-001`.
- Demo property: `123 Maple St, Unit 1204, Toronto, ON`.
- Local viewer path: `http://127.0.0.1:5173/partner/application/demo-rp-app-001?launch_token=demo-valid-rental-district`.
- Production viewer path: `https://rentalpassport.io/partner/application/demo-rp-app-001?launch_token=demo-valid-rental-district`.

## Rental District UI Requirements

The landlord dashboard should show two application cards:

- Kathryn Casey, applied with RentalPassport.io.
- One manual demo applicant with mock application details and mock documents.

The Rental Passport card should:

- Use a blue border.
- Display a shield/check trust mark once.
- Say `Verified rental profile`.
- Say `This application has been pre-screened and verified by RentalPassport.io.`
- Use one primary button: `Open Passport`.
- Include a save/star control for later filtering.
- Avoid repeated status chips such as `Hosted viewer` or `Partner-safe summary`.

The manual card should:

- Default to the regular application view.
- Show screening as incomplete unless manually verified.
- Provide manual review and verification request actions.

## Viewer Launch Requirements

When the landlord clicks `Open Passport`:

- The Rental Passport-hosted viewer opens.
- Rental Passport branding is visible.
- The viewer defaults to the verified passport summary.
- Application form data is available as a secondary tab or section.
- Documents are viewable only when permitted.
- Reviewer/internal notes are never shown.
- Final tenancy decisions are made in Rental District, not Rental Passport.

## Approval-To-Lease Demo Path

1. Landlord opens Rental District dashboard.
2. Notification indicates a new Rental Passport application.
3. Landlord opens Kathryn Casey application.
4. Landlord opens Rental Passport viewer.
5. Landlord reviews verified sections and permitted documents.
6. Landlord returns to Rental District.
7. Landlord approves tenancy.
8. Rental District generates the regionally valid lease.
9. Rental District sends lease for digital signature.
10. Signed lease returns to Rental District.
11. Rental District property dashboard shows Kathryn Casey as tenant.
12. Rental District no longer has continuing access to Rental Passport source documents unless Kathryn grants a new permission.

## Pass/Fail Matrix

| Check | Expected Result |
| --- | --- |
| Notification appears | Rental District shows a new Rental Passport application notification |
| Two applications visible | One Rental Passport application and one manual application |
| Rental Passport card wording | Single verified message, no repeated chips |
| Open Passport button | Opens Rental Passport viewer |
| Viewer branding | Rental Passport logo/branding shown |
| Viewer authorization | Valid launch token required |
| Expired/revoked token | Viewer denied |
| Manual applicant | Opens Rental District application/documents by default |
| Approve tenancy | Lease workflow begins in Rental District |
| Post-approval access | Rental District retains application package, not ongoing passport document access |

