import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function SectionCard({ icon: Icon, title, description, footer }: { icon: LucideIcon; title: string; description: string; footer?: React.ReactNode }) {
  return (
    <Card className="p-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-xl font-black">{title}</h2>
      <p className="mt-2 text-slate-700">{description}</p>
      {footer && <div className="mt-5">{footer}</div>}
    </Card>
  );
}
