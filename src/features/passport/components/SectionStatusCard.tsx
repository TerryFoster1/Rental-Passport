import { Card } from '@/components/ui/Card';
import type { PassportSection } from '@/types/passport';
import { CompletenessBadge } from './CompletenessBadge';
import { sectionStatusLabel } from './passportLabels';
import { VerificationStatusBadge } from './VerificationStatusBadge';

export function SectionStatusCard({ section }: { section: PassportSection }) {
  return (
    <Card className="p-6">
      <p className="text-sm font-black uppercase text-blue-700">Current Status</p>
      <h2 className="mt-2 text-2xl font-black">{section.name}</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">{sectionStatusLabel(section.status)}</span>
        <VerificationStatusBadge state={section.verification_state} />
        <CompletenessBadge value={section.progress} />
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${section.progress}%` }} />
      </div>
      <p className="mt-4 text-sm text-slate-600">Last updated: {section.last_updated_at ? new Date(section.last_updated_at).toLocaleDateString() : 'Not yet updated'}</p>
    </Card>
  );
}
