import type { PassportSectionStatus, PassportVerificationState } from '@/types/passport';

export function sectionStatusLabel(status: PassportSectionStatus) {
  const labels: Record<PassportSectionStatus, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    ready_for_review: 'Ready for Review',
    under_review: 'Under Review',
    verified: 'Verified',
    needs_more_information: 'Needs More Information',
    needs_reverification: 'Needs Reverification',
    expired: 'Expired',
  };
  return labels[status];
}

export function verificationStateLabel(state: PassportVerificationState) {
  const labels: Record<PassportVerificationState, string> = {
    unverified: 'Unverified',
    pending_review: 'Pending Review',
    under_review: 'Under Review',
    verified: 'Verified',
    needs_more_information: 'Needs More Information',
    needs_reverification: 'Needs Reverification',
    expired: 'Expired',
    unable_to_verify: 'Unable to Verify',
  };
  return labels[state];
}
