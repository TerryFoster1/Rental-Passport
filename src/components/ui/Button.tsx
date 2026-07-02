import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export function Button({ className, variant = 'secondary', type = 'button', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 text-white shadow-soft hover:bg-blue-700',
    secondary: 'border border-slate-200 bg-white text-navy hover:border-blue-300 hover:bg-blue-50',
    ghost: 'text-slate-700 hover:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      type={type}
      className={cn('inline-flex items-center justify-center rounded-lg px-4 py-2.5 font-black transition disabled:cursor-not-allowed disabled:opacity-60', variants[variant], className)}
      {...props}
    />
  );
}
