import type { CreditProviderKey, CreditVerificationRequestStatus } from '@/types/creditReport';

export function creditProviderLabel(provider: CreditProviderKey) {
  const labels: Record<CreditProviderKey, string> = {
    singlekey: 'SingleKey',
    frontlobby: 'FrontLobby',
    equifax: 'Equifax',
    transunion: 'TransUnion',
    manual_review: 'Manual Review',
  };
  return labels[provider];
}

export function creditStatusLabel(status: CreditVerificationRequestStatus) {
  const labels: Record<CreditVerificationRequestStatus, string> = {
    draft: 'In Progress',
    ready_for_review: 'Ready for Review',
    under_review: 'Under Review',
    verified: 'Verified',
    needs_more_information: 'Needs More Information',
    needs_reverification: 'Needs Reverification',
    expired: 'Expired',
  };
  return labels[status];
}
