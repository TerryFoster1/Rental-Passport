import { CheckCircle2, Clock3, FileWarning, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { PassportSummary } from '@/types/passport';

export function PassportProgressCard({ progress }: { progress: PassportSummary['progress'] }) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-blue-700">Passport Completeness</p>
          <h2 className="mt-2 text-3xl font-black">Your passport is {progress.overall}% complete</h2>
          <p className="mt-2 max-w-2xl text-slate-700">Completeness only measures whether your passport sections are filled out and verified. It is not a tenant score.</p>
        </div>
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-8 border-blue-100 text-2xl font-black text-blue-700">{progress.overall}%</div>
      </div>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress.overall}%` }} />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ProgressFact icon={<CheckCircle2 />} label="Complete Sections" value={progress.completeSections} />
        <ProgressFact icon={<ShieldCheck />} label="Verified Sections" value={progress.verifiedSections} />
        <ProgressFact icon={<FileWarning />} label="Missing Sections" value={progress.missingSections} />
        <ProgressFact icon={<Clock3 />} label="Needs Reverification" value={progress.needsReverificationSections} />
      </div>
    </Card>
  );
}

function ProgressFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-blue-700 [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <strong className="mt-3 block text-2xl font-black">{value}</strong>
      <span className="text-sm text-slate-600">{label}</span>
    </div>
  );
}
