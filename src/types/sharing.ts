import type { PassportSectionKey } from '@/types/passport';

export type PassportShareStatus = 'active' | 'revoked' | 'expired';

export type LandlordApplicationStatus = 'new' | 'saved' | 'accepted' | 'rejected' | 'archived';

export type ShareAccessEvent =
  | 'passport_shared'
  | 'invitation_sent'
  | 'landlord_access_created'
  | 'passport_viewed'
  | 'section_viewed'
  | 'application_saved'
  | 'application_accepted'
  | 'application_rejected'
  | 'application_archived'
  | 'share_revoked';

export type PassportShare = {
  id: string;
  passport_id: string;
  passport_version_id: string;
  tenant_user_id: string;
  landlord_name: string;
  landlord_email: string;
  property_address: string | null;
  message: string | null;
  status: PassportShareStatus;
  expires_at: string;
  revoked_at: string | null;
  invitation_sent_at: string | null;
  created_at: string;
};

export type ShareInvitation = {
  token: string;
  share: PassportShare;
  invitationUrl: string;
};

export type ShareFormData = {
  passport_version_id: string;
  landlord_name: string;
  landlord_email: string;
  property_address: string;
  expires_at: string;
  message: string;
};

export type ShareAccessLog = {
  id: string;
  passport_share_id: string;
  landlord_application_id: string | null;
  actor_user_id: string | null;
  event_type: ShareAccessEvent;
  section_key: PassportSectionKey | null;
  description: string;
  created_at: string;
};

export type LandlordApplication = {
  id: string;
  passport_share_id: string;
  passport_id: string;
  passport_version_id: string;
  tenant_user_id: string;
  landlord_email: string;
  landlord_name: string;
  applicant_name: string;
  passport_number: string;
  completeness: number;
  verification_status: string;
  property_address: string | null;
  status: LandlordApplicationStatus;
  received_at: string;
  expires_at: string;
  last_viewed_at: string | null;
};

export type LandlordApplicationDetail = {
  application: LandlordApplication;
  passport: LandlordPassportPresentation;
  sections: LandlordPassportSection[];
  informationRequests: LandlordInformationRequest[];
  accessLogs: ShareAccessLog[];
};

export type LandlordPassportCompletenessState =
  | 'Missing'
  | 'Incomplete'
  | 'Provided'
  | 'Under Review'
  | 'Verified'
  | 'Needs Reverification'
  | 'Expired';

export type LandlordPassportVerificationState =
  | 'Not Verified'
  | 'Partially Verified'
  | 'Under Review'
  | 'Verified'
  | 'Needs Reverification'
  | 'Expired';

export type LandlordPassportPresentation = {
  displayName: string;
  propertyAddress: string;
  applicationDate: string;
  passportId: string;
  expiresAt: string;
  completenessPercent: number;
  completenessMessage: string;
  verificationState: LandlordPassportVerificationState;
  verificationMessage: string;
  isPaidVerified: boolean;
  downloadLabels: string[];
};

export type LandlordPassportSection = {
  key: PassportSectionKey;
  name: string;
  route: string;
  completenessStatus: LandlordPassportCompletenessState;
  verificationState: LandlordPassportVerificationState;
  progress: number;
  summary: string;
  suppliedInformation: Array<{ label: string; value: string }>;
  permittedDocuments: Array<{ name: string; status: string; access: string }>;
  verificationExplanation: string;
  lastUpdatedAt: string | null;
  verificationDate: string | null;
  expiresAt: string | null;
  requestActionLabel: string;
};

export type LandlordInformationRequest = {
  id: string;
  landlord_application_id: string;
  section_key: PassportSectionKey;
  requested_item: string;
  message: string;
  status: 'requested' | 'resolved';
  created_at: string;
};

export type SecureInviteState =
  | { status: 'valid'; share: PassportShare }
  | { status: 'missing_token' | 'invalid' | 'expired' | 'revoked'; message: string };
