import type { PassportSectionKey, PassportSectionStatus } from '@/types/passport';

export type VerificationCaseStatus = 'awaiting_review' | 'in_review' | 'awaiting_customer_response' | 'approved' | 'rejected' | 'escalated' | 'fraud_review';

export type VerificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type VerificationType =
  | 'identity'
  | 'employment'
  | 'rental_history'
  | 'references'
  | 'credit'
  | 'fraud'
  | 'missing_information'
  | 'reverification';

export type VerificationDecisionType = 'approve' | 'reject' | 'needs_more_information' | 'escalate' | 'fraud_review';

export type FraudFlagType = 'possible_fake_id' | 'possible_fake_employer' | 'possible_fake_landlord' | 'possible_altered_document' | 'possible_duplicate_account' | 'identity_mismatch' | 'other';

export type VerificationCase = {
  id: string;
  passport_id: string;
  passport_version_id: string;
  applicant_user_id: string;
  applicant_name: string;
  passport_number: string;
  section_key: PassportSectionKey;
  verification_type: VerificationType;
  status: VerificationCaseStatus;
  priority: VerificationPriority;
  assigned_reviewer_id: string | null;
  assigned_reviewer_name: string | null;
  submitted_at: string;
  updated_at: string;
};

export type VerificationChecklistItem = {
  id: string;
  verification_case_id: string;
  label: string;
  checked: boolean;
  required: boolean;
  created_at: string;
};

export type VerificationNote = {
  id: string;
  verification_case_id: string;
  author_user_id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export type VerificationDecision = {
  id: string;
  verification_case_id: string;
  reviewer_user_id: string;
  decision: VerificationDecisionType;
  reason: string;
  created_at: string;
};

export type FraudFlag = {
  id: string;
  verification_case_id: string;
  flag_type: FraudFlagType;
  description: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
};

export type CustomerInformationRequest = {
  id: string;
  verification_case_id: string;
  requested_item: string;
  message: string;
  status: 'open' | 'fulfilled' | 'cancelled';
  created_at: string;
};

export type ReviewerActivity = {
  id: string;
  verification_case_id: string;
  actor_user_id: string | null;
  event_type: string;
  description: string;
  created_at: string;
};

export type VerificationCaseDetail = {
  case: VerificationCase;
  checklist: VerificationChecklistItem[];
  notes: VerificationNote[];
  decisions: VerificationDecision[];
  fraudFlags: FraudFlag[];
  informationRequests: CustomerInformationRequest[];
  activity: ReviewerActivity[];
};

export type VerificationQueueFilters = {
  search: string;
  verificationType: 'all' | VerificationType;
  status: 'all' | VerificationCaseStatus;
  priority: 'all' | VerificationPriority;
};

export type VerificationDashboardMetrics = {
  todaysQueue: number;
  awaitingReview: number;
  awaitingCustomerResponse: number;
  urgentCases: number;
  fraudReview: number;
  completedToday: number;
};

export type DecisionInput = {
  decision: VerificationDecisionType;
  reason: string;
};

export type SectionDecisionMap = Record<VerificationDecisionType, PassportSectionStatus>;
