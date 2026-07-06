import type { DocumentListItem } from '@/components/forms/DocumentList';

export type RentalRelationshipType = 'landlord' | 'property_manager' | 'building_manager' | 'leasing_office' | 'other';

export type RentalHistoryDocumentKind = 'lease_agreement' | 'rent_receipt' | 'tenant_ledger' | 'move_in_out_document' | 'landlord_letter' | 'rent_payment_proof' | 'other';

export type RentalHistoryVerificationRequestStatus = 'draft' | 'ready_for_review' | 'under_review' | 'verified' | 'needs_more_information' | 'needs_reverification' | 'expired';

export type RentalHistoryRecordForm = {
  id?: string;
  local_id: string;
  property_address: string;
  unit_number: string;
  city: string;
  province_state: string;
  country: string;
  postal_code: string;
  move_in_date: string;
  move_out_date: string;
  is_current_residence: boolean;
  monthly_rent: string;
  manager_name: string;
  manager_email: string;
  manager_phone: string;
  relationship_type: RentalRelationshipType;
  reason_for_leaving: string;
  consent_contact_manager: boolean;
  consent_review_documents: boolean;
  consent_use_in_passport: boolean;
  consent_share_summary: boolean;
};

export type RentalHistoryRecord = RentalHistoryRecordForm & {
  id: string;
  passport_id: string;
  passport_version_id: string;
  user_id: string;
  verification_request_status: RentalHistoryVerificationRequestStatus;
  created_at: string;
  updated_at: string;
};

export type RentalHistoryDocument = DocumentListItem & {
  rentalRecordId: string;
  storagePath: string;
};

export type RentalHistorySignal = {
  key: string;
  label: string;
  complete: boolean;
};

export type RentalHistoryModuleState = {
  records: RentalHistoryRecord[];
  documents: RentalHistoryDocument[];
  signals: RentalHistorySignal[];
  status: RentalHistoryVerificationRequestStatus;
};
