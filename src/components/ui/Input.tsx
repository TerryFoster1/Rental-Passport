import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ className, label, error, id, ...props }: InputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        id={inputId}
        className={cn('mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-navy outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100', error && 'border-red-400 focus:border-red-500 focus:ring-red-100', className)}
        {...props}
      />
      {error && <span className="mt-1 block text-sm font-semibold text-red-600">{error}</span>}
    </label>
  );
}
