import { ArrowLeft, FileText, Settings, ShieldCheck } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/feedback/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { ActivityLogItem } from '@/features/passport/components/ActivityLogItem';
import { PassportProgressCard } from '@/features/passport/components/PassportProgressCard';
import { PassportSectionCard } from '@/features/passport/components/PassportSectionCard';
import { SectionStatusCard } from '@/features/passport/components/SectionStatusCard';
import { TenantDashboardLayout } from '@/features/passport/components/TenantDashboardLayout';
import { TrustBanner } from '@/features/passport/components/TrustBanner';
import { sectionStatusLabel } from '@/features/passport/components/passportLabels';
import { usePassportSummary } from '@/features/passport/usePassportSummary';
import type { PassportSectionKey } from '@/types/passport';

export function TenantDashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const state = usePassportSummary();
  if (state.loading) return <PassportLoading />;
  if (state.error) return <PassportError message={state.error} />;
  if (!state.summary) return <PassportEmpty />;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Tenant Dashboard"
        title="Build your Rental Passport"
        description="Complete each section at your pace. This is completeness tracking, not a tenant score."
        actions={<Button onClick={() => onNavigate('/passport/preview')}>Preview Passport</Button>}
      />
      <TenantDashboardLayout
        aside={
          <>
            <TrustBanner />
            <Card className="p-6">
              <p className="text-sm font-black uppercase text-blue-700">Passport ID</p>
              <strong className="mt-2 block text-2xl font-black">{state.summary.passport.passport_number}</strong>
              <p className="mt-2 text-sm text-slate-600">Draft version {state.summary.draftVersion.version_number}</p>
            </Card>
          </>
        }
      >
        <PassportProgressCard progress={state.summary.progress} />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {state.summary.sections.map((section) => (
            <PassportSectionCard key={section.key} section={section} onNavigate={onNavigate} />
          ))}
        </div>
      </TenantDashboardLayout>
    </PageContainer>
  );
}

export function PassportOverviewPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const state = usePassportSummary();
  if (state.loading) return <PassportLoading />;
  if (state.error) return <PassportError message={state.error} />;
  if (!state.summary) return <PassportEmpty />;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Passport"
        title="Passport overview"
        description="A versioned passport shell for future rental, employment, reference, credit, and identity modules."
        actions={<Button onClick={() => onNavigate('/dashboard')}>Dashboard</Button>}
      />
      <TenantDashboardLayout
        aside={
          <Card className="p-6">
            <h2 className="text-xl font-black">Versioning</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">Verification will attach to a specific passport version. This phase creates the structure without full reverification logic.</p>
            <div className="mt-4 space-y-2 text-sm">
              <p>Current version: {state.summary.currentVersion.version_number}</p>
              <p>Draft version: {state.summary.draftVersion.version_number}</p>
              <p>Updated: {new Date(state.summary.passport.updated_at).toLocaleDateString()}</p>
            </div>
          </Card>
        }
      >
        <PassportProgressCard progress={state.summary.progress} />
        <Card className="p-6">
          <h2 className="text-xl font-black">Section status</h2>
          <div className="mt-5 divide-y divide-slate-100">
            {state.summary.sections.map((section) => (
              <button key={section.key} className="flex w-full items-center justify-between gap-4 py-4 text-left" onClick={() => onNavigate(section.route)}>
                <span>
                  <strong className="block">{section.name}</strong>
                  <span className="text-sm text-slate-600">{sectionStatusLabel(section.status)}</span>
                </span>
                <StatusBadge status={`${section.progress}% Complete`} />
              </button>
            ))}
          </div>
        </Card>
      </TenantDashboardLayout>
    </PageContainer>
  );
}

export function PassportPreviewPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const state = usePassportSummary();
  if (state.loading) return <PassportLoading />;
  if (state.error) return <PassportError message={state.error} />;
  if (!state.summary) return <PassportEmpty />;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Tenant Preview"
        title="Landlord-facing passport preview"
        description="Preview uses placeholder display data until sharing and reviewer workflows are implemented."
        actions={<Button onClick={() => onNavigate('/dashboard')}>Back to Dashboard</Button>}
      />
      <Card className="p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-3xl font-black">Samantha Johnson</h2>
            <p className="mt-2 text-slate-700">Toronto, ON</p>
            <p className="mt-2 text-sm font-semibold text-slate-600">Passport ID: {state.summary.passport.passport_number}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-emerald-700" />
            <strong className="mt-2 block text-xl font-black text-emerald-800">Draft Passport</strong>
            <p className="mt-1 text-sm text-emerald-900">Verification modules begin in future phases.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {state.summary.sections.map((section) => (
            <div key={section.key} className="rounded-xl border border-slate-200 p-4">
              <strong className="block">{section.name}</strong>
              <span className="mt-3 inline-flex"><StatusBadge status={sectionStatusLabel(section.status)} /></span>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}

export function PassportActivityPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const state = usePassportSummary();
  if (state.loading) return <PassportLoading />;
  if (state.error) return <PassportError message={state.error} />;
  if (!state.summary) return <PassportEmpty />;

  return (
    <PageContainer>
      <PageHeader eyebrow="Activity" title="Passport activity log" description="Internal activity foundation for passport events." actions={<Button onClick={() => onNavigate('/dashboard')}>Dashboard</Button>} />
      <Card className="p-6">
        {state.summary.activity.length > 0 ? (
          <ul>
            {state.summary.activity.map((activity) => (
              <ActivityLogItem key={activity.id} activity={activity} />
            ))}
          </ul>
        ) : (
          <EmptyState title="No activity yet" description="Passport activity will appear as the framework creates and updates records." />
        )}
      </Card>
    </PageContainer>
  );
}

export function PassportSettingsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <PageContainer>
      <PageHeader eyebrow="Settings" title="Passport settings" description="Sharing and passport preferences will be added after the core framework is validated." actions={<Button onClick={() => onNavigate('/dashboard')}>Dashboard</Button>} />
      <Card className="p-6">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black">Sharing is not enabled yet</h2>
            <p className="mt-2 text-slate-700">Secure sharing, recipient-specific links, QR codes, and downloadable packages belong to later phases.</p>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}

export function PassportSectionPlaceholderPage({ sectionKey, onNavigate }: { sectionKey: PassportSectionKey; onNavigate: (path: string) => void }) {
  const state = usePassportSummary();
  if (state.loading) return <PassportLoading />;
  if (state.error) return <PassportError message={state.error} />;
  if (!state.summary) return <PassportEmpty />;

  const section = state.summary.sections.find((item) => item.key === sectionKey);
  if (!section) return <PassportEmpty />;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Passport Section"
        title={section.name}
        description={section.description}
        actions={
          <Button onClick={() => onNavigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-7">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <FileText className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-black">This section will be built in a future phase</h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-700">Phase 2 only creates the modular passport section shell, status tracking, versioning, and activity foundation. Full section forms and verification workflows are intentionally not implemented yet.</p>
        </Card>
        <SectionStatusCard section={section} />
      </div>
    </PageContainer>
  );
}

function PassportLoading() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <Skeleton className="h-16 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </PageContainer>
  );
}

function PassportError({ message }: { message: string }) {
  return (
    <PageContainer>
      <Alert tone="error">{message}</Alert>
    </PageContainer>
  );
}

function PassportEmpty() {
  return (
    <PageContainer>
      <EmptyState title="Passport unavailable" description="The passport framework could not load for this account." />
    </PageContainer>
  );
}
