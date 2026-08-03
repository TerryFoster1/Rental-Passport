import type {
  OntarioLtbApplicantMatchInput,
  OntarioLtbApplicantRole,
  OntarioLtbConsentRecord,
  OntarioLtbMatchAssessment,
  OntarioLtbMatchReasonCode,
  OntarioLtbNormalizedOrderResult,
  OntarioLtbOrderSearchCapabilityState,
  OntarioLtbSourceCoverage,
  OntarioLtbSourceRecord,
  RentalDistrictLtbVerificationPayload,
  RentalDistrictLtbVerificationStatus,
} from '../types/ltbOrderSearch';

export const ONTARIO_LTB_ORDER_SEARCH_CAPABILITY = 'ontario_ltb_order_search' as const;

export const ONTARIO_LTB_SEARCH_DISCLAIMER =
  'Rental Passport reports available official records and possible identity matches. It does not provide legal advice or an automatic tenancy recommendation.';

export const ONTARIO_LTB_CAPABILITY_STATES: OntarioLtbOrderSearchCapabilityState[] = [
  'not_requested',
  'consent_required',
  'queued',
  'searching',
  'possible_match',
  'no_match_found',
  'manual_review_required',
  'match_confirmed',
  'match_rejected',
  'applicant_disputed',
  'corrected',
  'source_unavailable',
  'expired',
];

export function getOntarioLtbSearchReadiness(consent: OntarioLtbConsentRecord | null, now = new Date()): OntarioLtbOrderSearchCapabilityState {
  if (!consent) return 'consent_required';
  if (new Date(consent.expiresAt).getTime() <= now.getTime()) return 'expired';
  return 'queued';
}

export function createOntarioLtbCoverageStatement(coverage: OntarioLtbSourceCoverage, checkedAt = coverage.retrievedAt): string {
  return `No matching record found means only that no matching record was found in the available official Ontario LTB final-order sources searched as of ${checkedAt}. Current catalogue coverage reviewed: ${coverage.coverageStart} to ${coverage.coverageEnd}. Known limitations: ${coverage.limitations.join('; ')}.`;
}

export function assessOntarioLtbOrderMatch(record: OntarioLtbSourceRecord, applicant: OntarioLtbApplicantMatchInput): OntarioLtbMatchAssessment {
  const candidateNames = applicantNames(applicant);
  const parties = collectRecordParties(record);
  const matchedParty = parties.find((party) => candidateNames.some((name) => namesEqual(name, party.name)));
  const similarParty = matchedParty ?? parties.find((party) => candidateNames.some((name) => namesSimilar(name, party.name)));
  const recordAddress = record.rentalUnitAddress ?? record.complexAddress;
  const applicantAddresses = [applicant.currentAddress, ...(applicant.priorAddresses ?? [])].filter(Boolean) as string[];
  const addressMatches = recordAddress ? applicantAddresses.some((address) => addressesSimilar(recordAddress, address)) : false;
  const addressConflicts = Boolean(recordAddress && applicantAddresses.length > 0 && !addressMatches);
  const caseNumberMatches = Boolean(applicant.suppliedCaseNumber && applicant.suppliedCaseNumber === record.fileNumber);
  const outsideTenancyPeriod = isOutsideDeclaredTenancy(record.orderDate, applicant);
  const reasonCodes: OntarioLtbMatchReasonCode[] = [];

  if (!similarParty) {
    return {
      status: 'rejected_mismatch',
      applicantRole: 'unknown',
      reasonCodes: ['no_candidate_record_found'],
      requiresManualReview: false,
      internalConfidenceLabel: 'rejected',
    };
  }

  const exactName = Boolean(matchedParty);
  const role = similarParty.role;

  if (role === 'landlord' || role === 'landlord_agent') reasonCodes.push('record_names_applicant_as_landlord_or_agent');
  if (role === 'tenant' || role === 'former_tenant' || role === 'sub_tenant' || role === 'occupant') reasonCodes.push('record_names_applicant_as_tenant_or_occupant');
  if (role === 'coop_member') reasonCodes.push('record_names_applicant_as_coop_member');
  if (caseNumberMatches) reasonCodes.push('case_number_supplied_by_applicant');
  if (outsideTenancyPeriod) reasonCodes.push('order_outside_declared_tenancy_period');

  if (exactName && addressMatches) {
    reasonCodes.push('exact_full_name_plus_matching_rental_address');
    return {
      status: outsideTenancyPeriod ? 'probable_match_requiring_manual_review' : 'strong_confirmed_match',
      applicantRole: role,
      reasonCodes,
      requiresManualReview: outsideTenancyPeriod || role === 'landlord' || role === 'landlord_agent',
      internalConfidenceLabel: outsideTenancyPeriod ? 'probable' : 'strong',
    };
  }

  if (exactName && addressConflicts) {
    reasonCodes.push('exact_name_with_conflicting_address');
    return {
      status: 'rejected_mismatch',
      applicantRole: role,
      reasonCodes,
      requiresManualReview: false,
      internalConfidenceLabel: 'rejected',
    };
  }

  if (!exactName && addressMatches) {
    reasonCodes.push('similar_name_with_matching_address', 'manual_review_required');
    return {
      status: 'probable_match_requiring_manual_review',
      applicantRole: role,
      reasonCodes,
      requiresManualReview: true,
      internalConfidenceLabel: 'probable',
    };
  }

  if (!exactName && addressConflicts) {
    reasonCodes.push('similar_name_with_conflicting_address');
    return {
      status: 'rejected_mismatch',
      applicantRole: role,
      reasonCodes,
      requiresManualReview: false,
      internalConfidenceLabel: 'rejected',
    };
  }

  reasonCodes.push(exactName ? 'exact_name_without_corrob' : 'similar_name_without_corrob', 'manual_review_required');
  return {
    status: 'ambiguous_possible_match',
    applicantRole: role,
    reasonCodes,
    requiresManualReview: true,
    internalConfidenceLabel: 'ambiguous',
  };
}

export function toRentalDistrictLtbVerificationPayload(
  result: OntarioLtbNormalizedOrderResult,
  expirationRecheckDate: string,
): RentalDistrictLtbVerificationPayload {
  return {
    type: ONTARIO_LTB_ORDER_SEARCH_CAPABILITY,
    status: toRentalDistrictStatus(result),
    checked_at: result.checkedAt,
    coverage_statement: result.coverageStatement,
    verified_result_summary: result.shortFactualSummary,
    official_source_references: result.sourceRecord
      ? [
          {
            source: result.sourceRecord.officialSource,
            url: result.sourceRecord.sourceRecordUrl,
            file_number: result.sourceRecord.fileNumber,
            document_id: result.sourceRecord.documentId,
            order_date: result.sourceRecord.orderDate,
          },
        ]
      : [],
    applicant_role_in_proceeding: result.match?.applicantRole ?? null,
    review_dispute_status: result.disputeState,
    expiration_recheck_date: expirationRecheckDate,
    reason_codes_safe_for_landlord_display: result.match?.reasonCodes ?? [],
    disclaimer: ONTARIO_LTB_SEARCH_DISCLAIMER,
  };
}

export function canReleaseOntarioLtbResultToPartner(result: OntarioLtbNormalizedOrderResult): boolean {
  if (result.disputeState === 'applicant_disputed' || result.disputeState === 'correction_requested' || result.disputeState === 'under_manual_review') return false;
  if (result.capabilityState === 'manual_review_required' || result.capabilityState === 'possible_match') return false;
  return result.capabilityState === 'no_match_found' || result.capabilityState === 'match_confirmed' || result.capabilityState === 'match_rejected' || result.capabilityState === 'corrected';
}

function toRentalDistrictStatus(result: OntarioLtbNormalizedOrderResult): RentalDistrictLtbVerificationStatus {
  if (result.capabilityState === 'expired') return 'expired';
  if (result.capabilityState === 'source_unavailable') return 'unavailable';
  if (result.disputeState === 'applicant_disputed' || result.disputeState === 'correction_requested' || result.disputeState === 'under_manual_review') return 'applicant_disputed';
  if (result.capabilityState === 'no_match_found') return 'no_match_found';
  if (result.capabilityState === 'match_confirmed' || result.capabilityState === 'corrected') return 'verified_record_found';
  if (result.capabilityState === 'possible_match' || result.capabilityState === 'manual_review_required') return 'possible_match_reviewing';
  return 'pending';
}

function applicantNames(applicant: OntarioLtbApplicantMatchInput): string[] {
  return [applicant.fullLegalName, ...(applicant.previousLegalNames ?? [])].filter(Boolean);
}

function collectRecordParties(record: OntarioLtbSourceRecord): Array<{ role: OntarioLtbApplicantRole; name: string }> {
  const parties: Array<{ role: OntarioLtbApplicantRole; name: string | null }> = [
    { role: 'landlord', name: record.landlordName },
    { role: 'landlord_agent', name: record.landlordAgentName },
    { role: 'tenant', name: record.tenantName },
    { role: 'former_tenant', name: record.formerTenantName },
    { role: 'sub_tenant', name: record.subTenantName },
    { role: 'occupant', name: record.occupantNames },
    { role: 'coop_member', name: record.coopMemberName },
    { role: 'coop', name: record.coopName },
  ];

  return parties.flatMap((party) =>
    splitNames(party.name).map((name) => ({
      role: party.role,
      name,
    })),
  );
}

function splitNames(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(/\s*(?:;|, and |\band\b|\/)\s*/i)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function namesEqual(left: string, right: string): boolean {
  return normalize(left) === normalize(right);
}

function namesSimilar(left: string, right: string): boolean {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return false;
  const aTokens = a.split(' ');
  const bTokens = b.split(' ');
  const aParts = new Set(aTokens);
  const bParts = new Set(bTokens);
  const overlap = [...aParts].filter((part) => bParts.has(part)).length;
  const lastNamesMatch = aTokens.at(-1) === bTokens.at(-1);
  const firstInitialsMatch = aTokens[0]?.[0] === bTokens[0]?.[0];
  if (lastNamesMatch && firstInitialsMatch) return true;
  return overlap >= Math.min(2, Math.min(aParts.size, bParts.size));
}

function addressesSimilar(left: string, right: string): boolean {
  const a = normalize(left);
  const b = normalize(right);
  return Boolean(a && b && (a.includes(b) || b.includes(a) || numericPrefix(a) === numericPrefix(b)));
}

function numericPrefix(value: string): string {
  return value.match(/\d+/)?.[0] ?? '';
}

function isOutsideDeclaredTenancy(orderDate: string, applicant: OntarioLtbApplicantMatchInput): boolean {
  const orderTime = new Date(orderDate).getTime();
  if (Number.isNaN(orderTime)) return false;
  const startTime = applicant.declaredTenancyStart ? new Date(applicant.declaredTenancyStart).getTime() : null;
  const endTime = applicant.declaredTenancyEnd ? new Date(applicant.declaredTenancyEnd).getTime() : null;
  if (startTime && orderTime < startTime) return true;
  if (endTime && orderTime > endTime) return true;
  return false;
}
