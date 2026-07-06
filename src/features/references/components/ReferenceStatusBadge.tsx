import { Badge } from '@/components/ui/Badge';
import type { ReferenceVerificationRequestStatus } from '@/types/references';
import { referenceStatusLabel } from './referenceLabels';

export function ReferenceStatusBadge({ status }: { status: ReferenceVerificationRequestStatus }) {
  const tone = status === 'verified' ? 'green' : status === 'ready_for_review' || status === 'under_review' ? 'orange' : status === 'needs_reverification' || status === 'expired' ? 'red' : 'slate';
  return <Badge tone={tone}>{referenceStatusLabel(status)}</Badge>;
}
