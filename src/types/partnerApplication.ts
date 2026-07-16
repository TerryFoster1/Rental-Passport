export type PartnerId = 'rental_district';

export type PartnerViewerStatus =
  | 'valid'
  | 'missing_token'
  | 'invalid_token'
  | 'expired_token'
  | 'revoked_token'
  | 'wrong_partner'
  | 'wrong_scope'
  | 'wrong_application'
  | 'demo_disabled';

export type VerificationDisplayStatus =
  | 'Verified'
  | 'Verified directly'
  | 'Verified by document'
  | 'Self-declared'
  | 'Pending'
  | 'Unable to verify'
  | 'Needs review'
  | 'Expired'
  | 'Missing';

export type PartnerViewerTokenSession = {
  tokenId: string;
  partnerId: PartnerId | 'unknown_partner';
  applicationId: string;
  landlordUserId: string;
  scopes: string[];
  expiresAt: string;
  revokedAt: string | null;
  origin: string;
  mode: 'embed' | 'new_tab';
};

export type PartnerViewerValidation =
  | { status: 'valid'; session: PartnerViewerTokenSession }
  | { status: Exclude<PartnerViewerStatus, 'valid'>; message: string };

export type PartnerApplicationIssue = {
  id: string;
  severity: 'info' | 'warning' | 'action_required';
  title: string;
  detail: string;
  owner: 'tenant' | 'reviewer' | 'landlord';
};

export type PartnerApplicationSection = {
  key: string;
  title: string;
  status: VerificationDisplayStatus;
  summary: string;
  lastUpdated: string;
  evidence: Array<{
    label: string;
    value: string;
    status: VerificationDisplayStatus;
  }>;
};

export type PartnerApplicationDocument = {
  id: string;
  name: string;
  category: string;
  uploadedAt: string;
  expiresAt: string | null;
  status: VerificationDisplayStatus;
  access: 'summary_only' | 'view_permitted' | 'download_permitted';
};

export type PartnerApplicationViewerData = {
  applicationId: string;
  rentalPassportAccountId: string;
  applicant: {
    legalName: string;
    preferredName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    currentAddress: string;
  };
  partner: {
    id: PartnerId;
    name: string;
    contextLabel: string;
    returnUrl: string;
  };
  property: {
    partnerPropertyReference: string;
    address: string;
    appliedAt: string;
    desiredMoveIn: string;
    leaseTerm: string;
    occupants: string;
    pets: string;
    smoking: string;
    parking: string;
    emergencyContact: string;
  };
  completeness: {
    label: string;
    percent: number;
    consentStatus: VerificationDisplayStatus;
    lastUpdated: string;
    unresolvedItems: number;
    missingItems: number;
  };
  statuses: Array<{
    label: string;
    status: VerificationDisplayStatus;
    detail: string;
  }>;
  sections: PartnerApplicationSection[];
  documents: PartnerApplicationDocument[];
  issues: PartnerApplicationIssue[];
  declarations: Array<{
    label: string;
    acceptedAt: string;
  }>;
  audit: Array<{
    label: string;
    timestamp: string;
    actor: string;
  }>;
};

export type PartnerSafeApplicationSummary = {
  application_id: string;
  rental_passport_account_id: string;
  applicant_display_name: string;
  partner_id: PartnerId;
  partner_property_reference: string;
  submitted_at: string;
  completeness_status: string;
  identity_status: VerificationDisplayStatus;
  employment_status: VerificationDisplayStatus;
  references_status: VerificationDisplayStatus;
  rental_history_status: VerificationDisplayStatus;
  credit_included: boolean;
  unresolved_issue_count: number;
  viewer_launch_path: string;
  current_application_state: 'submitted' | 'under_review' | 'information_requested' | 'withdrawn';
};
