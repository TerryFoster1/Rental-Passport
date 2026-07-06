export type ReferenceCategory = 'previous_landlord' | 'professional' | 'personal' | 'property_manager' | 'character_reference' | 'other';

export type ReferenceRelationship = 'employer' | 'manager' | 'coworker' | 'previous_landlord' | 'property_manager' | 'friend' | 'family' | 'teacher' | 'client' | 'other';

export type ReferenceContactMethod = 'email' | 'phone' | 'either';

export type ReferenceVerificationRequestStatus = 'draft' | 'ready_for_review' | 'under_review' | 'verified' | 'needs_more_information' | 'needs_reverification' | 'expired';

export type ReferenceFormData = {
  id?: string;
  local_id: string;
  category: ReferenceCategory;
  reference_name: string;
  relationship: ReferenceRelationship;
  company: string;
  email: string;
  phone: string;
  preferred_contact_method: ReferenceContactMethod;
  years_known: string;
  comments: string;
  country: string;
  province_state: string;
  consent_contact_reference: boolean;
  consent_verify_information: boolean;
  consent_store_results: boolean;
  consent_share_summary: boolean;
};

export type ReferenceRecord = ReferenceFormData & {
  id: string;
  passport_id: string;
  passport_version_id: string;
  user_id: string;
  verification_request_status: ReferenceVerificationRequestStatus;
  created_at: string;
  updated_at: string;
};

export type ReferenceSignal = {
  key: string;
  label: string;
  complete: boolean;
};

export type ReferencesModuleState = {
  references: ReferenceRecord[];
  signals: ReferenceSignal[];
  status: ReferenceVerificationRequestStatus;
};
