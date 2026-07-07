import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, ShieldAlert } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/feedback/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  AssignmentCard,
  CaseSummaryCard,
  CaseTimeline,
  DecisionPanel,
  EvidenceViewer,
  FraudFlagCard,
  RequestInformationModal,
  ReviewerNotes,
  VerificationChecklist,
} from '@/features/admin/components/VerificationPortalComponents';
import {
  addFraudFlag,
  addVerificationNote,
  assignCase,
  getVerificationCaseDetail,
  getVerificationDashboard,
  listVerificationCases,
  requestInformation,
  setChecklistItem,
  submitVerificationDecision,
  updateCasePriority,
} from '@/services/verificationPortalService';
import type { UserRole } from '@/types/database';
import type { FraudFlagType, VerificationCase, VerificationCaseDetail, VerificationDecisionType, VerificationQueueFilters } from '@/types/verificationPortal';

const internalRoles: UserRole[] = ['verification_reviewer', 'senior_reviewer', 'compliance', 'support', 'administrator'];

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { roles } = useAuth();
  const allowed = roles.some((role) => internalRoles.includes(role));
  if (!allowed) {
    return (
      <PageContainer>
        <EmptyState title="Internal access required" description="The verification portal is restricted to authorized Rental Passport staff." />
      </PageContainer>
    );
  }
  return <>{children}</>;
}

export function AdminDashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof getVerificationDashboard>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVerificationDashboard().then(setMetrics).catch((nextError: Error) => setError(nextError.message));
  }, []);

  return (
    <PageContainer>
      <PageHeader eyebrow="Internal Verification" title="Verification dashboard" description="Work queues for Rental Passport verification staff. This portal is never visible to tenants or landlords." actions={<Button onClick={() => onNavigate('/admin/verifications')}>Open Queue</Button>} />
      {error && <Alert tone="error">{error}</Alert>}
      {!metrics ? <Skeleton className="h-64 w-full" /> : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <QueueMetric label="Today's Queue" value={metrics.todaysQueue} />
          <QueueMetric label="Cases Awaiting Review" value={metrics.awaitingReview} />
          <QueueMetric label="Awaiting Customer Response" value={metrics.awaitingCustomerResponse} />
          <QueueMetric label="Urgent Cases" value={metrics.urgentCases} tone="red" />
          <QueueMetric label="Fraud Review" value={metrics.fraudReview} tone="orange" />
          <QueueMetric label="Completed Today" value={metrics.completedToday} tone="green" />
        </div>
      )}
      <Card className="mt-6 p-6">
        <div className="flex items-start gap-4">
          <ShieldAlert className="h-8 w-8 text-blue-700" />
          <div>
            <h2 className="text-xl font-black">Operations guidance</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">Use structured checklist evidence before making decisions. Internal notes and fraud flags are never shown to tenants or landlords. Human reviewers always make final decisions.</p>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}

export function VerificationQueuePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [filters, setFilters] = useState<VerificationQueueFilters>({ search: '', verificationType: 'all', status: 'all', priority: 'all' });
  const [cases, setCases] = useState<VerificationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listVerificationCases(filters)
      .then(setCases)
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setLoading(false));
  }, [filters]);

  const setFilter = <K extends keyof VerificationQueueFilters>(key: K, value: VerificationQueueFilters[K]) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <PageContainer>
      <PageHeader eyebrow="Case Queue" title="Verification cases" description="Search and filter submitted verification work by section, status, reviewer, date, and priority." actions={<Button onClick={() => onNavigate('/admin')}>Dashboard</Button>} />
      {error && <Alert tone="error">{error}</Alert>}
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px_180px]">
          <Input label="Search" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} />
          <SelectFilter label="Section" value={filters.verificationType} options={['all', 'identity', 'employment', 'rental_history', 'references', 'credit', 'fraud']} onChange={(value) => setFilter('verificationType', value as VerificationQueueFilters['verificationType'])} />
          <SelectFilter label="Status" value={filters.status} options={['all', 'awaiting_review', 'in_review', 'awaiting_customer_response', 'approved', 'rejected', 'escalated', 'fraud_review']} onChange={(value) => setFilter('status', value as VerificationQueueFilters['status'])} />
          <SelectFilter label="Priority" value={filters.priority} options={['all', 'low', 'normal', 'high', 'urgent']} onChange={(value) => setFilter('priority', value as VerificationQueueFilters['priority'])} />
        </div>
      </Card>
      <Card className="mt-6 overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_120px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-black uppercase text-slate-500">
          <span>Applicant</span><span>Passport ID</span><span>Section</span><span>Status</span><span>Assigned To</span><span>Priority</span><span>Actions</span>
        </div>
        {loading ? <div className="p-5"><Skeleton className="h-28 w-full" /></div> : cases.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {cases.map((item) => (
              <div key={item.id} className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_120px] items-center gap-4 px-5 py-4 text-sm">
                <strong>{item.applicant_name}</strong>
                <span>{item.passport_number}</span>
                <span className="capitalize">{item.verification_type.replaceAll('_', ' ')}</span>
                <StatusBadge status={item.status.replaceAll('_', ' ')} />
                <span>{item.assigned_reviewer_name ?? 'Unassigned'}</span>
                <Badge tone={item.priority === 'urgent' ? 'red' : item.priority === 'high' ? 'orange' : 'slate'}>{item.priority}</Badge>
                <Button onClick={() => onNavigate(`/admin/verifications/${item.id}`)}>Review</Button>
              </div>
            ))}
          </div>
        ) : <div className="p-8"><EmptyState title="No cases found" description="Adjust filters or wait for new submissions." /></div>}
      </Card>
    </PageContainer>
  );
}

export function VerificationCasePage({ caseId, onNavigate }: { caseId: string; onNavigate: (path: string) => void }) {
  const { user, profile } = useAuth();
  const [detail, setDetail] = useState<VerificationCaseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reviewerName = useMemo(() => profile?.preferred_name || [profile?.legal_first_name, profile?.legal_last_name].filter(Boolean).join(' ') || profile?.email || user?.email || 'Reviewer', [profile, user]);

  const refresh = useCallback(() => getVerificationCaseDetail(caseId).then(setDetail).catch((nextError: Error) => setError(nextError.message)), [caseId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const guarded = async (action: () => Promise<void>) => {
    setError(null);
    try {
      await action();
      await refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Action failed.');
    }
  };

  if (error) return <PageContainer><Alert tone="error">{error}</Alert></PageContainer>;
  if (!detail) return <PageContainer><Skeleton className="h-96 w-full" /></PageContainer>;

  return (
    <PageContainer>
      <PageHeader eyebrow="Verification Case" title={`${detail.case.verification_type.replaceAll('_', ' ')} review`} description="Primary internal review workspace for structured verification decisions." actions={<Button onClick={() => onNavigate('/admin/verifications')}><ArrowLeft className="mr-2 h-4 w-4" />Queue</Button>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <CaseSummaryCard detail={detail} />
          <EvidenceViewer sectionLabel={detail.case.verification_type.replaceAll('_', ' ')} />
          <VerificationChecklist items={detail.checklist} onToggle={(itemId, checked) => user && guarded(() => setChecklistItem(detail.case.id, itemId, user, checked))} />
          <ReviewerNotes notes={detail.notes} onAdd={(body) => user && guarded(() => addVerificationNote(detail.case.id, user, reviewerName, body))} />
          <CaseTimeline activity={detail.activity} />
        </div>
        <aside className="space-y-6">
          <AssignmentCard assignedTo={detail.case.assigned_reviewer_name} onAssign={() => user && guarded(() => assignCase(detail.case.id, user, reviewerName))} onPriority={(priority) => user && guarded(() => updateCasePriority(detail.case.id, user, priority))} />
          <DecisionPanel onDecision={(decision: VerificationDecisionType, reason: string) => user && guarded(() => submitVerificationDecision(detail.case.id, user, { decision, reason }))} />
          <RequestInformationModal onRequest={(requestedItem, message) => user && guarded(() => requestInformation(detail.case.id, user, requestedItem, message))} />
          <FraudFlagCard flags={detail.fraudFlags} onFlag={(type: FraudFlagType, description: string) => user && guarded(() => addFraudFlag(detail.case.id, user, type, description))} />
        </aside>
      </div>
    </PageContainer>
  );
}

function QueueMetric({ label, value, tone = 'blue' }: { label: string; value: number; tone?: 'blue' | 'green' | 'orange' | 'red' }) {
  const tones = {
    blue: 'text-blue-700 bg-blue-50',
    green: 'text-emerald-700 bg-emerald-50',
    orange: 'text-orange-700 bg-orange-50',
    red: 'text-red-700 bg-red-50',
  };
  return (
    <Card className="p-6">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Search className="h-6 w-6" />
      </div>
      <p className="mt-4 text-sm font-black uppercase text-slate-500">{label}</p>
      <strong className="mt-1 block text-4xl font-black">{value}</strong>
    </Card>
  );
}

function SelectFilter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <select className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-navy outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
      </select>
    </label>
  );
}
