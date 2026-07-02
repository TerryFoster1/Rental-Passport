export type UserRole = 'tenant' | 'landlord' | 'property_manager' | 'verification_reviewer' | 'support' | 'compliance' | 'administrator';

export type AccountStatus = 'pending_email_verification' | 'active' | 'suspended' | 'closed';

export type VerificationStatus = 'unverified' | 'email_verified' | 'phone_pending' | 'manually_verified';

export type UserProfile = {
  id: string;
  legal_first_name: string | null;
  middle_name: string | null;
  legal_last_name: string | null;
  preferred_name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  province_state: string | null;
  language: string;
  timezone: string;
  account_status: AccountStatus;
  verification_status: VerificationStatus;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type ConsentRecord = {
  id: string;
  user_id: string;
  consent_type: string;
  consent_text_version: string;
  granted_at: string;
  revoked_at: string | null;
};
