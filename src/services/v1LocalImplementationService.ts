import type {
  OntarioLtbApplicantMatchInput,
  OntarioLtbApplicantRole,
  OntarioLtbMatchAssessment,
  OntarioLtbMatchReasonCode,
  OntarioLtbNormalizedOrderResult,
  OntarioLtbSourceCoverage,
  OntarioLtbSourceRecord,
  RentalDistrictLtbVerificationPayload,
} from '../types/ltbOrderSearch';
import type { PassportSection, PassportSectionKey } from '../types/passport';
import type { EvidenceDocumentType, OutreachType } from '../types/phaseA';
import type { PaymentState, VerificationOrderDraft, VerificationPayer, VerificationProductKey } from '../types/v1Launch';

const CORE_VERIFICATION_SECTIONS: Exclude<PassportSectionKey, 'credit_report'>[] = [
  'identity_confirmation',
  'employment',
  'rental_history',
  'references',
];

const VERIFICATION_PRODUCTS = {
  rental_passport_verification: {
    key: 'rental_passport_verification',
    label: 'Verify Rental Passport',
    priceCad: 29,
    includesCorePassportVerification: true,
    includesVerifiedCreditCheck: false,
  },
  verified_credit_check: {
    key: 'verified_credit_check',
    label: 'Add Verified Credit Check',
    priceCad: 16,
    includesCorePassportVerification: false,
    includesVerifiedCreditCheck: true,
  },
  verified_passport_plus_credit: {
    key: 'verified_passport_plus_credit',
    label: 'Verified Passport + Credit',
    priceCad: 45,
    includesCorePassportVerification: true,
    includesVerifiedCreditCheck: true,
  },
} satisfies Record<VerificationProductKey, {
  key: VerificationProductKey;
  label: string;
  priceCad: number;
  includesCorePassportVerification: boolean;
  includesVerifiedCreditCheck: boolean;
}>;

const ONTARIO_LTB_SEARCH_DISCLAIMER =
  'Rental Passport reports available official records and possible identity matches. It does not provide legal advice or an automatic tenancy recommendation.';

export type LocalAuditEvent = {
  id: string;
  actorId: string | null;
  eventType: string;
  resourceType: string;
  resourceId: string;
  internalOnly: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type OcrProcessingState = 'queued' | 'processing' | 'completed' | 'failed' | 'unreadable' | 'needs_reviewer_correction';
export type OcrFieldKey =
  | 'employeeName'
  | 'employer'
  | 'payPeriod'
  | 'paymentDate'
  | 'grossPay'
  | 'netPay'
  | 'yearToDateIncome'
  | 'payFrequency'
  | 'tenantNames'
  | 'rentalAddress'
  | 'landlordOrManager'
  | 'tenancyDates'
  | 'monthlyRent'
  | 'signaturePresence'
  | 'leaseDate'
  | 'name'
  | 'dateOfBirth'
  | 'address'
  | 'expiry'
  | 'documentType';

export type OcrExtractedField = {
  key: OcrFieldKey;
  originalValue: string | null;
  correctedValue: string | null;
  confidence: number;
  sourcePage: number | null;
  state: 'extracted' | 'missing' | 'low_confidence' | 'corrected';
};

export type LocalOcrJob = {
  id: string;
  documentId: string;
  documentType: EvidenceDocumentType;
  state: OcrProcessingState;
  attempts: number;
  sourceText: string;
  fields: OcrExtractedField[];
  error: string | null;
  audit: LocalAuditEvent[];
  createdAt: string;
  updatedAt: string;
};

export type ConsistencyFindingState =
  | 'match'
  | 'minor_formatting_difference'
  | 'needs_review'
  | 'conflict'
  | 'missing'
  | 'low_confidence'
  | 'unable_to_parse';

export type ConsistencyFinding = {
  id: string;
  field: string;
  state: ConsistencyFindingState;
  applicantValue: string | null;
  evidenceValue: string | null;
  evidenceDocumentIds: string[];
  explanation: string;
  landlordVisibleSummary: string | null;
  resolved: boolean;
  resolutionReason: string | null;
  audit: LocalAuditEvent[];
};

export type LocalLtbCatalogue = {
  metadata: OntarioLtbSourceCoverage & {
    sourceVersion: string;
    publicationDate: string;
    staleDataWarning: string | null;
  };
  records: OntarioLtbSourceRecord[];
};

export type LocalPaymentOrder = VerificationOrderDraft & {
  id: string;
  beneficiaryPassportId: string;
  amountCad: number;
  currency: 'CAD';
  idempotencyKey: string;
  tenantAuthorizationState: 'not_requested' | 'requested' | 'authorized' | 'declined';
  cancellationReason: string | null;
  refundReadyMetadata: Record<string, string>;
  audit: LocalAuditEvent[];
};

export type VerificationCaseState = 'active' | 'pending_response' | 'needs_information' | 'verified' | 'unable_to_verify' | 'failed' | 'expired' | 'needs_reverification';
export type LocalVerificationCase = {
  id: string;
  packageId: string;
  sectionKey: PassportSectionKey | 'ontario_ltb' | 'document_consistency';
  state: VerificationCaseState;
  checklist: Array<{ key: string; label: string; complete: boolean; required: boolean }>;
  expiryDate: string | null;
  landlordSafeSummary: string | null;
  internalNotes: string[];
};

export type LocalVerificationPackage = {
  id: string;
  orderId: string;
  passportId: string;
  passportVersionId: string;
  productKey: VerificationProductKey;
  state: 'queued' | 'in_progress' | 'needs_information' | 'verified' | 'unable_to_verify' | 'expired';
  cases: LocalVerificationCase[];
  progress: number;
  overallBadge: ReturnType<typeof evaluateLocalVerifiedPassportBadgeEligibility>;
  audit: LocalAuditEvent[];
};

export type LocalOutreachInvitation = {
  id: string;
  verificationCaseId: string;
  passportId: string;
  passportVersionId: string;
  outreachType: OutreachType;
  recipientEmail: string;
  tokenHash: string;
  token: string;
  status: 'ready_to_send' | 'sent' | 'delivery_failed' | 'opened' | 'completed' | 'expired' | 'revoked';
  expiresAt: string;
  sendCount: number;
  renderedEmail: { subject: string; html: string };
  audit: LocalAuditEvent[];
};

export type LocalResponseResult =
  | { accepted: true; status: 'completed'; queueUpdate: 'reviewer_follow_up_required'; audit: LocalAuditEvent[] }
  | { accepted: false; status: 'modified_token' | 'expired' | 'revoked' | 'completed' | 'wrong_type' | 'consent_required'; audit: LocalAuditEvent[] };

export type ReviewerQueueKey =
  | 'Identity'
  | 'OCR Review'
  | 'Document Consistency'
  | 'Employment'
  | 'Employer Response Pending'
  | 'Rental History'
  | 'Previous Landlord Response Pending'
  | 'References'
  | 'LTB Search'
  | 'LTB Possible Match'
  | 'Applicant Dispute'
  | 'Credit Authorization'
  | 'Credit Provider Check'
  | 'Credit Review'
  | 'Needs More Information'
  | 'Reverification'
  | 'Escalation';

export const REQUIRED_REVIEWER_QUEUES: ReviewerQueueKey[] = [
  'Identity',
  'OCR Review',
  'Document Consistency',
  'Employment',
  'Employer Response Pending',
  'Rental History',
  'Previous Landlord Response Pending',
  'References',
  'LTB Search',
  'LTB Possible Match',
  'Applicant Dispute',
  'Credit Authorization',
  'Credit Provider Check',
  'Credit Review',
  'Needs More Information',
  'Reverification',
  'Escalation',
];

export function createLocalOcrJob(documentId: string, documentType: EvidenceDocumentType, sourceText: string, now = new Date()): LocalOcrJob {
  const base = {
    id: stableId('ocr', documentId, String(now.getTime())),
    documentId,
    documentType,
    state: 'processing' as OcrProcessingState,
    attempts: 1,
    sourceText,
    fields: [] as OcrExtractedField[],
    error: null as string | null,
    audit: [audit('system', 'ocr.job_created', 'ocr_job', documentId, { documentType })],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  if (!sourceText.trim()) {
    return {
      ...base,
      state: 'unreadable',
      error: 'No readable text was extracted from the fixture.',
      audit: [...base.audit, audit('system', 'ocr.unreadable', 'ocr_job', base.id, {})],
    };
  }

  const fields = parseDocumentFields(documentType, sourceText);
  const missingCritical = fields.filter((field) => field.state === 'missing').length;
  const lowConfidence = fields.filter((field) => field.state === 'low_confidence').length;
  return {
    ...base,
    state: missingCritical > 2 ? 'failed' : lowConfidence > 0 ? 'needs_reviewer_correction' : 'completed',
    fields,
    error: missingCritical > 2 ? 'Required fields could not be parsed from the local OCR fixture.' : null,
    audit: [...base.audit, audit('system', 'ocr.extraction_completed', 'ocr_job', base.id, { missingCritical, lowConfidence })],
  };
}

export function correctOcrField(job: LocalOcrJob, fieldKey: OcrFieldKey, correctedValue: string, reviewerId = 'local-reviewer'): LocalOcrJob {
  return {
    ...job,
    state: 'completed',
    fields: job.fields.map((field) =>
      field.key === fieldKey
        ? { ...field, correctedValue, state: 'corrected', confidence: Math.max(field.confidence, 0.95) }
        : field,
    ),
    audit: [...job.audit, audit(reviewerId, 'ocr.field_corrected', 'ocr_job', job.id, { fieldKey })],
    updatedAt: new Date().toISOString(),
  };
}

export function retryOcrJob(job: LocalOcrJob, replacementText: string): LocalOcrJob {
  const next = createLocalOcrJob(job.documentId, job.documentType, replacementText);
  return {
    ...next,
    id: job.id,
    attempts: job.attempts + 1,
    audit: [...job.audit, audit('system', 'ocr.retry_started', 'ocr_job', job.id, { nextAttempt: job.attempts + 1 }), ...next.audit],
  };
}

export function compareDocumentConsistency(input: {
  applicant: Record<string, string | number | null | undefined>;
  ocrJobs: LocalOcrJob[];
  referenceContacts?: Array<{ name: string; email: string }>;
}): ConsistencyFinding[] {
  const fields = flattenOcrFields(input.ocrJobs);
  const findings: ConsistencyFinding[] = [];
  findings.push(compareText('applicantLegalName', String(input.applicant.legalName ?? ''), firstValue(fields, ['name', 'employeeName', 'tenantNames']), input.ocrJobs));
  findings.push(compareText('employerName', String(input.applicant.employer ?? ''), firstValue(fields, ['employer']), input.ocrJobs));
  findings.push(compareText('rentalAddress', String(input.applicant.rentalAddress ?? ''), firstValue(fields, ['rentalAddress', 'address']), input.ocrJobs));
  findings.push(compareText('employmentDates', String(input.applicant.employmentStartDate ?? ''), firstValue(fields, ['payPeriod']), input.ocrJobs, true));
  findings.push(compareText('tenancyDates', String(input.applicant.tenancyDates ?? ''), firstValue(fields, ['tenancyDates']), input.ocrJobs, true));
  findings.push(compareMoney('incomeAmount', Number(input.applicant.monthlyIncome ?? 0), firstValue(fields, ['grossPay', 'yearToDateIncome']), input.ocrJobs));
  findings.push(compareText('payPeriod', String(input.applicant.payPeriod ?? ''), firstValue(fields, ['payPeriod']), input.ocrJobs, true));
  findings.push(compareText('creditReportIdentity', String(input.applicant.legalName ?? ''), firstValue(fields, ['name']), input.ocrJobs));
  findings.push(compareText('governmentIdAddress', String(input.applicant.currentAddress ?? ''), firstValue(fields, ['address']), input.ocrJobs));
  if (!input.referenceContacts || input.referenceContacts.length === 0) {
    findings.push(finding('referenceContactData', 'missing', null, null, [], 'Reference contact data is missing.', null));
  } else {
    findings.push(finding('referenceContactData', 'match', 'provided', `${input.referenceContacts.length} contacts`, [], 'Reference contact data is present.', 'Reference contact data provided.'));
  }
  return findings;
}

export function resolveConsistencyFinding(findingInput: ConsistencyFinding, reviewerId: string, reason: string): ConsistencyFinding {
  if (!reason.trim()) throw new Error('A reviewer resolution reason is required.');
  return {
    ...findingInput,
    resolved: true,
    resolutionReason: reason.trim(),
    audit: [...findingInput.audit, audit(reviewerId, 'consistency.finding_resolved', 'consistency_finding', findingInput.id, { state: findingInput.state })],
  };
}

export function importOntarioLtbCatalogueFromCsv(csv: string, metadata: LocalLtbCatalogue['metadata']): LocalLtbCatalogue {
  const rows = parseCsv(csv);
  const records = rows.map((row, index) => normalizeLtbCsvRow(row, metadata, index));
  const staleDataWarning = new Date(metadata.coverageEnd).getTime() < Date.now() - 1000 * 60 * 60 * 24 * 120
    ? 'Catalogue coverage is more than 120 days old and must be refreshed before production use.'
    : metadata.staleDataWarning;
  return { metadata: { ...metadata, staleDataWarning }, records };
}

export function searchLocalOntarioLtbCatalogue(catalogue: LocalLtbCatalogue, applicant: OntarioLtbApplicantMatchInput, now = new Date()): OntarioLtbNormalizedOrderResult[] {
  const coverageStatement = createLocalOntarioLtbCoverageStatement(catalogue.metadata, now.toISOString());
  const candidates = catalogue.records
    .map((record) => ({ record, match: assessLocalOntarioLtbOrderMatch(record, applicant) }))
    .filter(({ match }) => match.status !== 'rejected_mismatch');

  if (candidates.length === 0) {
    return [
      {
        id: stableId('ltb', applicant.fullLegalName, now.toISOString()),
        capabilityState: 'no_match_found',
        sourceRecord: null,
        match: null,
        checkedAt: now.toISOString(),
        coverageStatement,
        shortFactualSummary: 'No candidate record was found in the local official-source fixture. This is not proof of no LTB history.',
        monetaryAmountExplicitlyOrdered: null,
        possessionOrTerminationOutcome: null,
        dismissalOrWithdrawalStatus: null,
        amendmentReviewStayAppealIndicators: [],
        supersededOrReplacedStatus: null,
        documentHashReference: null,
        reviewerUserId: null,
        reviewedAt: null,
        disputeState: 'not_disputed',
        applicantDisclosureSummary: null,
      },
    ];
  }

  return candidates.map(({ record, match }) => ({
    id: stableId('ltb', record.fileNumber, applicant.fullLegalName),
    capabilityState: match.requiresManualReview ? 'manual_review_required' : 'match_confirmed',
    sourceRecord: record,
    match,
    checkedAt: now.toISOString(),
    coverageStatement,
    shortFactualSummary: match.requiresManualReview
      ? 'Possible official LTB order match requires manual reviewer confirmation.'
      : 'Official LTB order match confirmed by exact name plus corroborating address.',
    monetaryAmountExplicitlyOrdered: null,
    possessionOrTerminationOutcome: null,
    dismissalOrWithdrawalStatus: null,
    amendmentReviewStayAppealIndicators: [],
    supersededOrReplacedStatus: null,
    documentHashReference: record.contentDownloadUrl,
    reviewerUserId: match.requiresManualReview ? null : 'local-reviewer',
    reviewedAt: match.requiresManualReview ? null : now.toISOString(),
    disputeState: 'not_disputed',
    applicantDisclosureSummary: null,
  }));
}

export function createManualReviewCaseFromLtb(result: OntarioLtbNormalizedOrderResult): LocalVerificationCase {
  return {
    id: stableId('case-ltb', result.id),
    packageId: 'ltb-local-package',
    sectionKey: result.capabilityState === 'manual_review_required' ? 'ontario_ltb' : 'document_consistency',
    state: result.capabilityState === 'manual_review_required' ? 'active' : 'verified',
    checklist: [
      { key: 'linked_pdf_reviewed', label: 'Linked official PDF reviewed', complete: false, required: true },
      { key: 'identity_corrob', label: 'Name and address corroboration checked', complete: false, required: true },
      { key: 'coverage_disclosed', label: 'Source coverage disclosure included', complete: true, required: true },
    ],
    expiryDate: futureDate(90),
    landlordSafeSummary: result.capabilityState === 'manual_review_required' ? null : result.shortFactualSummary,
    internalNotes: [],
  };
}

export function createPaymentOrder(input: {
  productKey: VerificationProductKey;
  payer: VerificationPayer;
  passportId: string;
  passportVersionId: string;
  tenantAuthorized: boolean;
  idempotencyKey: string;
  existingOrders?: LocalPaymentOrder[];
}): LocalPaymentOrder {
  const duplicate = input.existingOrders?.find((order) => order.idempotencyKey === input.idempotencyKey);
  if (duplicate) return duplicate;
  const product = VERIFICATION_PRODUCTS[input.productKey];
  return {
    id: stableId('payment', input.idempotencyKey),
    productKey: input.productKey,
    payer: input.payer,
    passportId: input.passportId,
    beneficiaryPassportId: input.passportId,
    passportVersionId: input.passportVersionId,
    tenantAuthorized: input.tenantAuthorized,
    tenantAuthorizationState: input.tenantAuthorized ? 'authorized' : 'requested',
    paymentState: 'pending',
    packageState: 'not_requested',
    amountCad: product.priceCad,
    currency: 'CAD',
    idempotencyKey: input.idempotencyKey,
    cancellationReason: null,
    refundReadyMetadata: { productKey: input.productKey, payer: input.payer, passportVersionId: input.passportVersionId },
    audit: [audit('system', 'payment.order_created', 'payment_order', input.idempotencyKey, { productKey: input.productKey })],
  };
}

export function confirmMockPayment(order: LocalPaymentOrder, providerReference = 'mock_paid'): LocalPaymentOrder {
  if (runtimeIsProduction()) {
    return { ...order, paymentState: 'failed', audit: [...order.audit, audit('system', 'payment.provider_unavailable', 'payment_order', order.id, {})] };
  }
  return {
    ...order,
    paymentState: 'paid',
    audit: [...order.audit, audit('mock-payment-provider', 'payment.completed', 'payment_order', order.id, { providerReference })],
  };
}

export function cancelPaymentOrder(order: LocalPaymentOrder, reason: string): LocalPaymentOrder {
  return {
    ...order,
    paymentState: 'failed',
    cancellationReason: reason,
    audit: [...order.audit, audit('system', 'payment.cancelled', 'payment_order', order.id, { reason })],
  };
}

export function startVerificationPackage(order: LocalPaymentOrder, existingCases: LocalVerificationCase[] = []): LocalVerificationPackage {
  const readiness = getLocalVerificationOrderReadiness(order);
  if (readiness !== 'queued') throw new Error(`Verification cannot start: ${readiness}.`);
  const sections: Array<PassportSectionKey | 'ontario_ltb' | 'document_consistency'> = [
    'identity_confirmation',
    'employment',
    'rental_history',
    'references',
    'ontario_ltb',
    'document_consistency',
  ];
  if (VERIFICATION_PRODUCTS[order.productKey].includesVerifiedCreditCheck) sections.push('credit_report');
  const cases = sections.map((section) => {
    const existing = existingCases.find((item) => item.sectionKey === section && item.state === 'active');
    return existing ?? createVerificationCase(order, section);
  });
  return {
    id: stableId('verification-package', order.id, order.passportVersionId),
    orderId: order.id,
    passportId: order.passportId,
    passportVersionId: order.passportVersionId,
    productKey: order.productKey,
    state: 'in_progress',
    cases,
    progress: progressFromCases(cases),
    overallBadge: evaluateLocalVerifiedPassportBadgeEligibility(sectionsForCases(cases)),
    audit: [...order.audit, audit('system', 'verification.package_started', 'verification_package', order.id, { caseCount: cases.length })],
  };
}

export function updateVerificationCaseState(pkg: LocalVerificationPackage, caseId: string, state: VerificationCaseState, reason: string): LocalVerificationPackage {
  const cases = pkg.cases.map((item) =>
    item.id === caseId
      ? {
          ...item,
          state,
          landlordSafeSummary: state === 'verified' ? `${labelForSection(item.sectionKey)} verified by Rental Passport.` : item.landlordSafeSummary,
          internalNotes: [...item.internalNotes, reason],
        }
      : item,
  );
  return {
    ...pkg,
    cases,
    state: packageStateFromCases(cases),
    progress: progressFromCases(cases),
    overallBadge: evaluateLocalVerifiedPassportBadgeEligibility(sectionsForCases(cases)),
    audit: [...pkg.audit, audit('local-reviewer', 'verification.case_updated', 'verification_package', pkg.id, { caseId, state })],
  };
}

export function createLocalOutreach(input: {
  verificationCaseId: string;
  passportId: string;
  passportVersionId: string;
  outreachType: OutreachType;
  recipientEmail: string;
  tokenSeed: string;
  consentConfirmed: boolean;
}): LocalOutreachInvitation {
  const token = stableId('token', input.tokenSeed, input.verificationCaseId);
  const status = input.consentConfirmed ? 'ready_to_send' : 'revoked';
  const invitation: LocalOutreachInvitation = {
    id: stableId('outreach', input.verificationCaseId, input.recipientEmail),
    verificationCaseId: input.verificationCaseId,
    passportId: input.passportId,
    passportVersionId: input.passportVersionId,
    outreachType: input.outreachType,
    recipientEmail: input.recipientEmail.toLowerCase(),
    token,
    tokenHash: stableId('hash', token),
    status,
    expiresAt: futureDate(14),
    sendCount: 0,
    renderedEmail: renderOutreachEmail(input.outreachType, token),
    audit: [audit('system', 'outreach.created', 'verification_outreach', input.verificationCaseId, { outreachType: input.outreachType, status })],
  };
  return input.consentConfirmed ? sendLocalOutreach(invitation) : invitation;
}

export function sendLocalOutreach(invitation: LocalOutreachInvitation): LocalOutreachInvitation {
  if (runtimeIsProduction()) {
    return {
      ...invitation,
      status: 'delivery_failed',
      audit: [...invitation.audit, audit('system', 'email.provider_unavailable', 'verification_outreach', invitation.id, {})],
    };
  }
  if (invitation.status === 'completed' || invitation.status === 'revoked' || invitation.status === 'expired') return invitation;
  return {
    ...invitation,
    status: 'sent',
    sendCount: invitation.sendCount + 1,
    audit: [...invitation.audit, audit('local-email-provider', 'outreach.email_captured', 'verification_outreach', invitation.id, {})],
  };
}

export function submitLocalExternalResponse(input: {
  invitation: LocalOutreachInvitation;
  token: string;
  expectedType: OutreachType;
  now?: Date;
  declarationAccepted: boolean;
}): LocalResponseResult {
  const now = input.now ?? new Date();
  const auditBase = [audit('external-recipient', 'outreach.response_attempted', 'verification_outreach', input.invitation.id, {})];
  if (input.token !== input.invitation.token) return { accepted: false, status: 'modified_token', audit: auditBase };
  if (input.invitation.status === 'revoked') return { accepted: false, status: 'revoked', audit: auditBase };
  if (input.invitation.status === 'completed') return { accepted: false, status: 'completed', audit: auditBase };
  if (new Date(input.invitation.expiresAt).getTime() <= now.getTime()) return { accepted: false, status: 'expired', audit: auditBase };
  if (input.invitation.outreachType !== input.expectedType) return { accepted: false, status: 'wrong_type', audit: auditBase };
  if (!input.declarationAccepted) return { accepted: false, status: 'consent_required', audit: auditBase };
  return {
    accepted: true,
    status: 'completed',
    queueUpdate: 'reviewer_follow_up_required',
    audit: [...auditBase, audit('external-recipient', 'outreach.response_completed', 'verification_outreach', input.invitation.id, {})],
  };
}

export function reviewerQueuesForCases(cases: LocalVerificationCase[]): Record<ReviewerQueueKey, LocalVerificationCase[]> {
  return Object.fromEntries(REQUIRED_REVIEWER_QUEUES.map((queue) => [queue, cases.filter((item) => queueForCase(item) === queue)])) as Record<ReviewerQueueKey, LocalVerificationCase[]>;
}

export function applyReviewerAction(caseInput: LocalVerificationCase, action: 'assign' | 'reassign' | 'verify' | 'unable_to_verify' | 'escalate' | 'request_more_information' | 'set_expiry' | 'resolve_dispute', reason: string): LocalVerificationCase {
  if (!reason.trim()) throw new Error('Reviewer action reason is required.');
  if (action === 'verify' && caseInput.checklist.some((item) => item.required && !item.complete)) {
    throw new Error('Required checklist must be completed before verification.');
  }
  const nextState: Record<typeof action, VerificationCaseState> = {
    assign: 'active',
    reassign: 'active',
    verify: 'verified',
    unable_to_verify: 'unable_to_verify',
    escalate: 'active',
    request_more_information: 'needs_information',
    set_expiry: 'expired',
    resolve_dispute: 'active',
  };
  return {
    ...caseInput,
    state: nextState[action],
    expiryDate: action === 'verify' ? futureDate(365) : caseInput.expiryDate,
    landlordSafeSummary: action === 'verify' ? `${labelForSection(caseInput.sectionKey)} verified by Rental Passport.` : caseInput.landlordSafeSummary,
    internalNotes: [...caseInput.internalNotes, reason],
  };
}

export function createPurchaseUxState(input: { actor: VerificationPayer; productKey: VerificationProductKey; tenantAuthorized: boolean; paymentState: PaymentState }) {
  const product = VERIFICATION_PRODUCTS[input.productKey];
  const order: VerificationOrderDraft = {
    productKey: input.productKey,
    payer: input.actor,
    passportId: 'ux-passport',
    passportVersionId: 'ux-version',
    tenantAuthorized: input.tenantAuthorized,
    paymentState: input.paymentState,
    packageState: 'not_requested',
  };
  const readiness = getLocalVerificationOrderReadiness(order);
  return {
    title: product.label,
    priceLabel: `$${product.priceCad} CAD`,
    included: [
      product.includesCorePassportVerification ? 'Core Rental Passport verification' : null,
      product.includesVerifiedCreditCheck ? 'Verified credit check' : null,
      input.actor === 'landlord' ? 'Tenant authorization required before work begins' : null,
    ].filter(Boolean),
    status:
      readiness === 'tenant_authorization_required'
        ? 'Awaiting Tenant Authorization'
        : readiness === 'payment_required'
          ? 'Awaiting Payment'
          : 'Verification Started',
    productionAvailable: !runtimeIsProduction() || input.paymentState === 'paid',
  };
}

export function validateRentalDistrictContract(input: {
  partnerId: string;
  eventType: 'attach_passport' | 'invite_applicant' | 'retrieve_summary' | 'viewer_handoff' | 'request_information' | 'verification_update' | 'revocation' | 'expiry' | 'acceptance_handoff';
  payload: Record<string, unknown>;
  idempotencyKey: string;
}) {
  const errors: string[] = [];
  if (!input.partnerId) errors.push('partnerId is required');
  if (!input.idempotencyKey) errors.push('idempotencyKey is required');
  if (input.eventType === 'retrieve_summary' && 'rawDocuments' in input.payload) errors.push('Partner summaries must not include raw document payloads');
  if (input.eventType === 'viewer_handoff' && typeof input.payload.viewerLaunchPath !== 'string') errors.push('viewerLaunchPath is required');
  if (input.eventType === 'verification_update' && typeof input.payload.passportVersionId !== 'string') errors.push('passportVersionId is required');
  return {
    ok: errors.length === 0,
    errors,
    safeSummaryShape: {
      completeness: 'number',
      verificationStates: 'section-level factual states',
      expiry: 'ISO date',
      viewerLaunchPath: '/partner/application/:id',
      rawDocuments: 'excluded',
      internalNotes: 'excluded',
    },
  };
}

export function runLocalSecurityAssertions(input: {
  requesterRole: 'tenant' | 'landlord' | 'reviewer' | 'support';
  ownsPassport: boolean;
  hasShareGrant: boolean;
  tokenExpired: boolean;
  tokenRevoked: boolean;
  partnerSummary: Record<string, unknown>;
  paymentState: PaymentState;
  tenantConsent: boolean;
  attemptedDirectBadgeMutation: boolean;
}) {
  return {
    tenantIsolation: input.requesterRole !== 'tenant' || input.ownsPassport,
    landlordIsolation: input.requesterRole !== 'landlord' || input.hasShareGrant,
    reviewerCanVerify: input.requesterRole === 'reviewer',
    supportCannotVerify: input.requesterRole !== 'support',
    tokenValid: !input.tokenExpired && !input.tokenRevoked,
    noRawEvidenceInPartnerSummary: !('rawDocuments' in input.partnerSummary) && !('internalNotes' in input.partnerSummary),
    badgeMutationBlocked: !input.attemptedDirectBadgeMutation,
    consentRequired: input.tenantConsent,
    paymentRequired: input.paymentState === 'paid',
    demoModeDisabledByDefault: !runtimeIsProduction() || !runtimeIsPublicDemoEnabled(),
    signedAccessServiceRequired: input.hasShareGrant || input.requesterRole === 'reviewer',
  };
}

export function productionFailClosedState(credentials: {
  stripeConfigured: boolean;
  resendConfigured: boolean;
  supabaseConfigured: boolean;
  creditProviderConfigured: boolean;
}) {
  const available = credentials.stripeConfigured && credentials.resendConfigured && credentials.supabaseConfigured && credentials.creditProviderConfigured;
  return {
    canTakePayment: available,
    canSendEmail: credentials.resendConfigured && credentials.supabaseConfigured,
    canCreatePublicDocumentUrl: false,
    canIssueVerifiedBadgeFromFixture: false,
    message: available ? 'Provider-backed verification is available.' : 'Verification is temporarily unavailable until provider configuration is complete.',
    safeOperationalLog: { missing: Object.entries(credentials).filter(([, value]) => !value).map(([key]) => key) },
  };
}

function parseDocumentFields(documentType: EvidenceDocumentType, sourceText: string): OcrExtractedField[] {
  if (documentType === 'pay_stub') {
    return [
      field('employeeName', match(sourceText, /employee\s*name:\s*(.+)/i)),
      field('employer', match(sourceText, /employer:\s*(.+)/i)),
      field('payPeriod', match(sourceText, /pay\s*period:\s*(.+)/i)),
      field('paymentDate', match(sourceText, /payment\s*date:\s*(.+)/i)),
      field('grossPay', match(sourceText, /gross\s*pay:\s*\$?([0-9,.]+)/i)),
      field('netPay', match(sourceText, /net\s*pay:\s*\$?([0-9,.]+)/i)),
      field('yearToDateIncome', match(sourceText, /year[-\s]*to[-\s]*date\s*income:\s*\$?([0-9,.]+)/i)),
      field('payFrequency', match(sourceText, /pay\s*frequency:\s*(.+)/i)),
    ];
  }
  if (documentType === 'lease') {
    return [
      field('tenantNames', match(sourceText, /tenant(?:s)?:\s*(.+)/i)),
      field('rentalAddress', match(sourceText, /rental\s*address:\s*(.+)/i)),
      field('landlordOrManager', match(sourceText, /(?:landlord|property manager):\s*(.+)/i)),
      field('tenancyDates', match(sourceText, /tenancy\s*dates:\s*(.+)/i)),
      field('monthlyRent', match(sourceText, /monthly\s*rent:\s*\$?([0-9,.]+)/i)),
      field('signaturePresence', /signature/i.test(sourceText) ? 'signature present' : null),
      field('leaseDate', match(sourceText, /lease\s*date:\s*(.+)/i)),
    ];
  }
  if (documentType === 'government_id_front' || documentType === 'government_id_back') {
    return [
      field('name', match(sourceText, /name:\s*(.+)/i)),
      field('dateOfBirth', match(sourceText, /(?:date of birth|dob):\s*(.+)/i)),
      field('address', match(sourceText, /address:\s*(.+)/i)),
      field('expiry', match(sourceText, /expir(?:y|es):\s*(.+)/i)),
      field('documentType', match(sourceText, /document\s*type:\s*(.+)/i)),
    ];
  }
  if (documentType === 'credit_report') {
    return [field('name', match(sourceText, /name:\s*(.+)/i)), field('address', match(sourceText, /address:\s*(.+)/i))];
  }
  return [field('name', match(sourceText, /name:\s*(.+)/i))];
}

function getLocalVerificationOrderReadiness(order: VerificationOrderDraft): VerificationOrderDraft['packageState'] {
  if (!order.tenantAuthorized) return 'tenant_authorization_required';
  if (order.paymentState !== 'paid') return 'payment_required';
  return order.packageState === 'not_requested' ? 'queued' : order.packageState;
}

function evaluateLocalVerifiedPassportBadgeEligibility(sections: PassportSection[]) {
  const missingCoreSections = CORE_VERIFICATION_SECTIONS.filter((key) => {
    const section = sections.find((item) => item.key === key);
    return !section || section.status !== 'verified' || section.verification_state !== 'verified';
  });
  const credit = sections.find((section) => section.key === 'credit_report');
  const hasNeedsReverification = sections.some((section) => section.status === 'needs_reverification' || section.verification_state === 'needs_reverification');
  if (hasNeedsReverification) {
    return {
      canIssueOverallVerifiedBadge: false,
      missingCoreSections,
      creditVerifiedSeparately: Boolean(credit?.status === 'verified' && credit.verification_state === 'verified'),
      label: 'Needs Reverification' as const,
    };
  }
  if (missingCoreSections.length === 0) {
    return {
      canIssueOverallVerifiedBadge: true,
      missingCoreSections: [],
      creditVerifiedSeparately: Boolean(credit?.status === 'verified' && credit.verification_state === 'verified'),
      label: 'Verified Rental Passport' as const,
    };
  }
  const completeButUnverified = sections.every((section) => section.progress >= 100);
  return {
    canIssueOverallVerifiedBadge: false,
    missingCoreSections,
    creditVerifiedSeparately: Boolean(credit?.status === 'verified' && credit.verification_state === 'verified'),
    label: completeButUnverified ? 'Complete - Not Independently Verified' as const : 'Verification Pending' as const,
  };
}

function createLocalOntarioLtbCoverageStatement(coverage: LocalLtbCatalogue['metadata'], checkedAt: string): string {
  return `No matching record found means only that no matching record was found in the available official Ontario LTB final-order sources searched as of ${checkedAt}. Current catalogue coverage reviewed: ${coverage.coverageStart} to ${coverage.coverageEnd}. Known limitations: ${coverage.limitations.join('; ')}.`;
}

function assessLocalOntarioLtbOrderMatch(record: OntarioLtbSourceRecord, applicant: OntarioLtbApplicantMatchInput): OntarioLtbMatchAssessment {
  const candidateNames = [applicant.fullLegalName, ...(applicant.previousLegalNames ?? [])].filter(Boolean);
  const parties: Array<{ role: OntarioLtbApplicantRole; name: string }> = [
    ...splitNames(record.tenantName).map((name) => ({ role: 'tenant' as const, name })),
    ...splitNames(record.formerTenantName).map((name) => ({ role: 'former_tenant' as const, name })),
    ...splitNames(record.occupantNames).map((name) => ({ role: 'occupant' as const, name })),
    ...splitNames(record.landlordName).map((name) => ({ role: 'landlord' as const, name })),
    ...splitNames(record.landlordAgentName).map((name) => ({ role: 'landlord_agent' as const, name })),
  ];
  const matched = parties.find((party) => candidateNames.some((name) => normalize(name) === normalize(party.name)));
  const similar = matched ?? parties.find((party) => candidateNames.some((name) => namesSimilar(name, party.name)));
  const recordAddress = record.rentalUnitAddress ?? record.complexAddress;
  const addresses = [applicant.currentAddress, ...(applicant.priorAddresses ?? [])].filter(Boolean) as string[];
  const addressMatches = Boolean(recordAddress && addresses.some((address) => addressesSimilar(recordAddress, address)));
  const reasonCodes: OntarioLtbMatchReasonCode[] = [];

  if (!similar) {
    return {
      status: 'rejected_mismatch',
      applicantRole: 'unknown',
      reasonCodes: ['no_candidate_record_found'],
      requiresManualReview: false,
      internalConfidenceLabel: 'rejected',
    };
  }

  if (similar.role === 'landlord' || similar.role === 'landlord_agent') reasonCodes.push('record_names_applicant_as_landlord_or_agent');
  else reasonCodes.push('record_names_applicant_as_tenant_or_occupant');

  if (matched && addressMatches) {
    reasonCodes.push('exact_full_name_plus_matching_rental_address');
    return {
      status: 'strong_confirmed_match',
      applicantRole: similar.role,
      reasonCodes,
      requiresManualReview: similar.role === 'landlord' || similar.role === 'landlord_agent',
      internalConfidenceLabel: 'strong',
    };
  }
  if (addressMatches) {
    reasonCodes.push('similar_name_with_matching_address', 'manual_review_required');
    return {
      status: 'probable_match_requiring_manual_review',
      applicantRole: similar.role,
      reasonCodes,
      requiresManualReview: true,
      internalConfidenceLabel: 'probable',
    };
  }
  reasonCodes.push(matched ? 'exact_name_without_corrob' : 'similar_name_without_corrob', 'manual_review_required');
  return {
    status: 'ambiguous_possible_match',
    applicantRole: similar.role,
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
    type: 'ontario_ltb_order_search',
    status:
      result.capabilityState === 'no_match_found'
        ? 'no_match_found'
        : result.capabilityState === 'match_confirmed'
          ? 'verified_record_found'
          : result.capabilityState === 'expired'
            ? 'expired'
            : result.capabilityState === 'source_unavailable'
              ? 'unavailable'
              : result.disputeState === 'applicant_disputed'
                ? 'applicant_disputed'
                : 'possible_match_reviewing',
    checked_at: result.checkedAt,
    coverage_statement: result.coverageStatement,
    verified_result_summary: result.shortFactualSummary,
    official_source_references: result.sourceRecord
      ? [{
          source: result.sourceRecord.officialSource,
          url: result.sourceRecord.sourceRecordUrl,
          file_number: result.sourceRecord.fileNumber,
          document_id: result.sourceRecord.documentId,
          order_date: result.sourceRecord.orderDate,
        }]
      : [],
    applicant_role_in_proceeding: result.match?.applicantRole ?? null,
    review_dispute_status: result.disputeState,
    expiration_recheck_date: expirationRecheckDate,
    reason_codes_safe_for_landlord_display: result.match?.reasonCodes ?? [],
    disclaimer: ONTARIO_LTB_SEARCH_DISCLAIMER,
  };
}

function field(key: OcrFieldKey, value: string | null, sourcePage = 1): OcrExtractedField {
  return {
    key,
    originalValue: value,
    correctedValue: null,
    confidence: value ? (value.length < 3 ? 0.45 : 0.88) : 0,
    sourcePage: value ? sourcePage : null,
    state: value ? (value.length < 3 ? 'low_confidence' : 'extracted') : 'missing',
  };
}

function match(text: string, pattern: RegExp): string | null {
  return text.match(pattern)?.[1]?.trim() ?? null;
}

function flattenOcrFields(jobs: LocalOcrJob[]) {
  return jobs.flatMap((job) =>
    job.fields.map((fieldItem) => ({
      ...fieldItem,
      value: fieldItem.correctedValue ?? fieldItem.originalValue,
      documentId: job.documentId,
    })),
  );
}

function firstValue(fields: ReturnType<typeof flattenOcrFields>, keys: OcrFieldKey[]) {
  return fields.find((item) => keys.includes(item.key) && item.value)?.value ?? null;
}

function compareText(fieldName: string, applicantValue: string, evidenceValue: string | null, jobs: LocalOcrJob[], loose = false): ConsistencyFinding {
  if (!applicantValue && !evidenceValue) return finding(fieldName, 'missing', null, null, [], `${fieldName} is missing from applicant and evidence.`, null);
  if (!evidenceValue) return finding(fieldName, 'missing', applicantValue, null, [], `${fieldName} is missing from parsed evidence.`, null);
  if (!applicantValue) return finding(fieldName, 'needs_review', null, evidenceValue, documentIds(jobs), `${fieldName} appears in evidence but not application data.`, null);
  const left = normalize(applicantValue);
  const right = normalize(evidenceValue);
  if (left === right || (loose && (left.includes(right) || right.includes(left)))) return finding(fieldName, 'match', applicantValue, evidenceValue, documentIds(jobs), `${fieldName} matches.`, `${fieldName} matches verified evidence.`);
  if (left.replace(/\s/g, '') === right.replace(/\s/g, '')) return finding(fieldName, 'minor_formatting_difference', applicantValue, evidenceValue, documentIds(jobs), `${fieldName} differs only by formatting.`, `${fieldName} is consistent with minor formatting differences.`);
  return finding(fieldName, 'conflict', applicantValue, evidenceValue, documentIds(jobs), `${fieldName} conflicts with evidence.`, null);
}

function compareMoney(fieldName: string, applicantValue: number, evidenceValue: string | null, jobs: LocalOcrJob[]): ConsistencyFinding {
  if (!evidenceValue) return finding(fieldName, 'missing', String(applicantValue || ''), null, documentIds(jobs), `${fieldName} is missing from evidence.`, null);
  const parsed = Number(evidenceValue.replace(/,/g, ''));
  if (Number.isNaN(parsed)) return finding(fieldName, 'unable_to_parse', String(applicantValue || ''), evidenceValue, documentIds(jobs), `${fieldName} could not be parsed.`, null);
  if (!applicantValue) return finding(fieldName, 'needs_review', null, evidenceValue, documentIds(jobs), `${fieldName} appears in evidence but not application data.`, null);
  const monthlyTolerance = Math.max(100, applicantValue * 0.08);
  return Math.abs(applicantValue - parsed) <= monthlyTolerance
    ? finding(fieldName, 'match', String(applicantValue), evidenceValue, documentIds(jobs), `${fieldName} is within tolerance.`, 'Income evidence is consistent.')
    : finding(fieldName, 'needs_review', String(applicantValue), evidenceValue, documentIds(jobs), `${fieldName} requires reviewer comparison across pay frequency/YTD context.`, null);
}

function finding(fieldName: string, state: ConsistencyFindingState, applicantValue: string | null, evidenceValue: string | null, evidenceDocumentIds: string[], explanation: string, landlordVisibleSummary: string | null): ConsistencyFinding {
  return {
    id: stableId('finding', fieldName, applicantValue ?? '', evidenceValue ?? ''),
    field: fieldName,
    state,
    applicantValue,
    evidenceValue,
    evidenceDocumentIds,
    explanation,
    landlordVisibleSummary,
    resolved: false,
    resolutionReason: null,
    audit: [audit('system', 'consistency.finding_created', 'consistency_finding', fieldName, { state })],
  };
}

function documentIds(jobs: LocalOcrJob[]) {
  return jobs.map((job) => job.documentId);
}

function parseCsv(csv: string): Array<Record<string, string>> {
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
  const headers = splitCsvLine(headerLine);
  return lines.filter(Boolean).map((line) => Object.fromEntries(splitCsvLine(line).map((value, index) => [headers[index], value])));
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = '';
  let quoted = false;
  for (const char of line) {
    if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) {
      out.push(current.trim());
      current = '';
    } else current += char;
  }
  out.push(current.trim());
  return out;
}

function normalizeLtbCsvRow(row: Record<string, string>, metadata: LocalLtbCatalogue['metadata'], index: number): OntarioLtbSourceRecord {
  return {
    officialSource: 'Ontario Data Catalogue',
    sourceRecordUrl: metadata.datasetUrl,
    sourceDatasetVersionDate: metadata.sourceVersion,
    retrievalTimestamp: metadata.retrievedAt,
    fileNumber: row.file_number || row.fileNumber || `fixture-${index}`,
    applications: row.applications || '',
    applicationType: row.application_type || row.applicationType || '',
    rentalUnitAddress: row.rental_unit_address || row.rentalUnitAddress || null,
    complexAddress: row.complex_address || row.complexAddress || null,
    landlordName: row.landlord_name || row.landlordName || null,
    landlordAgentName: row.landlord_agent_name || row.landlordAgentName || null,
    tenantName: row.tenant_name || row.tenantName || null,
    formerTenantName: row.former_tenant_name || row.formerTenantName || null,
    subTenantName: row.sub_tenant_name || null,
    occupantNames: row.occupant_names || null,
    coopMemberName: row.coop_member_name || null,
    coopName: row.coop_name || null,
    documentType: row.document_type || 'Order',
    orderDate: row.order_date || row.orderDate || metadata.coverageEnd,
    documentId: row.document_id || row.documentId || `fixture-doc-${index}`,
    contentDownloadUrl: row.content_download_url || row.contentDownloadUrl || metadata.resourceUrl,
    confidentialityState: 'published_redacted',
  };
}

function createVerificationCase(order: LocalPaymentOrder, sectionKey: LocalVerificationCase['sectionKey']): LocalVerificationCase {
  return {
    id: stableId('case', order.id, sectionKey),
    packageId: stableId('verification-package', order.id, order.passportVersionId),
    sectionKey,
    state: sectionKey === 'employment' || sectionKey === 'rental_history' || sectionKey === 'references' ? 'pending_response' : 'active',
    checklist: checklistFor(sectionKey),
    expiryDate: null,
    landlordSafeSummary: null,
    internalNotes: [],
  };
}

function checklistFor(sectionKey: LocalVerificationCase['sectionKey']) {
  return [
    { key: 'consent', label: 'Consent and version linkage confirmed', complete: true, required: true },
    { key: 'evidence', label: `${labelForSection(sectionKey)} evidence reviewed`, complete: false, required: true },
    { key: 'summary', label: 'Landlord-safe factual summary prepared', complete: false, required: true },
  ];
}

function sectionsForCases(cases: LocalVerificationCase[]): PassportSection[] {
  return CORE_VERIFICATION_SECTIONS.map((key) => {
    const item = cases.find((caseItem) => caseItem.sectionKey === key);
    const verified = item?.state === 'verified';
    return {
      key,
      name: key,
      description: key,
      route: '/',
      status: verified ? 'verified' : item ? 'under_review' : 'ready_for_review',
      verification_state: verified ? 'verified' : item ? 'under_review' : 'unverified',
      progress: verified ? 100 : item ? 85 : 100,
      last_updated_at: new Date().toISOString(),
      needs_reverification_at: null,
    };
  });
}

function progressFromCases(cases: LocalVerificationCase[]) {
  return Math.round((cases.filter((item) => item.state === 'verified').length / cases.length) * 100);
}

function packageStateFromCases(cases: LocalVerificationCase[]): LocalVerificationPackage['state'] {
  if (cases.some((item) => item.state === 'unable_to_verify' || item.state === 'failed')) return 'unable_to_verify';
  if (cases.some((item) => item.state === 'needs_information')) return 'needs_information';
  if (cases.every((item) => item.state === 'verified')) return 'verified';
  if (cases.some((item) => item.state === 'expired')) return 'expired';
  return 'in_progress';
}

function renderOutreachEmail(type: OutreachType, token: string) {
  const label = type.replaceAll('_', ' ');
  return {
    subject: `Rental Passport ${label} verification request`,
    html: `<p>A tenant authorized Rental Passport to contact you for ${label} verification.</p><p><a href="/verify/${type}/${token}">Open secure response form</a></p>`,
  };
}

function queueForCase(caseInput: LocalVerificationCase): ReviewerQueueKey {
  if (caseInput.state === 'needs_information') return 'Needs More Information';
  if (caseInput.state === 'needs_reverification') return 'Reverification';
  if (caseInput.sectionKey === 'identity_confirmation') return 'Identity';
  if (caseInput.sectionKey === 'employment' && caseInput.state === 'pending_response') return 'Employer Response Pending';
  if (caseInput.sectionKey === 'employment') return 'Employment';
  if (caseInput.sectionKey === 'rental_history' && caseInput.state === 'pending_response') return 'Previous Landlord Response Pending';
  if (caseInput.sectionKey === 'rental_history') return 'Rental History';
  if (caseInput.sectionKey === 'references') return 'References';
  if (caseInput.sectionKey === 'credit_report') return 'Credit Review';
  if (caseInput.sectionKey === 'ontario_ltb') return 'LTB Possible Match';
  return 'Document Consistency';
}

function labelForSection(sectionKey: LocalVerificationCase['sectionKey']) {
  const labels: Record<LocalVerificationCase['sectionKey'], string> = {
    identity_confirmation: 'Identity',
    employment: 'Employment',
    rental_history: 'Rental History',
    references: 'References',
    credit_report: 'Credit',
    ontario_ltb: 'Ontario LTB Search',
    document_consistency: 'Document Consistency',
  };
  return labels[sectionKey];
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function splitNames(value: string | null): string[] {
  if (!value) return [];
  return value.split(/\s*(?:;|, and |\band\b|\/)\s*/i).map((item) => item.trim()).filter(Boolean);
}

function namesSimilar(left: string, right: string): boolean {
  const leftParts = normalize(left).split(' ').filter(Boolean);
  const rightParts = normalize(right).split(' ').filter(Boolean);
  if (leftParts.length === 0 || rightParts.length === 0) return false;
  const sameLastName = leftParts.at(-1) === rightParts.at(-1);
  const sameFirstInitial = leftParts[0][0] === rightParts[0][0];
  return sameLastName && sameFirstInitial;
}

function addressesSimilar(left: string, right: string): boolean {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return false;
  const aNumber = a.match(/\d+/)?.[0];
  const bNumber = b.match(/\d+/)?.[0];
  return a.includes(b) || b.includes(a) || Boolean(aNumber && bNumber && aNumber === bNumber && a.split(' ').some((part) => b.includes(part)));
}

function runtimeIsProduction(): boolean {
  return Boolean(import.meta.env?.VITE_APP_ENV === 'production');
}

function runtimeIsPublicDemoEnabled(): boolean {
  const env = import.meta.env;
  return env?.VITE_PARTNER_VIEWER_DEMO_ENABLED === 'true' || env?.VITE_POST_APPLICATION_DEMO_ENABLED === 'true';
}

function futureDate(days: number) {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * days).toISOString();
}

function stableId(...parts: string[]) {
  return parts.join(':').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function audit(actorId: string | null, eventType: string, resourceType: string, resourceId: string, metadata: Record<string, unknown>): LocalAuditEvent {
  return {
    id: stableId('audit', eventType, resourceId, String(Date.now()), String(Math.random()).slice(2, 8)),
    actorId,
    eventType,
    resourceType,
    resourceId,
    internalOnly: true,
    metadata,
    createdAt: new Date().toISOString(),
  };
}
