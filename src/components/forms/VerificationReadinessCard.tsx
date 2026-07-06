import { CheckCircle2, Circle, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export type ReadinessSignal = {
  label: string;
  complete: boolean;
};

export function VerificationReadinessCard({ signals }: { signals: ReadinessSignal[] }) {
  const completeCount = signals.filter((signal) => signal.complete).length;
  const ready = signals.length > 0 && signals.every((signal) => signal.complete);

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-black">Verification Readiness</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Employment verification builds confidence from multiple signals. No single signal is treated as absolute proof.
          </p>
        </div>
      </div>
      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <strong>{completeCount} of {signals.length} signals ready</strong>
        <div className="mt-3 space-y-3">
          {signals.map((signal) => (
            <div key={signal.label} className="flex items-center gap-2 text-sm">
              {signal.complete ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-slate-400" />}
              <span className={signal.complete ? 'font-semibold text-navy' : 'text-slate-600'}>{signal.label}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-700">{ready ? 'This section is ready to submit for review.' : 'Complete the required signals before requesting review.'}</p>
    </Card>
  );
}
