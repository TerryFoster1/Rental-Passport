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

export type PassportVerificationState =
  | 'unverified'
  | 'pending_review'
  | 'under_review'
  | 'verified'
  | 'needs_more_information'
  | 'needs_reverification'
  | 'expired'
  | 'unable_to_verify';
export type PassportCompletenessState = 'missing' | 'incomplete' | 'complete';
export type ManualVerificationState =
  | 'not_verified'
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'needs_more_information'
  | 'needs_reverification'
  | 'expired'
  | 'unable_to_verify';

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
  | 'rental_history_needs_reverification'
  | 'references_draft_saved'
  | 'references_ready_for_review'
  | 'references_needs_reverification'
  | 'identity_draft_saved'
  | 'identity_document_uploaded'
  | 'identity_ready_for_review'
  | 'identity_needs_reverification'
  | 'credit_report_draft_saved'
  | 'credit_report_document_uploaded'
  | 'credit_report_ready_for_review'
  | 'credit_report_needs_reverification'
  | 'consent_recorded'
  | 'consent_withdrawn'
  | 'document_uploaded'
  | 'document_viewed'
  | 'outreach_invitation_sent'
  | 'outreach_response_received'
  | 'outreach_reminder_sent'
  | 'credit_authorized'
  | 'credit_provider_work_item_created'
  | 'landlord_information_requested'
  | 'reverification_required'
  | 'verification_status_updated'
  | 'phone_confirmation_recorded'
  | 'phone_confirmation_reset'
  | 'tenant_notification_created'
  | 'evidence_access_denied'
  | 'passport_shared'
  | 'invitation_sent'
  | 'landlord_access_created'
  | 'passport_viewed'
  | 'section_viewed'
  | 'application_saved'
  | 'application_accepted'
  | 'application_rejected'
  | 'application_archived'
  | 'share_revoked'
  | 'verification_case_created'
  | 'verification_case_opened'
  | 'verification_checklist_updated'
  | 'verification_note_added'
  | 'verification_information_requested'
  | 'verification_section_approved'
  | 'verification_section_rejected'
  | 'verification_section_escalated'
  | 'verification_fraud_review';

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
