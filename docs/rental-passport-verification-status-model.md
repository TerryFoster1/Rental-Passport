# Rental Passport Verification Status Model

Status: demo state machine implemented.

## Request Statuses

- `request_received`
- `applicant_invited`
- `applicant_viewed`
- `applicant_accepted`
- `applicant_declined`
- `account_linked`
- `information_imported`
- `consent_pending`
- `payment_pending`
- `information_incomplete`
- `verification_queued`
- `verification_in_progress`
- `additional_information_required`
- `manual_review`
- `verification_complete`
- `needs_review`
- `request_expired`
- `request_cancelled`

Demo controls advance only in non-production unless explicitly enabled.

## Result States

Viewer results use clear section states such as Verified directly, Verified by document, Self-declared, Pending, Unable to verify, Needs review, Missing, and Expired.

