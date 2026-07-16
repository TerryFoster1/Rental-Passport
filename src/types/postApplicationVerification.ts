export type VerificationRequestPackage = 'standard_verification' | 'verified_plus_credit';

export type VerificationRequestPayerMode = 'applicant_pays' | 'landlord_pays' | 'included_verification_credit';

export type DemoPaymentState =
  | 'not_required'
  | 'awaiting_payment'
  | 'payment_completed'
  | 'payment_failed'
  | 'payment_waived'
  | 'verification_credit_redeemed';

export type PostApplicationVerificationStatus =
  | 'request_received'
  | 'applicant_invited'
  | 'applicant_viewed'
  | 'applicant_accepted'
  | 'applicant_declined'
  | 'account_linked'
  | 'information_imported'
  | 'consent_pending'
  | 'payment_pending'
  | 'information_incomplete'
  | 'verification_queued'
  | 'verification_in_progress'
  | 'additional_information_required'
  | 'manual_review'
  | 'verification_complete'
  | 'needs_review'
  | 'request_expired'
  | 'request_cancelled';

export type ImportedFieldConflict = {
  field: string;
  importedValue: string;
  existingValue: string;
  resolution: 'use_imported' | 'keep_existing' | 'needs_applicant_decision';
};

export type ImportedApplicationField = {
  label: string;
  value: string;
  source: string;
  section: 'identity' | 'application' | 'employment' | 'rental_history' | 'references' | 'documents';
  conflict?: ImportedFieldConflict;
};

export type VerificationConsentKey =
  | 'identity_verification'
  | 'employment_verification'
  | 'income_document_review'
  | 'rental_history_verification'
  | 'reference_contact'
  | 'document_review'
  | 'credit_authorization'
  | 'share_results_with_partner';

export type VerificationConsentRecord = {
  key: VerificationConsentKey;
  label: string;
  required: boolean;
  acceptedAt: string | null;
};

export type PartnerStatusEventName =
  | 'verification_request.received'
  | 'applicant.invited'
  | 'applicant.viewed'
  | 'applicant.accepted'
  | 'applicant.declined'
  | 'payment.pending'
  | 'payment.completed'
  | 'verification.started'
  | 'additional_information.requested'
  | 'verification.completed'
  | 'verification.needs_review'
  | 'request.expired'
  | 'request.cancelled';

export type PartnerStatusEvent = {
  eventId: string;
  version: '2026-07-16';
  event: PartnerStatusEventName;
  partnerId: 'rental_district';
  partnerApplicationId: string;
  rentalPassportRequestId: string;
  rentalPassportApplicationId: string | null;
  status: PostApplicationVerificationStatus;
  timestamp: string;
  safeSummary: {
    applicantDisplayName: string;
    propertyReference: string;
    verificationPackage: VerificationRequestPackage;
    creditIncluded: boolean;
    unresolvedIssueCount: number;
    viewerLaunchReference: string | null;
  };
};

export type PostApplicationVerificationRequest = {
  id: string;
  invitationToken: string;
  partnerId: 'rental_district';
  partnerApplicationId: string;
  partnerPropertyReference: string;
  landlordOrganizationName: string;
  applicant: {
    legalName: string;
    preferredName: string;
    email: string;
    phone: string;
  };
  property: {
    address: string;
    desiredMoveIn: string;
    occupants: string;
    pets: string;
  };
  requestedAt: string;
  expiresAt: string;
  package: VerificationRequestPackage;
  checksIncluded: string[];
  creditIncluded: boolean;
  payerMode: VerificationRequestPayerMode;
  applicantPriceLabel: string | null;
  safeImportFields: ImportedApplicationField[];
  consents: VerificationConsentRecord[];
  status: PostApplicationVerificationStatus;
  paymentState: DemoPaymentState;
  linkedAccountMode: 'not_started' | 'existing_account' | 'new_account';
  importConfirmedAt: string | null;
  completedApplicationId: string | null;
  events: PartnerStatusEvent[];
};

export type InvitationValidation =
  | { status: 'valid'; request: PostApplicationVerificationRequest }
  | { status: 'missing_token' | 'invalid_token' | 'expired_token' | 'wrong_applicant' | 'demo_disabled'; message: string };
