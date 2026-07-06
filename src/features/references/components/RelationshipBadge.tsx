import { Badge } from '@/components/ui/Badge';
import type { ReferenceRelationship } from '@/types/references';
import { referenceRelationshipLabel } from './referenceLabels';

export function RelationshipBadge({ relationship }: { relationship: ReferenceRelationship }) {
  return <Badge tone="blue">{referenceRelationshipLabel(relationship)}</Badge>;
}
