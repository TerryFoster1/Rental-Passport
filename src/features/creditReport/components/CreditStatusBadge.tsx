import { Badge } from '@/components/ui/Badge';
import type { CreditVerificationRequestStatus } from '@/types/creditReport';
import { creditStatusLabel } from './creditLabels';

export function CreditStatusBadge({ status }: { status: CreditVerificationRequestStatus }) {
  const tone = status === 'verified' ? 'green' : status === 'ready_for_review' || status === 'under_review' ? 'orange' : status === 'needs_reverification' || status === 'expired' ? 'red' : 'slate';
  return <Badge tone={tone}>{creditStatusLabel(status)}</Badge>;
}
