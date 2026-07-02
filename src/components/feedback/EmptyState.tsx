import type { LucideIcon } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function EmptyState({ title, description, icon: Icon = FileText, action }: { title: string; description: string; icon?: LucideIcon; action?: React.ReactNode }) {
  return (
    <Card className="p-8 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-xl font-black">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-slate-700">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}
