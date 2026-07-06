import { LockKeyhole } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function ConsentNotice() {
  return (
    <Card className="p-5">
      <div className="flex gap-3">
        <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-blue-700" />
        <p className="text-sm leading-6 text-slate-700">
          Credit reports are sensitive. Rental Passport stores credit documents privately, never creates public file links, and prepares only a trusted summary for future landlord sharing.
        </p>
      </div>
    </Card>
  );
}
