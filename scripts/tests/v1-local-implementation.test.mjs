import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  REQUIRED_REVIEWER_QUEUES,
  applyReviewerAction,
  cancelPaymentOrder,
  compareDocumentConsistency,
  confirmMockPayment,
  correctOcrField,
  createLocalOcrJob,
  createLocalOutreach,
  createManualReviewCaseFromLtb,
  createPaymentOrder,
  createPurchaseUxState,
  importOntarioLtbCatalogueFromCsv,
  productionFailClosedState,
  resolveConsistencyFinding,
  retryOcrJob,
  reviewerQueuesForCases,
  runLocalSecurityAssertions,
  searchLocalOntarioLtbCatalogue,
  startVerificationPackage,
  submitLocalExternalResponse,
  toRentalDistrictLtbVerificationPayload,
  updateVerificationCaseState,
  validateRentalDistrictContract,
} from '../../src/services/v1LocalImplementationService.ts';

const now = new Date('2026-08-04T12:00:00Z');

const ltbMetadata = {
  sourceName: 'LTB Order Catalogue',
  publisher: 'Ontario Ministry of the Attorney General',
  datasetUrl: 'https://data.ontario.ca/dataset/ltb-order-catalogue',
  resourceUrl: 'https://data.ontario.ca/dataset/ltb-order-catalogue/resource/orders.csv',
  licence: 'Open Government Licence - Ontario',
  coverageStart: '2026-01-01',
  coverageEnd: '2026-05-31',
  publicationLag: '2-3 months',
  retrievedAt: '2026-08-04T00:00:00Z',
  limitations: ['Confidential orders are excluded', 'Recent orders may not be published yet'],
  sourceVersion: '2026-05',
  publicationDate: '2026-07-30',
  staleDataWarning: null,
};

describe('V1 local OCR pipeline', () => {
  it('extracts pay stub fields with page references and reviewer correction', () => {
    const job = createLocalOcrJob(
      'paystub-1',
      'pay_stub',
      [
        'Employee Name: Kathryn Casey',
        'Employer: Tech Solutions Inc.',
        'Pay Period: 2026-07-01 to 2026-07-15',
        'Payment Date: 2026-07-16',
        'Gross Pay: $3,250.00',
        'Net Pay: $2,410.00',
        'Year-to-Date Income: $48,750.00',
        'Pay Frequency: Biweekly',
      ].join('\n'),
      now,
    );
    assert.equal(job.state, 'completed');
    assert.equal(job.fields.find((field) => field.key === 'employeeName')?.originalValue, 'Kathryn Casey');
    assert.equal(job.fields.find((field) => field.key === 'grossPay')?.sourcePage, 1);

    const corrected = correctOcrField(job, 'employer', 'Tech Solutions Incorporated');
    assert.equal(corrected.fields.find((field) => field.key === 'employer')?.correctedValue, 'Tech Solutions Incorporated');
    assert.equal(corrected.audit.some((event) => event.eventType === 'ocr.field_corrected'), true);
  });

  it('extracts lease and government ID fields without claiming authenticity', () => {
    const lease = createLocalOcrJob(
      'lease-1',
      'lease',
      'Tenant: Kathryn Casey\nRental Address: 123 Maple St, Unit 1204, Toronto, ON\nLandlord: Greenview Property Management\nTenancy Dates: 2025-08-01 to 2026-07-31\nMonthly Rent: $2800\nSignature: present\nLease Date: 2025-07-15',
      now,
    );
    const id = createLocalOcrJob(
      'id-1',
      'government_id_front',
      'Document Type: Ontario Driver Licence\nName: Kathryn Casey\nDate of Birth: 1991-04-02\nAddress: 123 Maple St, Unit 1204, Toronto, ON\nExpiry: 2029-04-02',
      now,
    );
    assert.equal(lease.fields.find((field) => field.key === 'signaturePresence')?.originalValue, 'signature present');
    assert.equal(id.fields.find((field) => field.key === 'documentType')?.originalValue, 'Ontario Driver Licence');
    assert.equal(lease.audit.some((event) => event.eventType === 'ocr.extraction_completed'), true);
  });

  it('handles unreadable documents and retry', () => {
    const unreadable = createLocalOcrJob('bad-1', 'pay_stub', '', now);
    assert.equal(unreadable.state, 'unreadable');
    const retried = retryOcrJob(unreadable, 'Employee Name: Kathryn Casey\nEmployer: Tech Solutions Inc.\nGross Pay: $3250');
    assert.equal(retried.attempts, 2);
    assert.ok(['failed', 'needs_reviewer_correction'].includes(retried.state));
  });
});

describe('V1 local document consistency engine', () => {
  it('creates evidence-linked findings and supports reviewer resolution', () => {
    const payStub = createLocalOcrJob('paystub-1', 'pay_stub', 'Employee Name: Kathryn Casey\nEmployer: Tech Solutions Inc.\nGross Pay: $3250\nPay Period: 2026-07-01 to 2026-07-15', now);
    const lease = createLocalOcrJob('lease-1', 'lease', 'Tenant: Kathryn Casey\nRental Address: 123 Maple St, Unit 1204, Toronto, ON\nTenancy Dates: 2025-08-01 to 2026-07-31\nMonthly Rent: $2800', now);
    const findings = compareDocumentConsistency({
      applicant: {
        legalName: 'Kathryn Casey',
        employer: 'Tech Solutions Inc',
        rentalAddress: '123 Maple St, Unit 1204, Toronto, ON',
        monthlyIncome: 6500,
        payPeriod: '2026-07',
        tenancyDates: '2025-08-01 to 2026-07-31',
        currentAddress: '123 Maple St, Unit 1204, Toronto, ON',
      },
      ocrJobs: [payStub, lease],
      referenceContacts: [{ name: 'Jason Miller', email: 'jason@example.test' }],
    });
    assert.equal(findings.some((finding) => finding.state === 'conflict'), false);
    assert.equal(findings.some((finding) => finding.evidenceDocumentIds.includes('paystub-1')), true);

    const resolved = resolveConsistencyFinding(findings.find((finding) => finding.field === 'incomeAmount'), 'reviewer-1', 'Biweekly gross pay reconciled to monthly income.');
    assert.equal(resolved.resolved, true);
    assert.equal(resolved.audit.some((event) => event.eventType === 'consistency.finding_resolved'), true);
  });
});

describe('V1 local Ontario LTB ingestion and search', () => {
  it('imports CSV fixture data and creates conservative manual review results', () => {
    const csv = [
      'file_number,tenant_name,rental_unit_address,landlord_name,document_type,order_date,document_id,content_download_url',
      'LTB-L-000001-26,Katherine Casey,"123 Maple St, Unit 1204, Toronto, ON",Greenview Property Management,Order,2026-03-15,doc-1,https://example.test/order.pdf',
    ].join('\n');
    const catalogue = importOntarioLtbCatalogueFromCsv(csv, ltbMetadata);
    assert.equal(catalogue.records.length, 1);

    const results = searchLocalOntarioLtbCatalogue(catalogue, {
      fullLegalName: 'Kathryn Casey',
      currentAddress: '123 Maple St, Unit 1204, Toronto, ON',
    }, now);
    assert.equal(results[0].capabilityState, 'manual_review_required');
    assert.equal(results[0].coverageStatement.includes('Confidential orders are excluded'), true);

    const reviewCase = createManualReviewCaseFromLtb(results[0]);
    assert.equal(reviewCase.state, 'active');
    assert.equal(reviewCase.checklist.some((item) => item.key === 'linked_pdf_reviewed'), true);
  });

  it('does not treat no match as no LTB history and returns partner-safe payloads', () => {
    const catalogue = importOntarioLtbCatalogueFromCsv('file_number,tenant_name,rental_unit_address\nLTB-L-2,Someone Else,9 Pine St', ltbMetadata);
    const [result] = searchLocalOntarioLtbCatalogue(catalogue, { fullLegalName: 'Kathryn Casey', currentAddress: '123 Maple St' }, now);
    assert.equal(result.capabilityState, 'no_match_found');
    assert.equal(result.shortFactualSummary.includes('not proof'), true);
    const payload = toRentalDistrictLtbVerificationPayload(result, '2026-11-04');
    assert.equal(payload.disclaimer.includes('does not provide legal advice'), true);
  });
});

describe('V1 local payment and verification orchestration', () => {
  it('requires tenant authorization and payment before creating verification cases', () => {
    const unpaid = createPaymentOrder({
      productKey: 'rental_passport_verification',
      payer: 'landlord',
      passportId: 'passport-1',
      passportVersionId: 'version-1',
      tenantAuthorized: false,
      idempotencyKey: 'landlord-core-1',
    });
    assert.throws(() => startVerificationPackage(unpaid), /tenant_authorization_required/);

    const paid = confirmMockPayment({ ...unpaid, tenantAuthorized: true, tenantAuthorizationState: 'authorized' });
    const pkg = startVerificationPackage(paid);
    assert.equal(pkg.cases.some((item) => item.sectionKey === 'credit_report'), false);
    assert.equal(pkg.progress, 0);
  });

  it('includes credit only for bundle or upgrade and prevents duplicate purchases', () => {
    const first = createPaymentOrder({
      productKey: 'verified_passport_plus_credit',
      payer: 'tenant',
      passportId: 'passport-1',
      passportVersionId: 'version-1',
      tenantAuthorized: true,
      idempotencyKey: 'tenant-bundle-1',
    });
    const duplicate = createPaymentOrder({
      productKey: 'verified_passport_plus_credit',
      payer: 'tenant',
      passportId: 'passport-1',
      passportVersionId: 'version-1',
      tenantAuthorized: true,
      idempotencyKey: 'tenant-bundle-1',
      existingOrders: [first],
    });
    assert.equal(duplicate.id, first.id);
    const pkg = startVerificationPackage(confirmMockPayment(first));
    assert.equal(pkg.cases.some((item) => item.sectionKey === 'credit_report'), true);
    assert.equal(cancelPaymentOrder(first, 'Applicant changed package').paymentState, 'failed');
  });

  it('derives the verified badge from case outcomes, not payment state', () => {
    const order = confirmMockPayment(createPaymentOrder({
      productKey: 'rental_passport_verification',
      payer: 'tenant',
      passportId: 'passport-1',
      passportVersionId: 'version-1',
      tenantAuthorized: true,
      idempotencyKey: 'tenant-core-2',
    }));
    let pkg = startVerificationPackage(order);
    assert.equal(pkg.overallBadge.canIssueOverallVerifiedBadge, false);
    for (const verificationCase of [...pkg.cases]) {
      if (['identity_confirmation', 'employment', 'rental_history', 'references'].includes(verificationCase.sectionKey)) {
        pkg = updateVerificationCaseState(pkg, verificationCase.id, 'verified', 'Fixture review complete');
      }
    }
    assert.equal(pkg.overallBadge.canIssueOverallVerifiedBadge, true);
  });
});

describe('V1 local outreach and external response workflows', () => {
  it('renders local emails and accepts valid scoped responses', () => {
    const invitation = createLocalOutreach({
      verificationCaseId: 'case-employment',
      passportId: 'passport-1',
      passportVersionId: 'version-1',
      outreachType: 'employer',
      recipientEmail: 'hr@example.test',
      tokenSeed: 'seed-1',
      consentConfirmed: true,
    });
    assert.equal(invitation.status, 'sent');
    assert.equal(invitation.renderedEmail.html.includes('/verify/employer/'), true);
    const result = submitLocalExternalResponse({ invitation, token: invitation.token, expectedType: 'employer', declarationAccepted: true, now });
    assert.equal(result.accepted, true);
  });

  it('rejects modified, expired, revoked, completed, wrong-type, and no-consent tokens', () => {
    const invitation = createLocalOutreach({
      verificationCaseId: 'case-reference',
      passportId: 'passport-1',
      passportVersionId: 'version-1',
      outreachType: 'reference',
      recipientEmail: 'ref@example.test',
      tokenSeed: 'seed-2',
      consentConfirmed: true,
    });
    assert.equal(submitLocalExternalResponse({ invitation, token: 'tampered', expectedType: 'reference', declarationAccepted: true }).status, 'modified_token');
    assert.equal(submitLocalExternalResponse({ invitation: { ...invitation, expiresAt: '2026-01-01T00:00:00Z' }, token: invitation.token, expectedType: 'reference', declarationAccepted: true, now }).status, 'expired');
    assert.equal(submitLocalExternalResponse({ invitation: { ...invitation, status: 'revoked' }, token: invitation.token, expectedType: 'reference', declarationAccepted: true }).status, 'revoked');
    assert.equal(submitLocalExternalResponse({ invitation: { ...invitation, status: 'completed' }, token: invitation.token, expectedType: 'reference', declarationAccepted: true }).status, 'completed');
    assert.equal(submitLocalExternalResponse({ invitation, token: invitation.token, expectedType: 'employer', declarationAccepted: true }).status, 'wrong_type');
    assert.equal(submitLocalExternalResponse({ invitation, token: invitation.token, expectedType: 'reference', declarationAccepted: false }).status, 'consent_required');
  });
});

describe('V1 local reviewer, purchase UX, partner contract, and security harnesses', () => {
  it('exposes every required reviewer queue and enforces checklist completion', () => {
    const order = confirmMockPayment(createPaymentOrder({
      productKey: 'verified_passport_plus_credit',
      payer: 'tenant',
      passportId: 'passport-1',
      passportVersionId: 'version-1',
      tenantAuthorized: true,
      idempotencyKey: 'queue-1',
    }));
    const pkg = startVerificationPackage(order);
    const queues = reviewerQueuesForCases(pkg.cases);
    assert.deepEqual(Object.keys(queues), REQUIRED_REVIEWER_QUEUES);
    assert.throws(() => applyReviewerAction(pkg.cases[0], 'verify', 'Looks good'), /Required checklist/);
    const ready = { ...pkg.cases[0], checklist: pkg.cases[0].checklist.map((item) => ({ ...item, complete: true })) };
    assert.equal(applyReviewerAction(ready, 'verify', 'All checklist items completed').state, 'verified');
  });

  it('models tenant and landlord purchase UX without landlord-only marketing in tenant copy', () => {
    const tenantUx = createPurchaseUxState({ actor: 'tenant', productKey: 'verified_passport_plus_credit', tenantAuthorized: true, paymentState: 'pending' });
    assert.equal(tenantUx.priceLabel, '$45 CAD');
    assert.equal(tenantUx.included.includes('Tenant authorization required before work begins'), false);
    const landlordUx = createPurchaseUxState({ actor: 'landlord', productKey: 'verified_credit_check', tenantAuthorized: false, paymentState: 'paid' });
    assert.equal(landlordUx.status, 'Awaiting Tenant Authorization');
  });

  it('validates Rental District partner contract without raw evidence', () => {
    assert.equal(validateRentalDistrictContract({
      partnerId: 'rental-district',
      eventType: 'retrieve_summary',
      idempotencyKey: 'summary-1',
      payload: { completeness: 96, verificationStates: {} },
    }).ok, true);
    const unsafe = validateRentalDistrictContract({
      partnerId: 'rental-district',
      eventType: 'retrieve_summary',
      idempotencyKey: 'summary-2',
      payload: { rawDocuments: [] },
    });
    assert.equal(unsafe.ok, false);
  });

  it('runs local security assertions and production fail-closed checks', () => {
    const security = runLocalSecurityAssertions({
      requesterRole: 'landlord',
      ownsPassport: false,
      hasShareGrant: true,
      tokenExpired: false,
      tokenRevoked: false,
      partnerSummary: { completeness: 96 },
      paymentState: 'paid',
      tenantConsent: true,
      attemptedDirectBadgeMutation: false,
    });
    assert.equal(security.landlordIsolation, true);
    assert.equal(security.noRawEvidenceInPartnerSummary, true);
    assert.equal(security.supportCannotVerify, true);
    assert.equal(security.reviewerCanVerify, false);
    const failClosed = productionFailClosedState({
      stripeConfigured: false,
      resendConfigured: false,
      supabaseConfigured: false,
      creditProviderConfigured: false,
    });
    assert.equal(failClosed.canTakePayment, false);
    assert.equal(failClosed.canCreatePublicDocumentUrl, false);
    assert.equal(failClosed.canIssueVerifiedBadgeFromFixture, false);
  });
});
