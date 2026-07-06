import { CalendarClock, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import type { CreditReportRecord } from '@/types/creditReport';
import { CreditStatusBadge } from './CreditStatusBadge';

export function CreditSummaryCard({ report, sectionStatus, progress }: { report: CreditReportRecord | null; sectionStatus: string; progress: number }) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-black">Credit Report Summary</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">Verification confirms report authenticity and ownership. It does not recommend acceptance or rejection.</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <StatusBadge status={sectionStatus} />
        <Badge tone="blue">{progress}% Complete</Badge>
        <CreditStatusBadge status={report?.verification_request_status ?? 'draft'} />
        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <p className="flex items-center gap-2 font-semibold text-navy"><CalendarClock className="h-4 w-4 text-blue-700" />Report date</p>
          <p className="mt-1">{report?.report_date ? new Date(report.report_date).toLocaleDateString() : 'Not provided yet'}</p>
          <p className="mt-3 font-semibold text-navy">Expiration</p>
          <p className="mt-1">{report?.report_expires_at ? new Date(report.report_expires_at).toLocaleDateString() : 'Set after review'}</p>
        </div>
      </div>
    </Card>
  );
}
