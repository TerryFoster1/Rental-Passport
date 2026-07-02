import { Clock3 } from 'lucide-react';
import type { PassportActivity } from '@/types/passport';

export function ActivityLogItem({ activity }: { activity: PassportActivity }) {
  return (
    <li className="flex gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
        <Clock3 className="h-4 w-4" />
      </div>
      <div>
        <p className="font-black">{activity.description}</p>
        <p className="mt-1 text-sm text-slate-600">{new Date(activity.created_at).toLocaleString()}</p>
      </div>
    </li>
  );
}
