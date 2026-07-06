export type PassportSectionKey = 'rental_history' | 'employment' | 'references' | 'credit_report' | 'identity_confirmation';

export type PassportSectionStatus =
  | 'not_started'
  | 'in_progress'
  | 'ready_for_review'
  | 'under_review'
  | 'verified'
  | 'needs_more_information'
  | 'needs_reverification'
  | 'expired';

export type PassportVerificationState = 'unverified' | 'pending_review' | 'verified' | 'needs_reverification';

export type PassportStatus = 'draft' | 'in_progress' | 'ready_for_review' | 'verified' | 'needs_reverification';

export type Passport = {
  id: string;
  owner_user_id: string;
  passport_number: string;
  status: PassportStatus;
  current_version_id: string | null;
  draft_version_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PassportVersion = {
  id: string;
  passport_id: string;
  version_number: number;
  status: 'draft' | 'current' | 'archived';
  created_at: string;
  updated_at: string;
};

export type PassportSection = {
  key: PassportSectionKey;
  name: string;
  description: string;
  route: string;
  status: PassportSectionStatus;
  verification_state: PassportVerificationState;
  progress: number;
  last_updated_at: string | null;
  needs_reverification_at: string | null;
};

export type PassportActivityEvent =
  | 'passport_created'
  | 'passport_version_created'
  | 'section_started'
  | 'section_updated'
  | 'passport_progress_changed'
  | 'employment_draft_saved'
  | 'employment_document_uploaded'
  | 'employment_ready_for_review'
  | 'employment_needs_reverification'
  | 'rental_history_draft_saved'
  | 'rental_history_document_uploaded'
  | 'rental_history_ready_for_review'
  | 'rental_history_needs_reverification';

export type PassportActivity = {
  id: string;
  passport_id: string;
  actor_user_id: string | null;
  event_type: PassportActivityEvent;
  description: string;
  visibility: 'internal' | 'tenant' | 'landlord';
  created_at: string;
};

export type PassportSummary = {
  passport: Passport;
  currentVersion: PassportVersion;
  draftVersion: PassportVersion;
  sections: PassportSection[];
  activity: PassportActivity[];
  progress: {
    overall: number;
    completeSections: number;
    verifiedSections: number;
    missingSections: number;
    needsReverificationSections: number;
  };
};
