export type OntarioLtbOrderSearchCapabilityState =
  | 'not_requested'
  | 'consent_required'
  | 'queued'
  | 'searching'
  | 'possible_match'
  | 'no_match_found'
  | 'manual_review_required'
  | 'match_confirmed'
  | 'match_rejected'
  | 'applicant_disputed'
  | 'corrected'
  | 'source_unavailable'
  | 'expired';

export type OntarioLtbMatchStatus =
  | 'strong_confirmed_match'
  | 'probable_match_requiring_manual_review'
  | 'ambiguous_possible_match'
  | 'rejected_mismatch';

export type OntarioLtbMatchReasonCode =
  | 'exact_full_name_plus_matching_rental_address'
  | 'exact_name_without_corrob'
  | 'similar_name_without_corrob'
  | 'similar_name_with_matching_address'
  | 'similar_name_with_conflicting_address'
  | 'exact_name_with_conflicting_address'
  | 'record_names_applicant_as_landlord_or_agent'
  | 'record_names_applicant_as_tenant_or_occupant'
  | 'record_names_applicant_as_coop_member'
  | 'order_outside_declared_tenancy_period'
  | 'case_number_supplied_by_applicant'
  | 'manual_review_required'
  | 'no_candidate_record_found';

export type OntarioLtbApplicantRole =
  | 'tenant'
  | 'former_tenant'
  | 'sub_tenant'
  | 'occupant'
  | 'landlord'
  | 'landlord_agent'
  | 'coop_member'
  | 'coop'
  | 'unknown';

export type OntarioLtbSourceCoverage = {
  sourceName: 'LTB Order Catalogue';
  publisher: 'Ontario Ministry of the Attorney General';
  datasetUrl: string;
  resourceUrl: string;
  licence: 'Open Government Licence - Ontario';
  coverageStart: string;
  coverageEnd: string;
  publicationLag: string;
  retrievedAt: string;
  limitations: string[];
};

export type OntarioLtbConsentRecord = {
  consentId: string;
  consentVersion: string;
  consentedAt: string;
  applicationId: string;
  passportId: string;
  applicantUserId: string;
  applicantLegalName: string;
  purpose: 'official_ontario_ltb_order_search';
  requestingOrganizationId: string;
  sourceCoverage: OntarioLtbSourceCoverage;
  expiresAt: string;
};

export type OntarioLtbSearchRequest = {
  requestId: string;
  type: 'ontario_ltb_order_search';
  applicationId: string;
  passportId: string;
  applicantUserId: string;
  requestingOrganizationId: string;
  consentId: string;
};

export type OntarioLtbAuthorizationResult =
  | { authorized: true; reason: 'authorized' }
  | {
      authorized: false;
      reason:
        | 'missing_consent'
        | 'consent_expired'
        | 'consent_wrong_purpose'
        | 'application_scope_mismatch'
        | 'passport_scope_mismatch'
        | 'applicant_scope_mismatch'
        | 'organization_scope_mismatch'
        | 'consent_reference_mismatch';
    };

export type OntarioLtbSourceRecord = {
  officialSource: 'Ontario Data Catalogue';
  sourceRecordUrl: string;
  sourceDatasetVersionDate: string;
  retrievalTimestamp: string;
  fileNumber: string;
  applications: string;
  applicationType: string;
  rentalUnitAddress: string | null;
  complexAddress: string | null;
  landlordName: string | null;
  landlordAgentName: string | null;
  tenantName: string | null;
  formerTenantName: string | null;
  subTenantName: string | null;
  occupantNames: string | null;
  coopMemberName: string | null;
  coopName: string | null;
  documentType: string;
  orderDate: string;
  documentId: string;
  contentDownloadUrl: string;
  confidentialityState: 'published_redacted' | 'excluded_confidential_order' | 'unknown';
};

export type OntarioLtbApplicantMatchInput = {
  fullLegalName: string;
  previousLegalNames?: string[];
  currentAddress?: string | null;
  priorAddresses?: string[];
  declaredTenancyStart?: string | null;
  declaredTenancyEnd?: string | null;
  suppliedCaseNumber?: string | null;
};

export type OntarioLtbMatchAssessment = {
  status: OntarioLtbMatchStatus;
  applicantRole: OntarioLtbApplicantRole;
  reasonCodes: OntarioLtbMatchReasonCode[];
  requiresManualReview: boolean;
  internalConfidenceLabel: 'strong' | 'probable' | 'ambiguous' | 'rejected';
};

export type OntarioLtbDisputeState =
  | 'not_disputed'
  | 'applicant_disputed'
  | 'correction_requested'
  | 'under_manual_review'
  | 'corrected'
  | 'resolved';

export type OntarioLtbNormalizedOrderResult = {
  id: string;
  capabilityState: OntarioLtbOrderSearchCapabilityState;
  sourceRecord: OntarioLtbSourceRecord | null;
  match: OntarioLtbMatchAssessment | null;
  checkedAt: string;
  coverageStatement: string;
  shortFactualSummary: string;
  monetaryAmountExplicitlyOrdered: string | null;
  possessionOrTerminationOutcome: string | null;
  dismissalOrWithdrawalStatus: string | null;
  amendmentReviewStayAppealIndicators: string[];
  supersededOrReplacedStatus: string | null;
  documentHashReference: string | null;
  reviewerUserId: string | null;
  reviewedAt: string | null;
  disputeState: OntarioLtbDisputeState;
  applicantDisclosureSummary: string | null;
  internalReviewerNotes?: string | null;
};

export type OntarioLtbResultRevisionInput = {
  revisionType: 'amended' | 'reviewed' | 'stayed' | 'reconsidered' | 'appealed' | 'replaced' | 'set_aside' | 'corrected';
  sourceRecord: OntarioLtbSourceRecord;
  reviewerUserId: string;
  reviewedAt: string;
  summary: string;
};

export type OntarioLtbAuditEvent = {
  id: string;
  eventType:
    | 'ltb_search_requested'
    | 'ltb_search_authorized'
    | 'ltb_search_denied'
    | 'ltb_search_executed'
    | 'ltb_result_reviewed'
    | 'ltb_result_revised'
    | 'ltb_result_disputed'
    | 'ltb_result_disclosed';
  applicationId: string;
  passportId: string;
  applicantUserId: string;
  requestingOrganizationId: string;
  consentId: string | null;
  actorId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type RentalDistrictLtbVerificationStatus =
  | 'pending'
  | 'no_match_found'
  | 'possible_match_reviewing'
  | 'verified_record_found'
  | 'applicant_disputed'
  | 'unavailable'
  | 'expired';

export type RentalDistrictLtbVerificationPayload = {
  type: 'ontario_ltb_order_search';
  status: RentalDistrictLtbVerificationStatus;
  checked_at: string;
  coverage_statement: string;
  verified_result_summary: string;
  official_source_references: Array<{
    source: string;
    url: string;
    file_number: string;
    document_id: string;
    order_date: string;
  }>;
  applicant_role_in_proceeding: OntarioLtbApplicantRole | null;
  review_dispute_status: OntarioLtbDisputeState;
  expiration_recheck_date: string;
  reason_codes_safe_for_landlord_display: OntarioLtbMatchReasonCode[];
  disclaimer: string;
};
