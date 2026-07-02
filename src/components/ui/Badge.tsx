import type { HTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'green' | 'blue' | 'orange' | 'red' | 'slate' | 'purple';
};

export function Badge({ className, tone = 'green', ...props }: BadgeProps) {
  const tones = {
    green: 'bg-emerald-100 text-emerald-800',
    blue: 'bg-blue-100 text-blue-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800',
    slate: 'bg-slate-100 text-slate-700',
    purple: 'bg-violet-100 text-violet-800',
  };
  return <span className={cn('inline-flex w-fit rounded-full px-3 py-1 text-xs font-black uppercase', tones[tone], className)} {...props} />;
}

export function VerifiedBadge({ label = 'Verified' }: { label?: string }) {
  return (
    <Badge tone="green" className="items-center gap-1">
      <Check className="h-3 w-3" />
      {label}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone = status.toLowerCase().includes('pending') || status.toLowerCase().includes('review') ? 'orange' : status.toLowerCase().includes('verified') || status.toLowerCase().includes('active') ? 'green' : 'slate';
  return <Badge tone={tone}>{status}</Badge>;
}
