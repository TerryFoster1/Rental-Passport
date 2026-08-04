import type { PassportSection } from '../types/passport';
import type {
  BadgeEligibility,
  CoreVerificationSectionKey,
  OcrProviderAdapter,
  VerificationOrderDraft,
  VerificationProductDefinition,
  VerificationProductKey,
  V1LaunchGapItem,
} from '../types/v1Launch';

export const CORE_VERIFICATION_SECTIONS: CoreVerificationSectionKey[] = [
  'identity_confirmation',
  'employment',
  'rental_history',
  'references',
];

export const VERIFICATION_PRODUCTS: Record<VerificationProductKey, VerificationProductDefinition> = {
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
};

export const OCR_PROVIDER_ABSTRACTION: OcrProviderAdapter = {
  key: 'manual_ocr_placeholder',
  displayName: 'Manual OCR placeholder',
  mode: 'manual_placeholder',
  supportedDocuments: [
    'government_id',
    'pay_stub',
    'employment_letter',
    'offer_letter',
    'lease',
    'rent_receipt',
    'tenant_ledger',
    'credit_report',
    'supporting_document',
  ],
};

export function getVerificationOrderReadiness(order: VerificationOrderDraft): VerificationOrderDraft['packageState'] {
  if (!order.tenantAuthorized) return 'tenant_authorization_required';
  if (order.paymentState !== 'paid') return 'payment_required';
  return order.packageState === 'not_requested' ? 'queued' : order.packageState;
}

export function getUpgradeAmountCad(fromProduct: VerificationProductKey, toProduct: VerificationProductKey): number {
  return Math.max(0, VERIFICATION_PRODUCTS[toProduct].priceCad - VERIFICATION_PRODUCTS[fromProduct].priceCad);
}

export function evaluateVerifiedPassportBadgeEligibility(sections: PassportSection[]): BadgeEligibility {
  const coreMissing = CORE_VERIFICATION_SECTIONS.filter((key) => {
    const section = sections.find((item) => item.key === key);
    return !section || section.status !== 'verified' || section.verification_state !== 'verified';
  });
  const hasNeedsReverification = sections.some((section) => section.status === 'needs_reverification' || section.verification_state === 'needs_reverification');
  const credit = sections.find((section) => section.key === 'credit_report');
  const creditVerifiedSeparately = Boolean(credit && credit.status === 'verified' && credit.verification_state === 'verified');

  if (hasNeedsReverification) {
    return {
      canIssueOverallVerifiedBadge: false,
      missingCoreSections: coreMissing,
      creditVerifiedSeparately,
      label: 'Needs Reverification',
    };
  }

  if (coreMissing.length === 0) {
    return {
      canIssueOverallVerifiedBadge: true,
      missingCoreSections: [],
      creditVerifiedSeparately,
      label: 'Verified Rental Passport',
    };
  }

  const completeButUnverified = sections.every((section) => section.progress >= 100);
  return {
    canIssueOverallVerifiedBadge: false,
    missingCoreSections: coreMissing,
    creditVerifiedSeparately,
    label: completeButUnverified ? 'Complete - Not Independently Verified' : 'Verification Pending',
  };
}

export const V1_LAUNCH_GAP_CHECKLIST: V1LaunchGapItem[] = [
  {
    sprint: 'Sprint 0 - Current baseline',
    status: 'partial',
    evidence: 'Repository, commits, demo flags, tests, lint, typecheck, and build inspected locally.',
    blocker: 'Live Supabase, Resend, Stripe, and Rental District staging credentials are not present locally.',
  },
  {
    sprint: 'Sprint 1 - Guided tenant onboarding',
    status: 'partial',
    evidence: 'Progressive onboarding route, autosave service, stage definitions, and section progress exist.',
    blocker: 'Regional application rules and complete ordinary rental application fields need live-backed validation.',
  },
  {
    sprint: 'Sprint 2 - OCR provider abstraction',
    status: 'partial',
    evidence: 'V1 OCR provider abstraction added as a manual placeholder, with supported document categories listed.',
    blocker: 'No live OCR provider or processing-job migration is deployed.',
  },
  {
    sprint: 'Sprint 7 - Ontario LTB catalogue',
    status: 'partial',
    evidence: 'Official-source model, conservative matching service, and tests exist.',
    blocker: 'No approved ingestion job, local index, retention approval, or production refresh schedule is live.',
  },
  {
    sprint: 'Sprint 9/10 - Verification and credit purchases',
    status: 'partial',
    evidence: 'Product definitions and order readiness rules separate core verification from credit.',
    blocker: 'Stripe payment records, webhooks, and tenant authorization flow are not live.',
  },
  {
    sprint: 'Sprint 15 - Security and privacy',
    status: 'blocked',
    evidence: 'RLS migrations and private storage design exist in code.',
    blocker: 'Live RLS/security tests have not run because staging credentials are missing.',
  },
];
