import type { DocumentListItem } from '@/components/forms/DocumentList';

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'self_employed' | 'seasonal' | 'other';

export type EmploymentStatus = 'active' | 'probationary' | 'leave' | 'ended';

export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'annual' | 'other';

export type EmploymentDocumentKind = 'pay_stub' | 'employment_letter' | 'offer_letter' | 'bank_deposit_proof' | 'other';

export type EmploymentVerificationRequestStatus = 'draft' | 'ready_for_review' | 'under_review' | 'verified' | 'needs_more_information' | 'needs_reverification' | 'expired';

export type EmploymentFormData = {
  employer_name: string;
  employer_website: string;
  employer_email_domain: string;
  employer_contact_name: string;
  employer_contact_email: string;
  employer_contact_phone: string;
  job_title: string;
  employment_type: EmploymentType;
  employment_status: EmploymentStatus;
  start_date: string;
  annual_income: string;
  pay_frequency: PayFrequency;
  work_location: string;
  consent_contact_employer: boolean;
  consent_review_documents: boolean;
  consent_use_in_passport: boolean;
  consent_share_summary: boolean;
};

export type EmploymentRecord = EmploymentFormData & {
  id: string;
  passport_id: string;
  passport_version_id: string;
  user_id: string;
  verification_request_status: EmploymentVerificationRequestStatus;
  created_at: string;
  updated_at: string;
};

export type EmploymentDocument = DocumentListItem & {
  storagePath: string;
};

export type EmploymentSignal = {
  key: string;
  label: string;
  complete: boolean;
};

export type EmploymentModuleState = {
  record: EmploymentRecord | null;
  documents: EmploymentDocument[];
  signals: EmploymentSignal[];
  status: EmploymentVerificationRequestStatus;
};
