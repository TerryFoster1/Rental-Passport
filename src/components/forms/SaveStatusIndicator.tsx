import { CheckCircle2, Clock3 } from 'lucide-react';

export function SaveStatusIndicator({ state }: { state: 'idle' | 'saving' | 'saved' }) {
  if (state === 'idle') return null;

  const isSaved = state === 'saved';
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
      {isSaved ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock3 className="h-4 w-4 text-blue-700" />}
      {isSaved ? 'Saved' : 'Saving'}
    </span>
  );
}
