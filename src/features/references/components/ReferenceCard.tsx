import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ReferenceFormData } from '@/types/references';
import { ContactMethodBadge } from './ContactMethodBadge';
import { referenceCategoryLabel } from './referenceLabels';
import { RelationshipBadge } from './RelationshipBadge';

export function ReferenceCard({ reference, index, selected, onSelect, onRemove }: { reference: ReferenceFormData; index: number; selected: boolean; onSelect: () => void; onRemove: () => void }) {
  const label = reference.reference_name || `Reference ${index + 1}`;

  return (
    <Card className={selected ? 'border-blue-300 bg-blue-50/40 p-4' : 'p-4'}>
      <div className="flex items-start justify-between gap-3">
        <button className="text-left" onClick={onSelect}>
          <strong className="block">{label}</strong>
          <span className="mt-1 block text-sm text-slate-600">{referenceCategoryLabel(reference.category)}</span>
          <div className="mt-3 flex flex-wrap gap-2">
            <RelationshipBadge relationship={reference.relationship} />
            <ContactMethodBadge method={reference.preferred_contact_method} />
          </div>
        </button>
        <Button variant="ghost" onClick={onRemove} aria-label={`Remove ${label}`}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
