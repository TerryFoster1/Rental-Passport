import { env, isProduction } from '@/lib/env';
import type {
  PartnerApplicationViewerData,
  PartnerSafeApplicationSummary,
  PartnerViewerTokenSession,
  PartnerViewerValidation,
  VerificationDisplayStatus,
} from '@/types/partnerApplication';

const demoApplicationId = 'demo-rp-app-001';
const demoPartnerId = 'rental_district';
const requiredViewerScope = 'applications.viewer.read';

const demoSessions: Record<string, PartnerViewerTokenSession> = {
  'demo-valid-rental-district': {
    tokenId: 'demo-valid-rental-district',
    partnerId: demoPartnerId,
    applicationId: demoApplicationId,
    landlordUserId: 'rd-landlord-demo-001',
    scopes: [requiredViewerScope, 'applications.summary.read', 'applications.actions.request_info'],
    expiresAt: '2026-12-31T23:59:59.000Z',
    revokedAt: null,
    origin: 'https://rentaldistrict.ca',
    mode: 'embed',
  },
  'demo-expired-rental-district': {
    tokenId: 'demo-expired-rental-district',
    partnerId: demoPartnerId,
    applicationId: demoApplicationId,
    landlordUserId: 'rd-landlord-demo-001',
    scopes: [requiredViewerScope],
    expiresAt: '2026-01-01T00:00:00.000Z',
    revokedAt: null,
    origin: 'https://rentaldistrict.ca',
    mode: 'embed',
  },
  'demo-revoked-rental-district': {
    tokenId: 'demo-revoked-rental-district',
    partnerId: demoPartnerId,
    applicationId: demoApplicationId,
    landlordUserId: 'rd-landlord-demo-001',
    scopes: [requiredViewerScope],
    expiresAt: '2026-12-31T23:59:59.000Z',
    revokedAt: '2026-07-01T12:00:00.000Z',
    origin: 'https://rentaldistrict.ca',
    mode: 'embed',
  },
  'demo-wrong-partner': {
    tokenId: 'demo-wrong-partner',
    partnerId: 'unknown_partner',
    applicationId: demoApplicationId,
    landlordUserId: 'unknown-landlord',
    scopes: [requiredViewerScope],
    expiresAt: '2026-12-31T23:59:59.000Z',
    revokedAt: null,
    origin: 'https://unknown.example',
    mode: 'embed',
  },
  'demo-wrong-scope': {
    tokenId: 'demo-wrong-scope',
    partnerId: demoPartnerId,
    applicationId: demoApplicationId,
    landlordUserId: 'rd-landlord-demo-001',
    scopes: ['applications.summary.read'],
    expiresAt: '2026-12-31T23:59:59.000Z',
    revokedAt: null,
    origin: 'https://rentaldistrict.ca',
    mode: 'embed',
  },
  'demo-wrong-application': {
    tokenId: 'demo-wrong-application',
    partnerId: demoPartnerId,
    applicationId: 'demo-other-application',
    landlordUserId: 'rd-landlord-demo-001',
    scopes: [requiredViewerScope],
    expiresAt: '2026-12-31T23:59:59.000Z',
    revokedAt: null,
    origin: 'https://rentaldistrict.ca',
    mode: 'embed',
  },
};

export function getDemoPartnerLaunchUrl() {
  return `/partner/application/${demoApplicationId}?launch_token=demo-valid-rental-district`;
}

export function validatePartnerViewerLaunch(applicationId: string, token: string | null): PartnerViewerValidation {
  if (!token) {
    return { status: 'missing_token', message: 'A short-lived Rental Passport viewer token is required.' };
  }

  const demoAllowed = !isProduction || env.partnerViewerDemoEnabled;
  if (!demoAllowed && token.startsWith('demo-')) {
    return { status: 'demo_disabled', message: 'Demo viewer tokens are disabled in production.' };
  }

  const session = demoSessions[token];
  if (!session) {
    return { status: 'invalid_token', message: 'This viewer token is invalid or cannot be verified.' };
  }

  if (session.revokedAt) {
    return { status: 'revoked_token', message: 'This viewer session was revoked by Rental Passport.' };
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    return { status: 'expired_token', message: 'This viewer session has expired. Request a new launch from the partner platform.' };
  }

  if (session.partnerId !== demoPartnerId) {
    return { status: 'wrong_partner', message: 'This token was not issued for an approved Rental Passport partner.' };
  }

  if (!session.scopes.includes(requiredViewerScope)) {
    return { status: 'wrong_scope', message: 'This token does not include permission to open the authoritative application viewer.' };
  }

  if (session.applicationId !== applicationId || applicationId !== demoApplicationId) {
    return { status: 'wrong_application', message: 'This token is not scoped to the requested application.' };
  }

  return { status: 'valid', session };
}

export function getPartnerApplicationViewerData(applicationId: string): PartnerApplicationViewerData | null {
  if (applicationId !== demoApplicationId) return null;
  return demoApplication;
}

export function getPartnerSafeApplicationSummary(applicationId: string): PartnerSafeApplicationSummary | null {
  const application = getPartnerApplicationViewerData(applicationId);
  if (!application) return null;

  const status = (label: string): VerificationDisplayStatus =>
    application.statuses.find((item) => item.label === label)?.status ?? 'Missing';

  return {
    application_id: application.applicationId,
    rental_passport_account_id: application.rentalPassportAccountId,
    applicant_display_name: application.applicant.preferredName || application.applicant.legalName,
    partner_id: application.partner.id,
    partner_property_reference: application.property.partnerPropertyReference,
    submitted_at: application.property.appliedAt,
    completeness_status: application.completeness.label,
    identity_status: status('Identity'),
    employment_status: status('Employment'),
    references_status: status('References'),
    rental_history_status: status('Rental History'),
    credit_included: status('Credit') !== 'Missing',
    unresolved_issue_count: application.completeness.unresolvedItems,
    viewer_launch_path: `/partner/application/${application.applicationId}`,
    current_application_state: 'under_review',
  };
}

export function postPartnerViewerEvent(event: 'viewer.closed' | 'application.updated' | 'auth.expired', payload: Record<string, string>) {
  if (typeof window === 'undefined') return;
  const allowedOrigins = ['https://rentaldistrict.ca', 'https://www.rentaldistrict.ca', 'http://localhost:5000', 'http://127.0.0.1:5000'];
  const referrerOrigin = safeOrigin(document.referrer);
  if (!referrerOrigin || !allowedOrigins.includes(referrerOrigin)) return;
  window.parent?.postMessage({ source: 'rentalpassport.io', event, version: '2026-07-16', payload }, referrerOrigin);
}

function safeOrigin(value: string) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const demoApplication: PartnerApplicationViewerData = {
  applicationId: demoApplicationId,
  rentalPassportAccountId: 'rp_acct_demo_kathryn_casey',
  applicant: {
    legalName: 'Kathryn Casey',
    preferredName: 'Kathryn',
    email: 'kathryn.casey@example.test',
    phone: '+1 (416) 555-0148',
    dateOfBirth: '1994-05-17',
    currentAddress: '88 Queen St W, Toronto, ON',
  },
  partner: {
    id: demoPartnerId,
    name: 'Rental District',
    contextLabel: 'Opened from Rental District',
    returnUrl: 'https://rentaldistrict.ca/applications/demo-rp-app-001',
  },
  property: {
    partnerPropertyReference: 'rd_listing_123-maple-unit-1204',
    address: '123 Maple St, Unit 1204, Toronto, ON',
    appliedAt: '2026-07-12T14:15:00.000Z',
    desiredMoveIn: '2026-08-01',
    leaseTerm: '12 months',
    occupants: '1 adult',
    pets: 'No pets declared',
    smoking: 'Non-smoking household',
    parking: '1 parking space requested',
    emergencyContact: 'Maya Casey, sister, +1 (416) 555-0198',
  },
  completeness: {
    label: 'Complete with one item needing review',
    percent: 96,
    consentStatus: 'Verified directly',
    lastUpdated: '2026-07-12T15:08:00.000Z',
    unresolvedItems: 1,
    missingItems: 0,
  },
  statuses: [
    { label: 'Identity', status: 'Verified directly', detail: 'Government ID, email, and phone were matched to the applicant profile.' },
    { label: 'Employment', status: 'Verified directly', detail: 'Employer confirmation matched the employment letter and pay records.' },
    { label: 'Income', status: 'Verified by document', detail: 'Income documents are consistent with stated employment and pay frequency.' },
    { label: 'References', status: 'Verified directly', detail: 'Two landlord references and one professional reference responded.' },
    { label: 'Rental History', status: 'Verified directly', detail: 'Prior tenancy dates and payment summaries were confirmed.' },
    { label: 'Credit', status: 'Verified by document', detail: 'Credit summary was verified from a tenant-consented report.' },
    { label: 'Documents', status: 'Needs review', detail: 'One uploaded bank document has a cropped final page and needs replacement.' },
  ],
  issues: [
    {
      id: 'issue-bank-doc-crop',
      severity: 'action_required',
      title: 'Bank document page needs replacement',
      detail: 'The last page of one optional bank statement upload is cropped. Income verification is still complete from pay stubs and employer confirmation.',
      owner: 'tenant',
    },
  ],
  sections: [
    {
      key: 'summary',
      title: 'Application Summary',
      status: 'Needs review',
      summary: 'Application is complete, consented, and ready for landlord review. One optional supporting document needs replacement.',
      lastUpdated: '2026-07-12T15:08:00.000Z',
      evidence: [
        { label: 'Completeness', value: '96%', status: 'Verified by document' },
        { label: 'Unresolved items', value: '1 optional document item', status: 'Needs review' },
        { label: 'Missing items', value: '0', status: 'Verified' },
      ],
    },
    {
      key: 'applicant',
      title: 'Applicant Information',
      status: 'Verified directly',
      summary: 'Legal identity, contact details, application occupants, and move-in preferences are present.',
      lastUpdated: '2026-07-12T14:16:00.000Z',
      evidence: [
        { label: 'Legal name', value: 'Kathryn Casey', status: 'Verified directly' },
        { label: 'Current address', value: '88 Queen St W, Toronto, ON', status: 'Verified by document' },
        { label: 'Desired move-in', value: 'August 1, 2026', status: 'Self-declared' },
        { label: 'Emergency contact', value: 'Maya Casey', status: 'Self-declared' },
      ],
    },
    {
      key: 'employment-income',
      title: 'Employment & Income',
      status: 'Verified directly',
      summary: 'Employment and stated income were verified through employer contact and documents.',
      lastUpdated: '2026-07-12T13:02:00.000Z',
      evidence: [
        { label: 'Employer', value: 'Tech Solutions Inc.', status: 'Verified directly' },
        { label: 'Role', value: 'Software Engineer', status: 'Verified directly' },
        { label: 'Employment type', value: 'Full-time', status: 'Verified directly' },
        { label: 'Stated annual income', value: '$78,000 CAD', status: 'Verified by document' },
        { label: 'Start date', value: '2024-04-15', status: 'Verified by document' },
        { label: 'Employer contact', value: 'hr@techsolutions.example.test', status: 'Verified directly' },
      ],
    },
    {
      key: 'rental-history',
      title: 'Rental History',
      status: 'Verified directly',
      summary: 'Two prior tenancies covering more than 24 months were verified with landlord contacts and lease records.',
      lastUpdated: '2026-07-11T18:45:00.000Z',
      evidence: [
        { label: '123 Maple St', value: 'May 2023 to present, $2,150/month', status: 'Verified directly' },
        { label: '45 Oak Ave', value: 'Jan 2021 to Apr 2023, $1,950/month', status: 'Verified directly' },
        { label: 'Payment history', value: 'No late payments reported by references', status: 'Verified directly' },
        { label: 'Reason for leaving', value: 'Looking for larger unit closer to work', status: 'Self-declared' },
      ],
    },
    {
      key: 'references',
      title: 'References',
      status: 'Verified directly',
      summary: 'References responded through direct contact and structured questions.',
      lastUpdated: '2026-07-10T11:30:00.000Z',
      evidence: [
        { label: 'Greenview Property Management', value: 'Previous landlord reference confirmed', status: 'Verified directly' },
        { label: 'Oak Residential Group', value: 'Previous landlord reference confirmed', status: 'Verified directly' },
        { label: 'Priya Desai', value: 'Professional reference responded', status: 'Verified directly' },
      ],
    },
    {
      key: 'credit',
      title: 'Credit',
      status: 'Verified by document',
      summary: 'Tenant consented to credit verification. Landlord receives a summary only, not the full report.',
      lastUpdated: '2026-07-09T16:10:00.000Z',
      evidence: [
        { label: 'Provider', value: 'SingleKey demo provider', status: 'Verified by document' },
        { label: 'Date pulled', value: '2026-07-09', status: 'Verified by document' },
        { label: 'Freshness', value: 'Expires 2026-10-09', status: 'Verified by document' },
        { label: 'Key indicators', value: 'No collections; payment history reported as on time', status: 'Verified by document' },
      ],
    },
    {
      key: 'verification-fraud',
      title: 'Verification & Document Review',
      status: 'Needs review',
      summary: 'Checks are explainable and evidence-scoped. One optional document issue remains open.',
      lastUpdated: '2026-07-12T15:08:00.000Z',
      evidence: [
        { label: 'Identity match', value: 'Name and profile details matched ID record', status: 'Verified directly' },
        { label: 'Employer domain', value: 'Employer email domain matched submitted employer details', status: 'Verified directly' },
        { label: 'Document consistency', value: 'Income documents consistent; optional bank page cropped', status: 'Needs review' },
        { label: 'Manual review', value: 'Reviewer marked application review-ready with one optional request', status: 'Needs review' },
      ],
    },
  ],
  documents: [
    { id: 'doc-id', name: 'Government ID', category: 'Identity', uploadedAt: '2026-07-08', expiresAt: '2030-05-17', status: 'Verified directly', access: 'summary_only' },
    { id: 'doc-employment-letter', name: 'Employment letter', category: 'Employment', uploadedAt: '2026-07-08', expiresAt: null, status: 'Verified by document', access: 'view_permitted' },
    { id: 'doc-pay-stubs', name: 'Pay stubs', category: 'Income', uploadedAt: '2026-07-08', expiresAt: null, status: 'Verified by document', access: 'view_permitted' },
    { id: 'doc-bank', name: 'Optional bank document', category: 'Income support', uploadedAt: '2026-07-09', expiresAt: null, status: 'Needs review', access: 'summary_only' },
    { id: 'doc-credit', name: 'Credit report summary', category: 'Credit', uploadedAt: '2026-07-09', expiresAt: '2026-10-09', status: 'Verified by document', access: 'summary_only' },
  ],
  declarations: [
    { label: 'Application information declared accurate by applicant', acceptedAt: '2026-07-12T14:11:00.000Z' },
    { label: 'Rental Passport sharing consent accepted', acceptedAt: '2026-07-12T14:12:00.000Z' },
    { label: 'Credit summary sharing consent accepted', acceptedAt: '2026-07-12T14:13:00.000Z' },
    { label: 'Verification and manual review consent accepted', acceptedAt: '2026-07-12T14:14:00.000Z' },
  ],
  audit: [
    { label: 'Application submitted from Rental District', timestamp: '2026-07-12T14:15:00.000Z', actor: 'Kathryn Casey' },
    { label: 'Partner viewer session issued', timestamp: '2026-07-12T14:16:30.000Z', actor: 'Rental Passport' },
    { label: 'Manual reviewer completed summary review', timestamp: '2026-07-12T15:08:00.000Z', actor: 'Verification reviewer' },
  ],
};
