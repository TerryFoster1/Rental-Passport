import type { PassportCompletenessState, PassportSectionKey } from '@/types/passport';

export type OnboardingStageKey =
  | 'account_contact'
  | 'applicant_household'
  | 'identity'
  | 'employment_income'
  | 'rental_history'
  | 'references'
  | 'credit'
  | 'supporting_documents'
  | 'consent_declarations'
  | 'review_verification_choice';

export type OnboardingStageStatus = PassportCompletenessState;

export type OnboardingStageDefinition = {
  key: OnboardingStageKey;
  title: string;
  description: string;
  sectionKey: PassportSectionKey | null;
  route: string;
  required: boolean;
  consentPurposes: ConsentPurpose[];
  requiredItems: string[];
};

export type OnboardingStageProgress = {
  id?: string;
  stage_key: OnboardingStageKey;
  section_key: PassportSectionKey | null;
  status: OnboardingStageStatus;
  required: boolean;
  progress: number;
  missing_items: string[];
  draft: Record<string, unknown>;
  completed_at: string | null;
  last_autosaved_at: string | null;
};

export type GuidedOnboardingSummary = {
  passportId: string;
  passportVersionId: string;
  stages: Array<OnboardingStageDefinition & { progressRecord: OnboardingStageProgress }>;
  overallProgress: number;
  requiredComplete: number;
  requiredTotal: number;
  nextStage: OnboardingStageDefinition & { progressRecord: OnboardingStageProgress };
};

export type ConsentPurpose =
  | 'identity_review'
  | 'employer_contact'
  | 'income_document_review'
  | 'previous_landlord_contact'
  | 'reference_contact'
  | 'credit_authorization'
  | 'storage_processing'
  | 'verified_summary_sharing'
  | 'landlord_document_viewing';

export type ConsentCaptureInput = {
  purpose: ConsentPurpose;
  consentTextVersion: string;
  consentTextSnapshot: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceMetadata?: Record<string, unknown>;
};

export type EvidenceDocumentType =
  | 'government_id_front'
  | 'government_id_back'
  | 'selfie'
  | 'pay_stub'
  | 'employment_letter'
  | 'lease'
  | 'rent_receipt'
  | 'rent_ledger'
  | 'credit_report'
  | 'supporting_document';

export type EvidenceDocumentStatus =
  | 'uploaded'
  | 'needs_review'
  | 'accepted'
  | 'rejected'
  | 'superseded'
  | 'soft_deleted';

export type EvidenceDocument = {
  id: string;
  owner_user_id: string;
  passport_id: string;
  passport_version_id: string;
  section_key: PassportSectionKey;
  document_type: EvidenceDocumentType | string;
  storage_bucket: string;
  storage_path: string;
  original_filename: string;
  content_type: string | null;
  size_bytes: number | null;
  sensitivity: 'low' | 'medium' | 'high' | 'restricted';
  status: EvidenceDocumentStatus;
  landlord_visible: boolean;
  download_allowed: boolean;
  created_at: string;
};

export type OutreachType = 'employer' | 'previous_landlord' | 'property_manager' | 'reference';
export type OutreachStatus = 'draft' | 'sent' | 'responded' | 'reminder_due' | 'expired' | 'escalated' | 'cancelled';

export type OutreachInvitationInput = {
  sectionKey: PassportSectionKey;
  outreachType: OutreachType;
  recipientName: string;
  recipientEmail: string;
  recipientOrganization?: string;
  companyDomain?: string;
  companyWebsite?: string;
  verificationCaseId?: string | null;
};

export type ManualCreditWorkflowStatus =
  | 'not_requested'
  | 'authorization_required'
  | 'payment_required'
  | 'authorized'
  | 'pending_provider_check'
  | 'report_received'
  | 'under_review'
  | 'verified'
  | 'needs_more_information'
  | 'expired'
  | 'refresh_requested'
  | 'unable_to_complete';

export type LandlordRequestInput = {
  applicationId: string;
  passportId: string;
  passportVersionId: string;
  tenantUserId: string;
  sectionKey: PassportSectionKey;
  requestType:
    | 'identity_confirmation'
    | 'credit_report'
    | 'updated_employment'
    | 'additional_rental_history'
    | 'another_reference'
    | 'reverification';
  message: string;
};

