import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CORE_VERIFICATION_SECTIONS,
  OCR_PROVIDER_ABSTRACTION,
  V1_LAUNCH_GAP_CHECKLIST,
  VERIFICATION_PRODUCTS,
  evaluateVerifiedPassportBadgeEligibility,
  getUpgradeAmountCad,
  getVerificationOrderReadiness,
} from '../../src/services/v1LaunchReadinessService.ts';

function section(key, status = 'verified', verificationState = 'verified', progress = 100) {
  return {
    key,
    name: key,
    description: key,
    route: '/',
    status,
    verification_state: verificationState,
    progress,
    last_updated_at: '2026-08-04T00:00:00Z',
    needs_reverification_at: null,
  };
}

describe('V1 launch product distinctions', () => {
  it('keeps core passport verification separate from credit verification', () => {
    assert.equal(VERIFICATION_PRODUCTS.rental_passport_verification.priceCad, 29);
    assert.equal(VERIFICATION_PRODUCTS.rental_passport_verification.includesCorePassportVerification, true);
    assert.equal(VERIFICATION_PRODUCTS.rental_passport_verification.includesVerifiedCreditCheck, false);
    assert.equal(VERIFICATION_PRODUCTS.verified_passport_plus_credit.priceCad, 45);
    assert.equal(VERIFICATION_PRODUCTS.verified_passport_plus_credit.includesVerifiedCreditCheck, true);
  });

  it('charges only the approved difference for a core-to-credit bundle upgrade', () => {
    assert.equal(getUpgradeAmountCad('rental_passport_verification', 'verified_passport_plus_credit'), 16);
  });

  it('does not issue the overall verified badge when only completeness is 100 percent', () => {
    const sections = [
      section('identity_confirmation', 'ready_for_review', 'unverified'),
      section('employment', 'ready_for_review', 'unverified'),
      section('rental_history', 'ready_for_review', 'unverified'),
      section('references', 'ready_for_review', 'unverified'),
      section('credit_report', 'ready_for_review', 'unverified'),
    ];
    const result = evaluateVerifiedPassportBadgeEligibility(sections);
    assert.equal(result.canIssueOverallVerifiedBadge, false);
    assert.equal(result.label, 'Complete - Not Independently Verified');
    assert.deepEqual(result.missingCoreSections.sort(), [...CORE_VERIFICATION_SECTIONS].sort());
  });

  it('does not require credit for the core Verified Rental Passport badge', () => {
    const sections = [
      section('identity_confirmation'),
      section('employment'),
      section('rental_history'),
      section('references'),
      section('credit_report', 'ready_for_review', 'unverified'),
    ];
    const result = evaluateVerifiedPassportBadgeEligibility(sections);
    assert.equal(result.canIssueOverallVerifiedBadge, true);
    assert.equal(result.creditVerifiedSeparately, false);
  });

  it('requires tenant authorization before paid verification work starts', () => {
    const order = {
      productKey: 'rental_passport_verification',
      payer: 'landlord',
      passportId: 'passport_1',
      passportVersionId: 'version_1',
      tenantAuthorized: false,
      paymentState: 'paid',
      packageState: 'not_requested',
    };
    assert.equal(getVerificationOrderReadiness(order), 'tenant_authorization_required');
  });

  it('keeps OCR as reviewer assistance, not document verification', () => {
    assert.equal(OCR_PROVIDER_ABSTRACTION.mode, 'manual_placeholder');
    assert.ok(OCR_PROVIDER_ABSTRACTION.supportedDocuments.includes('pay_stub'));
    assert.ok(OCR_PROVIDER_ABSTRACTION.supportedDocuments.includes('lease'));
  });

  it('does not mark launch as ready without live staging validation', () => {
    assert.equal(V1_LAUNCH_GAP_CHECKLIST.some((item) => item.status === 'blocked'), true);
  });
});
