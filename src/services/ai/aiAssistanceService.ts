import type { LandlordApplicationDetail } from '@/types/sharing';
import type { VerificationCaseDetail } from '@/types/verificationPortal';
import type { AiAssistanceFinding, LandlordAssistanceSummary, ReviewerAssistanceSummary } from '@/types/launchReadiness';

export function generateLandlordPassportSummary(detail: LandlordApplicationDetail): LandlordAssistanceSummary {
  const verifiedSections = detail.sections.filter((section) => section.verificationState === 'Verified');
  const needsReview = detail.sections.filter((section) => section.verificationState !== 'Verified');

  return {
    summary: `${detail.application.applicant_name} has a Rental Passport that is ${detail.application.completeness}% complete with ${verifiedSections.length} verified section${verifiedSections.length === 1 ? '' : 's'}. This summary explains verified facts only and does not recommend approval or rejection.`,
    facts: [
      `Passport ID: ${detail.application.passport_number}.`,
      `Verification status: ${detail.application.verification_status}.`,
      `Shared access expires on ${new Date(detail.application.expires_at).toLocaleDateString()}.`,
      ...verifiedSections.map((section) => `${section.name} is marked verified.`),
    ],
    limitations: [
      'Rental Passport does not rank applicants or make rental decisions.',
      'Sensitive source documents remain view-only and cannot be downloaded.',
      needsReview.length > 0 ? `${needsReview.length} section${needsReview.length === 1 ? '' : 's'} still require review.` : 'No unverified sections are shown in this summary.',
    ],
  };
}

export function generateReviewerAssistanceSummary(detail: VerificationCaseDetail): ReviewerAssistanceSummary {
  const unchecked = detail.checklist.filter((item) => !item.checked);
  const findings = detectReviewFindings(detail);

  return {
    summary: `${detail.case.verification_type.replaceAll('_', ' ')} case for ${detail.case.applicant_name}. ${detail.checklist.length - unchecked.length} of ${detail.checklist.length} checklist items are complete. Human reviewer decision is required.`,
    outstandingItems: unchecked.map((item) => item.label),
    potentialInconsistencies: findings,
    recommendedChecklistItems: recommendedChecklist(detail.case.verification_type),
    followUpQuestions: followUpQuestions(detail),
  };
}

export function detectReviewFindings(detail: VerificationCaseDetail): AiAssistanceFinding[] {
  const findings: AiAssistanceFinding[] = [];

  if (detail.case.priority === 'urgent') {
    findings.push({
      id: 'urgent-priority',
      severity: 'review',
      title: 'Urgent priority',
      description: 'This case is marked urgent and should be reviewed before normal-priority work.',
      sectionKey: detail.case.section_key,
    });
  }

  if (detail.fraudFlags.length > 0 || detail.case.status === 'fraud_review') {
    findings.push({
      id: 'fraud-review',
      severity: 'warning',
      title: 'Fraud review required',
      description: 'Internal fraud flags or fraud review status are present. Do not expose this to landlords.',
      sectionKey: detail.case.section_key,
    });
  }

  if (detail.informationRequests.some((request) => request.status === 'open')) {
    findings.push({
      id: 'open-customer-request',
      severity: 'review',
      title: 'Open customer request',
      description: 'The tenant has an open information request. Avoid final decision until the response is reviewed.',
      sectionKey: detail.case.section_key,
    });
  }

  return findings;
}

function recommendedChecklist(verificationType: VerificationCaseDetail['case']['verification_type']) {
  const base = ['Confirm consent is present', 'Confirm evidence belongs to applicant', 'Record internal confidence notes'];
  const map: Record<VerificationCaseDetail['case']['verification_type'], string[]> = {
    identity: ['Compare legal name across ID and profile', 'Confirm ID expiry date', 'Confirm selfie consistency'],
    employment: ['Compare employer name across pay stub and profile', 'Check income dates', 'Confirm document recency'],
    rental_history: ['Compare lease address to timeline', 'Confirm landlord contact plausibility', 'Check date continuity'],
    references: ['Confirm relationship context', 'Confirm contact completeness', 'Confirm consent language'],
    credit: ['Confirm applicant name on report', 'Check report date', 'Confirm provider and tamper review'],
    fraud: ['Review duplicate indicators', 'Review document alteration indicators', 'Escalate if uncertainty remains'],
  };
  return [...base, ...map[verificationType]];
}

function followUpQuestions(detail: VerificationCaseDetail) {
  if (detail.checklist.every((item) => item.checked)) return ['Are all internal notes complete before recording the decision?'];
  return detail.checklist.filter((item) => !item.checked).slice(0, 3).map((item) => `Can the applicant provide clarification for: ${item.label}?`);
}
