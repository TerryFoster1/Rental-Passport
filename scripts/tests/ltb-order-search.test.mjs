import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assessOntarioLtbOrderMatch,
  authorizeOntarioLtbSearchRequest,
  canReleaseOntarioLtbResultToPartner,
  createOntarioLtbAuditEvent,
  createOntarioLtbCoverageStatement,
  getOntarioLtbSearchReadiness,
  reviseOntarioLtbResultForSourceUpdate,
  toRentalDistrictLtbVerificationPayload,
} from '../../src/services/ltbOrderSearchService.ts';

const coverage = {
  sourceName: 'LTB Order Catalogue',
  publisher: 'Ontario Ministry of the Attorney General',
  datasetUrl: 'https://data.ontario.ca/dataset/ltb-order-catalogue',
  resourceUrl: 'https://data.ontario.ca/dataset/2110a7ca-e4ef-493e-b8f1-fbeb70384bc1/resource/86e75d11-1c2c-4cd9-9b0d-9fccec302b30',
  licence: 'Open Government Licence - Ontario',
  coverageStart: '2026-01-01',
  coverageEnd: '2026-05-31',
  publicationLag: '2 to 3 months after issue date',
  retrievedAt: '2026-08-03',
  limitations: ['confidential orders excluded', 'historical orders back to 2021 will be published in phases'],
};

const baseRecord = {
  officialSource: 'Ontario Data Catalogue',
  sourceRecordUrl: coverage.resourceUrl,
  sourceDatasetVersionDate: '2026-07-23',
  retrievalTimestamp: '2026-08-03T12:00:00Z',
  fileNumber: 'LTB-L-000001-26',
  applications: 'L1',
  applicationType: 'L',
  rentalUnitAddress: '123 Maple St, Unit 1204, Toronto, ON',
  complexAddress: null,
  landlordName: 'Maple Property Inc.',
  landlordAgentName: null,
  tenantName: 'Kathryn Casey',
  formerTenantName: null,
  subTenantName: null,
  occupantNames: null,
  coopMemberName: null,
  coopName: null,
  documentType: 'Order',
  orderDate: '2026-03-12',
  documentId: 'DOC-123',
  contentDownloadUrl: 'https://example.test/order.pdf',
  confidentialityState: 'published_redacted',
};

const consent = {
  consentId: 'consent_ltb_1',
  consentVersion: 'ltb-order-search-v1',
  consentedAt: '2026-08-03T11:00:00Z',
  applicationId: 'rd_application_1',
  passportId: 'passport_1',
  applicantUserId: 'applicant_1',
  applicantLegalName: 'Kathryn Casey',
  purpose: 'official_ontario_ltb_order_search',
  requestingOrganizationId: 'rd_org_1',
  sourceCoverage: coverage,
  expiresAt: '2026-09-03T11:00:00Z',
};

const request = {
  requestId: 'request_1',
  type: 'ontario_ltb_order_search',
  applicationId: 'rd_application_1',
  passportId: 'passport_1',
  applicantUserId: 'applicant_1',
  requestingOrganizationId: 'rd_org_1',
  consentId: 'consent_ltb_1',
};

function result(overrides = {}) {
  return {
    id: 'ltb_result_1',
    capabilityState: 'match_confirmed',
    sourceRecord: baseRecord,
    match: assessOntarioLtbOrderMatch(baseRecord, { fullLegalName: 'Kathryn Casey', currentAddress: '123 Maple St, Unit 1204, Toronto, ON' }),
    checkedAt: '2026-08-03T12:00:00Z',
    coverageStatement: createOntarioLtbCoverageStatement(coverage),
    shortFactualSummary: 'Possible official LTB order match found. Applicant role and context were reviewed.',
    monetaryAmountExplicitlyOrdered: null,
    possessionOrTerminationOutcome: null,
    dismissalOrWithdrawalStatus: null,
    amendmentReviewStayAppealIndicators: [],
    supersededOrReplacedStatus: null,
    documentHashReference: null,
    reviewerUserId: 'reviewer_1',
    reviewedAt: '2026-08-03T12:30:00Z',
    disputeState: 'not_disputed',
    applicantDisclosureSummary: 'Applicant was shown the official source reference.',
    internalReviewerNotes: 'Private reviewer note.',
    ...overrides,
  };
}

describe('Ontario LTB order search model', () => {
  it('requires consent before search', () => {
    assert.equal(getOntarioLtbSearchReadiness(null), 'consent_required');
  });

  it('authorizes only application-scoped consent before search', () => {
    assert.equal(authorizeOntarioLtbSearchRequest(request, consent, new Date('2026-08-04T00:00:00Z')).authorized, true);
    assert.deepEqual(
      authorizeOntarioLtbSearchRequest({ ...request, applicationId: 'other_application' }, consent, new Date('2026-08-04T00:00:00Z')),
      { authorized: false, reason: 'application_scope_mismatch' },
    );
  });

  it('denies cross-organization access', () => {
    assert.deepEqual(
      authorizeOntarioLtbSearchRequest({ ...request, requestingOrganizationId: 'other_org' }, consent, new Date('2026-08-04T00:00:00Z')),
      { authorized: false, reason: 'organization_scope_mismatch' },
    );
  });

  it('does not confirm a name-only match', () => {
    const assessment = assessOntarioLtbOrderMatch({ ...baseRecord, rentalUnitAddress: null }, { fullLegalName: 'Kathryn Casey' });
    assert.equal(assessment.status, 'ambiguous_possible_match');
    assert.equal(assessment.requiresManualReview, true);
    assert.ok(assessment.reasonCodes.includes('exact_name_without_corrob'));
  });

  it('distinguishes tenant and landlord roles', () => {
    const assessment = assessOntarioLtbOrderMatch(
      { ...baseRecord, tenantName: null, landlordName: 'Kathryn Casey' },
      { fullLegalName: 'Kathryn Casey', currentAddress: '123 Maple St, Unit 1204, Toronto, ON' },
    );
    assert.equal(assessment.applicantRole, 'landlord');
    assert.ok(assessment.reasonCodes.includes('record_names_applicant_as_landlord_or_agent'));
  });

  it('includes no-match coverage limitations', () => {
    const statement = createOntarioLtbCoverageStatement(coverage);
    assert.match(statement, /no matching record was found/i);
    assert.match(statement, /2026-01-01 to 2026-05-31/);
    assert.match(statement, /confidential orders excluded/);
  });

  it('requires review for similar-name matches', () => {
    const assessment = assessOntarioLtbOrderMatch({ ...baseRecord, tenantName: 'Katherine Casey' }, { fullLegalName: 'Kathryn Casey' });
    assert.equal(assessment.status, 'ambiguous_possible_match');
    assert.equal(assessment.requiresManualReview, true);
  });

  it('rejects a false match when the address conflicts', () => {
    const assessment = assessOntarioLtbOrderMatch(baseRecord, { fullLegalName: 'Kathryn Casey', currentAddress: '999 Queen St, Ottawa, ON' });
    assert.equal(assessment.status, 'rejected_mismatch');
    assert.ok(assessment.reasonCodes.includes('exact_name_with_conflicting_address'));
  });

  it('pauses partner release during applicant dispute', () => {
    assert.equal(canReleaseOntarioLtbResultToPartner(result({ disputeState: 'applicant_disputed' })), false);
  });

  it('marks expired results for recheck', () => {
    const payload = toRentalDistrictLtbVerificationPayload(result({ capabilityState: 'expired' }), '2026-09-03');
    assert.equal(payload.status, 'expired');
  });

  it('updates amended or replaced order status without deleting history', () => {
    const original = result();
    const revision = reviseOntarioLtbResultForSourceUpdate(original, {
      revisionType: 'replaced',
      sourceRecord: { ...baseRecord, documentId: 'DOC-REPLACEMENT', contentDownloadUrl: 'https://example.test/replacement.pdf' },
      reviewerUserId: 'reviewer_2',
      reviewedAt: '2026-08-04T12:00:00Z',
      summary: 'Official source indicates this order was replaced. Previous result is preserved for audit history.',
    });
    assert.equal(original.sourceRecord.documentId, 'DOC-123');
    assert.equal(revision.capabilityState, 'corrected');
    assert.ok(revision.amendmentReviewStayAppealIndicators.includes('replaced'));
    assert.match(revision.supersededOrReplacedStatus, /Previous result preserved/);
  });

  it('fails transparently when source is unavailable', () => {
    const payload = toRentalDistrictLtbVerificationPayload(result({ capabilityState: 'source_unavailable', sourceRecord: null, match: null }), '2026-09-03');
    assert.equal(payload.status, 'unavailable');
    assert.deepEqual(payload.official_source_references, []);
  });

  it('does not return private reviewer notes or approve/reject instructions to Rental District', () => {
    const payload = toRentalDistrictLtbVerificationPayload(result(), '2026-09-03');
    assert.equal('internalReviewerNotes' in payload, false);
    assert.equal('risk_score' in payload, false);
    assert.equal('recommendation' in payload, false);
  });

  it('creates an audit event for every search and review action', () => {
    const event = createOntarioLtbAuditEvent({
      eventType: 'ltb_search_executed',
      request,
      actorId: 'reviewer_1',
      metadata: { sourceCoverageEnd: coverage.coverageEnd },
      createdAt: '2026-08-04T12:00:00Z',
    });
    assert.equal(event.applicationId, request.applicationId);
    assert.equal(event.requestingOrganizationId, request.requestingOrganizationId);
    assert.equal(event.metadata.sourceCoverageEnd, coverage.coverageEnd);
  });
});
