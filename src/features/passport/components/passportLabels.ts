import type { PassportSectionStatus, PassportVerificationState } from '@/types/passport';

export function sectionStatusLabel(status: PassportSectionStatus) {
  const labels: Record<PassportSectionStatus, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    ready_for_review: 'Ready for Review',
    verified: 'Verified',
    needs_reverification: 'Needs Reverification',
  };
  return labels[status];
}

export function verificationStateLabel(state: PassportVerificationState) {
  const labels: Record<PassportVerificationState, string> = {
    unverified: 'Unverified',
    pending_review: 'Pending Review',
    verified: 'Verified',
    needs_reverification: 'Needs Reverification',
  };
  return labels[state];
}
