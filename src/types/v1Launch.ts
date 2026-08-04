import type { PassportSectionKey } from './passport';

export type VerificationProductKey = 'rental_passport_verification' | 'verified_credit_check' | 'verified_passport_plus_credit';
export type VerificationPayer = 'tenant' | 'landlord';
export type PaymentState = 'not_started' | 'pending' | 'paid' | 'failed' | 'refunded';
export type VerificationPackageState =
  | 'not_requested'
  | 'tenant_authorization_required'
  | 'payment_required'
  | 'queued'
  | 'in_progress'
  | 'verified'
  | 'needs_more_information'
  | 'unable_to_verify'
  | 'needs_reverification'
  | 'expired';

export type CoreVerificationSectionKey = Exclude<PassportSectionKey, 'credit_report'>;

export type VerificationProductDefinition = {
  key: VerificationProductKey;
  label: string;
  priceCad: number;
  includesCorePassportVerification: boolean;
  includesVerifiedCreditCheck: boolean;
};

export type VerificationOrderDraft = {
  productKey: VerificationProductKey;
  payer: VerificationPayer;
  passportId: string;
  passportVersionId: string;
  tenantAuthorized: boolean;
  paymentState: PaymentState;
  packageState: VerificationPackageState;
};

export type BadgeEligibility = {
  canIssueOverallVerifiedBadge: boolean;
  missingCoreSections: CoreVerificationSectionKey[];
  creditVerifiedSeparately: boolean;
  label: 'Complete - Not Independently Verified' | 'Verification Pending' | 'Verified Rental Passport' | 'Needs Reverification';
};

export type OcrProviderCapability =
  | 'government_id'
  | 'pay_stub'
  | 'employment_letter'
  | 'offer_letter'
  | 'lease'
  | 'rent_receipt'
  | 'tenant_ledger'
  | 'credit_report'
  | 'supporting_document';

export type OcrProviderAdapter = {
  key: string;
  displayName: string;
  supportedDocuments: OcrProviderCapability[];
  mode: 'manual_placeholder' | 'api';
};

export type DocumentConsistencyFindingState =
  | 'consistent'
  | 'review_recommended'
  | 'inconsistency_found'
  | 'low_document_quality'
  | 'missing_required_evidence'
  | 'possible_duplicate'
  | 'possible_alteration_indicator'
  | 'unable_to_assess';

export type DocumentConsistencyFinding = {
  state: DocumentConsistencyFindingState;
  evidenceDocumentIds: string[];
  explanation: string;
  internalOnly: boolean;
};

export type V1LaunchGapStatus = 'ready' | 'partial' | 'blocked' | 'not_started';

export type V1LaunchGapItem = {
  sprint: string;
  status: V1LaunchGapStatus;
  evidence: string;
  blocker: string | null;
};
