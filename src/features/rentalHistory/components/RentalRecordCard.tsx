import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { RentalHistoryRecordForm } from '@/types/rentalHistory';

export function RentalRecordCard({ record, index, selected, onSelect, onRemove }: { record: RentalHistoryRecordForm; index: number; selected: boolean; onSelect: () => void; onRemove: () => void }) {
  const label = record.property_address || `Rental record ${index + 1}`;
  const location = [record.city, record.province_state].filter(Boolean).join(', ') || 'Address pending';

  return (
    <Card className={selected ? 'border-blue-300 bg-blue-50/40 p-4' : 'p-4'}>
      <div className="flex items-start justify-between gap-3">
        <button className="text-left" onClick={onSelect}>
          <strong className="block">{label}</strong>
          <span className="mt-1 block text-sm text-slate-600">{location}</span>
          <span className="mt-1 block text-xs font-bold uppercase text-slate-500">{record.is_current_residence ? 'Current Residence' : 'Past Residence'}</span>
        </button>
        <Button variant="ghost" onClick={onRemove} aria-label={`Remove ${label}`}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
