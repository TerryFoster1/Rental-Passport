import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

export function FormSectionCard({ title, description, children, aside }: { title: string; description?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </Card>
  );
}
