import type { DocumentListItem } from '@/components/forms/DocumentList';

export type CreditReportWorkflow = 'provider_request' | 'tenant_upload';

export type CreditProviderKey = 'singlekey' | 'frontlobby' | 'equifax' | 'transunion' | 'manual_review';

export type CreditVerificationRequestStatus = 'draft' | 'ready_for_review' | 'under_review' | 'verified' | 'needs_more_information' | 'needs_reverification' | 'expired';

export type CreditReportFormData = {
  workflow: CreditReportWorkflow;
  provider_key: CreditProviderKey;
  report_date: string;
  credit_score: string;
  credit_score_range: string;
  payment_history: string;
  collections: string;
  public_records: string;
  credit_utilization: string;
  bankruptcy: string;
  consumer_proposal: string;
  hard_inquiries: string;
  notes: string;
  consent_credit_authorization: boolean;
  consent_storage: boolean;
  consent_review: boolean;
  consent_landlord_sharing: boolean;
  consent_expiration: boolean;
};

export type CreditReportRecord = CreditReportFormData & {
  id: string;
  passport_id: string;
  passport_version_id: string;
  user_id: string;
  verification_request_status: CreditVerificationRequestStatus;
  report_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreditReportDocument = DocumentListItem & {
  storagePath: string;
};

export type CreditSignal = {
  key: string;
  label: string;
  complete: boolean;
};

export type CreditReportModuleState = {
  report: CreditReportRecord | null;
  documents: CreditReportDocument[];
  signals: CreditSignal[];
  status: CreditVerificationRequestStatus;
};
