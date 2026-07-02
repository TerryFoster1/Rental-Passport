import { Badge } from '@/components/ui/Badge';
import type { PassportVerificationState } from '@/types/passport';
import { verificationStateLabel } from './passportLabels';

export function VerificationStatusBadge({ state }: { state: PassportVerificationState }) {
  const tone = state === 'verified' ? 'green' : state === 'pending_review' ? 'orange' : state === 'needs_reverification' ? 'red' : 'slate';
  return <Badge tone={tone}>{verificationStateLabel(state)}</Badge>;
}
