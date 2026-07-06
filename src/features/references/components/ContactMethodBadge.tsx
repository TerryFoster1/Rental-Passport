import { Badge } from '@/components/ui/Badge';
import type { ReferenceContactMethod } from '@/types/references';
import { contactMethodLabel } from './referenceLabels';

export function ContactMethodBadge({ method }: { method: ReferenceContactMethod }) {
  return <Badge tone="slate">{contactMethodLabel(method)}</Badge>;
}
