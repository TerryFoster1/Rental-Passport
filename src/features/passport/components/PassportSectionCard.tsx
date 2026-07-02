import { ArrowRight, BriefcaseBusiness, Gauge, Home, IdCard, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { PassportSection } from '@/types/passport';
import { CompletenessBadge } from './CompletenessBadge';
import { sectionStatusLabel } from './passportLabels';
import { VerificationStatusBadge } from './VerificationStatusBadge';

export function PassportSectionCard({ section, onNavigate }: { section: PassportSection; onNavigate: (path: string) => void }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">{sectionIcon(section.key)}</div>
        <VerificationStatusBadge state={section.verification_state} />
      </div>
      <h2 className="mt-5 text-xl font-black">{section.name}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-700">{section.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <CompletenessBadge value={section.progress} />
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">{sectionStatusLabel(section.status)}</span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600" style={{ width: `${section.progress}%` }} />
      </div>
      <Button className="mt-6 w-full justify-between" onClick={() => onNavigate(section.route)}>
        Open Section
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Card>
  );
}

function sectionIcon(key: PassportSection['key']) {
  const icons = {
    rental_history: <Home className="h-6 w-6" />,
    employment: <BriefcaseBusiness className="h-6 w-6" />,
    references: <UsersRound className="h-6 w-6" />,
    credit_report: <Gauge className="h-6 w-6" />,
    identity_confirmation: <IdCard className="h-6 w-6" />,
  };
  return icons[key];
}
