import type { ChangeEvent } from 'react';
import { Input } from '@/components/ui/Input';
import type { RentalHistoryRecordForm } from '@/types/rentalHistory';

export function AddressFields({ record, onChange }: { record: RentalHistoryRecordForm; onChange: (key: keyof RentalHistoryRecordForm, value: string) => void }) {
  const update = (key: keyof RentalHistoryRecordForm) => (event: ChangeEvent<HTMLInputElement>) => onChange(key, event.target.value);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="Property address" value={record.property_address} onChange={update('property_address')} required />
      <Input label="Unit number" value={record.unit_number} onChange={update('unit_number')} />
      <Input label="City" value={record.city} onChange={update('city')} required />
      <Input label="Province/State" value={record.province_state} onChange={update('province_state')} required />
      <Input label="Country" value={record.country} onChange={update('country')} required />
      <Input label="Postal/ZIP code" value={record.postal_code} onChange={update('postal_code')} required />
    </div>
  );
}
