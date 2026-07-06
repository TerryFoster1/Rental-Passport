import type { InputHTMLAttributes, ReactNode } from 'react';

type ConsentCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  description?: string;
};

export function ConsentCheckbox({ label, description, ...props }: ConsentCheckboxProps) {
  return (
    <label className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" {...props} />
      <span>
        <span className="block font-bold text-navy">{label}</span>
        {description && <span className="mt-1 block text-sm leading-6 text-slate-600">{description}</span>}
      </span>
    </label>
  );
}
