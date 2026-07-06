import type { ChangeEvent } from 'react';
import { Input } from '@/components/ui/Input';
import type { RentalHistoryRecordForm } from '@/types/rentalHistory';

export function DateRangeFields({ record, onChange }: { record: RentalHistoryRecordForm; onChange: (key: keyof RentalHistoryRecordForm, value: string | boolean) => void }) {
  const update = (key: keyof RentalHistoryRecordForm) => (event: ChangeEvent<HTMLInputElement>) => onChange(key, event.target.value);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="Move-in date" type="date" value={record.move_in_date} onChange={update('move_in_date')} required />
      <Input label="Move-out date" type="date" value={record.move_out_date} onChange={update('move_out_date')} disabled={record.is_current_residence} />
      <label className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 md:col-span-2">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          checked={record.is_current_residence}
          onChange={(event) => onChange('is_current_residence', event.target.checked)}
        />
        <span>
          <span className="block font-bold text-navy">Current residence</span>
          <span className="mt-1 block text-sm text-slate-600">Leave move-out date blank while you still live here.</span>
        </span>
      </label>
    </div>
  );
}
