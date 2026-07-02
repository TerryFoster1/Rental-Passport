import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertProps = {
  title?: string;
  children: React.ReactNode;
  tone?: 'info' | 'success' | 'error';
};

export function Alert({ title, children, tone = 'info' }: AlertProps) {
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'error' ? AlertCircle : Info;
  const tones = {
    info: 'border-blue-200 bg-blue-50 text-blue-950',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    error: 'border-red-200 bg-red-50 text-red-950',
  };
  return (
    <div className={cn('rounded-xl border p-4', tones[tone])}>
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          {title && <strong className="block">{title}</strong>}
          <div className="text-sm leading-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
