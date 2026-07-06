import { VerificationReadinessCard } from '@/components/forms/VerificationReadinessCard';
import type { IdentitySignal } from '@/types/identity';

export function IdentityReadinessChecklist({ signals }: { signals: IdentitySignal[] }) {
  return <VerificationReadinessCard signals={signals} />;
}
