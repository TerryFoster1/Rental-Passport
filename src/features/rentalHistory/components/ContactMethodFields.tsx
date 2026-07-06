import type { ChangeEvent } from 'react';
import { Input } from '@/components/ui/Input';
import type { RentalHistoryRecordForm } from '@/types/rentalHistory';

const relationshipOptions = [
  { value: 'landlord', label: 'Landlord' },
  { value: 'property_manager', label: 'Property Manager' },
  { value: 'building_manager', label: 'Building Manager' },
  { value: 'leasing_office', label: 'Leasing Office' },
  { value: 'other', label: 'Other' },
];

export function ContactMethodFields({ record, onChange }: { record: RentalHistoryRecordForm; onChange: (key: keyof RentalHistoryRecordForm, value: string) => void }) {
  const update = (key: keyof RentalHistoryRecordForm) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange(key, event.target.value);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="Landlord or property manager name" value={record.manager_name} onChange={update('manager_name')} required />
      <Input label="Landlord/property manager email" type="email" value={record.manager_email} onChange={update('manager_email')} required />
      <Input label="Landlord/property manager phone" value={record.manager_phone} onChange={update('manager_phone')} />
      <label className="block">
        <span className="text-sm font-bold text-slate-700">Relationship type</span>
        <select className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-navy outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={record.relationship_type} onChange={update('relationship_type')}>
          {relationshipOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
