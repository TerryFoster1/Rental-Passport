import type { ChangeEvent } from 'react';
import { Input } from '@/components/ui/Input';
import type { ReferenceFormData } from '@/types/references';

const categoryOptions = [
  { value: 'previous_landlord', label: 'Previous Landlord' },
  { value: 'professional', label: 'Professional' },
  { value: 'personal', label: 'Personal' },
  { value: 'property_manager', label: 'Property Manager' },
  { value: 'character_reference', label: 'Character Reference' },
  { value: 'other', label: 'Other' },
];

const relationshipOptions = [
  { value: 'employer', label: 'Employer' },
  { value: 'manager', label: 'Manager' },
  { value: 'coworker', label: 'Co-worker' },
  { value: 'previous_landlord', label: 'Previous Landlord' },
  { value: 'property_manager', label: 'Property Manager' },
  { value: 'friend', label: 'Friend' },
  { value: 'family', label: 'Family' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'client', label: 'Client' },
  { value: 'other', label: 'Other' },
];

const contactMethodOptions = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'either', label: 'Either' },
];

export function ReferenceForm({ reference, onChange }: { reference: ReferenceFormData; onChange: (key: keyof ReferenceFormData, value: string) => void }) {
  const update = (key: keyof ReferenceFormData) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => onChange(key, event.target.value);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SelectField label="Reference category" value={reference.category} onChange={update('category')} options={categoryOptions} />
      <Input label="Reference name" value={reference.reference_name} onChange={update('reference_name')} required />
      <SelectField label="Relationship" value={reference.relationship} onChange={update('relationship')} options={relationshipOptions} />
      <Input label="Company (optional)" value={reference.company} onChange={update('company')} />
      <Input label="Email" type="email" value={reference.email} onChange={update('email')} required />
      <Input label="Phone" value={reference.phone} onChange={update('phone')} required />
      <SelectField label="Preferred contact method" value={reference.preferred_contact_method} onChange={update('preferred_contact_method')} options={contactMethodOptions} />
      <Input label="Years known" type="number" min="0" step="0.5" value={reference.years_known} onChange={update('years_known')} required />
      <Input label="Country" value={reference.country} onChange={update('country')} required />
      <Input label="Province / State" value={reference.province_state} onChange={update('province_state')} required />
      <label className="block md:col-span-2">
        <span className="text-sm font-bold text-slate-700">Comments (optional)</span>
        <textarea className="mt-1 min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-navy outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={reference.comments} onChange={update('comments')} />
      </label>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (event: ChangeEvent<HTMLSelectElement>) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <select className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-navy outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
