import type { DocumentListItem } from '@/components/forms/DocumentList';

export type IdentityDocumentType = 'drivers_licence' | 'passport' | 'state_id' | 'permanent_resident_card' | 'other_government_id';

export type IdentityUploadKind = 'government_id_front' | 'government_id_back' | 'selfie';

export type IdentityVerificationRequestStatus = 'draft' | 'ready_for_review' | 'under_review' | 'verified' | 'needs_more_information' | 'needs_reverification' | 'expired';

export type IdentityFormData = {
  legal_first_name: string;
  middle_name: string;
  legal_last_name: string;
  preferred_name: string;
  date_of_birth: string;
  country: string;
  province_state: string;
  current_address: string;
  email: string;
  phone_number: string;
  id_document_type: IdentityDocumentType;
  consent_review_government_id: boolean;
  consent_review_selfie: boolean;
  consent_confirm_legal_identity: boolean;
  consent_store_verification_result: boolean;
  consent_share_identity_status: boolean;
};

export type IdentityProfile = IdentityFormData & {
  id: string;
  passport_id: string;
  passport_version_id: string;
  user_id: string;
  email_verified: boolean;
  phone_verification_status: 'manual_pending' | 'manually_confirmed' | 'not_started';
  verification_request_status: IdentityVerificationRequestStatus;
  created_at: string;
  updated_at: string;
};

export type IdentityDocument = DocumentListItem & {
  kind: string;
  uploadKind: IdentityUploadKind;
  storagePath: string;
};

export type IdentitySignal = {
  key: string;
  label: string;
  complete: boolean;
};

export type IdentityModuleState = {
  profile: IdentityProfile | null;
  documents: IdentityDocument[];
  signals: IdentitySignal[];
  status: IdentityVerificationRequestStatus;
};
