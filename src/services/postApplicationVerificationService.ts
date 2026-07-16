import { env, isProduction } from '@/lib/env';
import type {
  DemoPaymentState,
  ImportedApplicationField,
  InvitationValidation,
  PartnerStatusEvent,
  PartnerStatusEventName,
  PostApplicationVerificationRequest,
  PostApplicationVerificationStatus,
  VerificationConsentRecord,
  VerificationRequestPayerMode,
} from '@/types/postApplicationVerification';

const demoRequestId = 'rp_ver_req_rd_001';
const demoApplicationId = 'demo-rp-app-001';
const demoPartnerApplicationId = 'rd_app_2026_0712_001';

const demoTokens = new Set([
  'demo-rd-applicant-pays',
  'demo-rd-landlord-pays',
  'demo-rd-included-credit',
  'demo-rd-declined',
]);

export function getDemoPostApplicationInvitationUrl(token = 'demo-rd-applicant-pays') {
  return `/verification-request/${token}`;
}

export function validateVerificationInvitation(token: string | null, applicantEmail?: string): InvitationValidation {
  if (!token) return { status: 'missing_token', message: 'This verification invitation is missing its secure token.' };

  const demoAllowed = !isProduction || env.postApplicationDemoEnabled;
  if (!demoAllowed && token.startsWith('demo-')) {
    return { status: 'demo_disabled', message: 'Demo verification invitations are disabled in production.' };
  }

  if (token === 'demo-rd-expired') {
    return { status: 'expired_token', message: 'This verification invitation has expired. Ask the landlord to send a new request.' };
  }

  if (token === 'demo-rd-wrong-applicant') {
    return { status: 'wrong_applicant', message: 'This invitation is restricted to the applicant email on the request.' };
  }

  if (!demoTokens.has(token)) {
    return { status: 'invalid_token', message: 'This verification invitation is invalid or has been revoked.' };
  }

  const request = createDemoRequest(token);
  if (applicantEmail && applicantEmail.toLowerCase() !== request.applicant.email.toLowerCase()) {
    return { status: 'wrong_applicant', message: 'This invitation is restricted to the applicant email on the request.' };
  }

  return { status: 'valid', request };
}

export function acceptVerificationRequest(request: PostApplicationVerificationRequest): PostApplicationVerificationRequest {
  return withEvent({
    ...request,
    status: 'applicant_accepted',
  }, 'applicant.accepted', 'applicant_accepted');
}

export function declineVerificationRequest(request: PostApplicationVerificationRequest): PostApplicationVerificationRequest {
  return withEvent({
    ...request,
    status: 'applicant_declined',
  }, 'applicant.declined', 'applicant_declined');
}

export function linkVerificationRequestAccount(
  request: PostApplicationVerificationRequest,
  mode: 'existing_account' | 'new_account',
): PostApplicationVerificationRequest {
  return {
    ...withEvent({ ...request, linkedAccountMode: mode, status: 'account_linked' }, 'applicant.accepted', 'account_linked'),
    linkedAccountMode: mode,
  };
}

export function confirmApplicationImport(request: PostApplicationVerificationRequest): PostApplicationVerificationRequest {
  return {
    ...withEvent({ ...request, status: 'information_imported' }, 'applicant.accepted', 'information_imported'),
    importConfirmedAt: new Date().toISOString(),
  };
}

export function recordVerificationConsent(
  request: PostApplicationVerificationRequest,
  acceptedKeys: Set<string>,
): PostApplicationVerificationRequest {
  const now = new Date().toISOString();
  const consents = request.consents.map((consent) => ({
    ...consent,
    acceptedAt: acceptedKeys.has(consent.key) ? now : consent.acceptedAt,
  }));
  const requiredComplete = consents.every((consent) => !consent.required || consent.acceptedAt);
  return {
    ...request,
    consents,
    status: requiredComplete ? paymentStatusFor(request.payerMode) : 'consent_pending',
    paymentState: requiredComplete ? paymentStateFor(request.payerMode) : request.paymentState,
    events: request.events,
  };
}

export function completeDemoPayment(request: PostApplicationVerificationRequest): PostApplicationVerificationRequest {
  if (isProduction && !env.postApplicationDemoEnabled) return request;
  const nextPaymentState = paymentCompleteState(request.payerMode);
  const eventName: PartnerStatusEventName =
    nextPaymentState === 'payment_completed' ? 'payment.completed' : 'payment.completed';
  return withEvent({
    ...request,
    paymentState: nextPaymentState,
    status: 'verification_queued',
  }, eventName, 'verification_queued');
}

export function failDemoPayment(request: PostApplicationVerificationRequest): PostApplicationVerificationRequest {
  if (isProduction && !env.postApplicationDemoEnabled) return request;
  return withEvent({ ...request, paymentState: 'payment_failed', status: 'payment_pending' }, 'payment.pending', 'payment_pending');
}

export function advanceDemoVerification(request: PostApplicationVerificationRequest): PostApplicationVerificationRequest {
  if (isProduction && !env.postApplicationDemoEnabled) return request;
  const next = nextVerificationStatus(request.status);
  const event = statusEvent(next);
  const completed = next === 'needs_review' || next === 'verification_complete';
  return withEvent({
    ...request,
    status: next,
    completedApplicationId: completed ? demoApplicationId : request.completedApplicationId,
  }, event, next);
}

export function getPartnerSafeStatusSummary(request: PostApplicationVerificationRequest) {
  return {
    partner_id: request.partnerId,
    partner_application_id: request.partnerApplicationId,
    rental_passport_request_id: request.id,
    rental_passport_application_id: request.completedApplicationId,
    status: request.status,
    applicant_display_name: request.applicant.preferredName || request.applicant.legalName,
    property_reference: request.partnerPropertyReference,
    credit_included: request.creditIncluded,
    unresolved_issue_count: request.completedApplicationId ? 1 : 0,
    viewer_launch_reference: request.completedApplicationId
      ? `/partner/application/${request.completedApplicationId}`
      : null,
  };
}

function createDemoRequest(token: string): PostApplicationVerificationRequest {
  const payerMode: VerificationRequestPayerMode = token === 'demo-rd-landlord-pays'
    ? 'landlord_pays'
    : token === 'demo-rd-included-credit'
      ? 'included_verification_credit'
      : 'applicant_pays';
  const declined = token === 'demo-rd-declined';
  const request: PostApplicationVerificationRequest = {
    id: demoRequestId,
    invitationToken: token,
    partnerId: 'rental_district',
    partnerApplicationId: demoPartnerApplicationId,
    partnerPropertyReference: 'rd_listing_123-maple-unit-1204',
    landlordOrganizationName: 'Greenview Property Management',
    applicant: {
      legalName: 'Kathryn Casey',
      preferredName: 'Kathryn',
      email: 'kathryn.casey@example.test',
      phone: '+1 (416) 555-0148',
    },
    property: {
      address: '123 Maple St, Unit 1204, Toronto, ON',
      desiredMoveIn: '2026-08-01',
      occupants: '1 adult',
      pets: 'No pets declared',
    },
    requestedAt: '2026-07-12T14:25:00.000Z',
    expiresAt: '2026-07-26T23:59:59.000Z',
    package: 'verified_plus_credit',
    checksIncluded: [
      'Identity verification',
      'Employment and income verification',
      'Rental-history verification',
      'Reference contact',
      'Document review',
      'Credit report authorization',
      'Secure sharing with requesting landlord',
    ],
    creditIncluded: true,
    payerMode,
    applicantPriceLabel: payerMode === 'applicant_pays' ? '$45 CAD demo price' : null,
    safeImportFields: demoImportFields(),
    consents: demoConsents(),
    status: declined ? 'applicant_declined' : 'applicant_invited',
    paymentState: paymentStateFor(payerMode),
    linkedAccountMode: 'not_started',
    importConfirmedAt: null,
    completedApplicationId: null,
    events: [],
  };
  return withEvent(withEvent(request, 'verification_request.received', 'request_received'), 'applicant.invited', 'applicant_invited');
}

function demoImportFields(): ImportedApplicationField[] {
  return [
    { label: 'Legal name', value: 'Kathryn Casey', source: 'Rental District application', section: 'identity' },
    { label: 'Preferred name', value: 'Kathryn', source: 'Rental District application', section: 'identity' },
    { label: 'Email', value: 'kathryn.casey@example.test', source: 'Rental District application', section: 'identity' },
    { label: 'Phone', value: '+1 (416) 555-0148', source: 'Rental District application', section: 'identity' },
    { label: 'Current address', value: '88 Queen St W, Toronto, ON', source: 'Rental District application', section: 'application' },
    { label: 'Desired move-in', value: 'August 1, 2026', source: 'Rental District application', section: 'application' },
    { label: 'Employer', value: 'Tech Solutions Inc.', source: 'Rental District application', section: 'employment' },
    { label: 'Position', value: 'Software Engineer', source: 'Rental District application', section: 'employment' },
    { label: 'Annual income', value: '$78,000 CAD', source: 'Rental District application', section: 'employment' },
    {
      label: 'Current rental address',
      value: '123 Maple St, Toronto, ON',
      source: 'Rental District application',
      section: 'rental_history',
      conflict: {
        field: 'current_address',
        importedValue: '123 Maple St, Toronto, ON',
        existingValue: '88 Queen St W, Toronto, ON',
        resolution: 'needs_applicant_decision',
      },
    },
    { label: 'Reference', value: 'Greenview Property Management', source: 'Rental District application', section: 'references' },
    { label: 'Uploaded document', value: 'Employment letter', source: 'Rental District document upload', section: 'documents' },
  ];
}

function demoConsents(): VerificationConsentRecord[] {
  return [
    { key: 'identity_verification', label: 'I consent to identity verification.', required: true, acceptedAt: null },
    { key: 'employment_verification', label: 'I consent to employment verification.', required: true, acceptedAt: null },
    { key: 'income_document_review', label: 'I consent to income and document review.', required: true, acceptedAt: null },
    { key: 'rental_history_verification', label: 'I consent to rental-history verification.', required: true, acceptedAt: null },
    { key: 'reference_contact', label: 'I consent to reference contact.', required: true, acceptedAt: null },
    { key: 'document_review', label: 'I consent to supporting document review.', required: true, acceptedAt: null },
    { key: 'credit_authorization', label: 'I authorize credit report verification for this request.', required: true, acceptedAt: null },
    { key: 'share_results_with_partner', label: 'I consent to sharing completed verification results with Greenview Property Management and Rental District.', required: true, acceptedAt: null },
  ];
}

function paymentStatusFor(mode: VerificationRequestPayerMode): PostApplicationVerificationStatus {
  return mode === 'applicant_pays' ? 'payment_pending' : 'verification_queued';
}

function paymentStateFor(mode: VerificationRequestPayerMode): DemoPaymentState {
  if (mode === 'applicant_pays') return 'awaiting_payment';
  if (mode === 'landlord_pays') return 'payment_waived';
  return 'verification_credit_redeemed';
}

function paymentCompleteState(mode: VerificationRequestPayerMode): DemoPaymentState {
  if (mode === 'applicant_pays') return 'payment_completed';
  if (mode === 'landlord_pays') return 'payment_waived';
  return 'verification_credit_redeemed';
}

function nextVerificationStatus(status: PostApplicationVerificationStatus): PostApplicationVerificationStatus {
  const order: PostApplicationVerificationStatus[] = [
    'verification_queued',
    'verification_in_progress',
    'manual_review',
    'needs_review',
  ];
  const index = order.indexOf(status);
  if (index === -1) return 'verification_in_progress';
  return order[Math.min(index + 1, order.length - 1)];
}

function statusEvent(status: PostApplicationVerificationStatus): PartnerStatusEventName {
  if (status === 'verification_in_progress') return 'verification.started';
  if (status === 'needs_review') return 'verification.needs_review';
  if (status === 'verification_complete') return 'verification.completed';
  return 'verification.started';
}

function withEvent(
  request: PostApplicationVerificationRequest,
  event: PartnerStatusEventName,
  status: PostApplicationVerificationStatus,
): PostApplicationVerificationRequest {
  const next: PartnerStatusEvent = {
    eventId: `evt_${request.id}_${request.events.length + 1}`,
    version: '2026-07-16',
    event,
    partnerId: request.partnerId,
    partnerApplicationId: request.partnerApplicationId,
    rentalPassportRequestId: request.id,
    rentalPassportApplicationId: request.completedApplicationId,
    status,
    timestamp: new Date().toISOString(),
    safeSummary: {
      applicantDisplayName: request.applicant.preferredName || request.applicant.legalName,
      propertyReference: request.partnerPropertyReference,
      verificationPackage: request.package,
      creditIncluded: request.creditIncluded,
      unresolvedIssueCount: request.completedApplicationId ? 1 : 0,
      viewerLaunchReference: request.completedApplicationId ? `/partner/application/${request.completedApplicationId}` : null,
    },
  };
  return { ...request, status, events: [...request.events, next] };
}
