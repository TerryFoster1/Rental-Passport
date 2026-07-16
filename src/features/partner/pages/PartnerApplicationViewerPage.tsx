import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import { RentalPassportLogo } from '@/components/brand/RentalPassportLogo';
import { Alert } from '@/components/feedback/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  getPartnerApplicationViewerData,
  getPartnerSafeApplicationSummary,
  postPartnerViewerEvent,
  validatePartnerViewerLaunch,
} from '@/services/partnerApplicationService';
import type {
  PartnerApplicationDocument,
  PartnerApplicationSection,
  VerificationDisplayStatus,
} from '@/types/partnerApplication';

type ViewerSection = {
  key: string;
  title: string;
  summary: string;
  completenessStatus: 'Provided' | 'Verified' | 'Needs Review' | 'Missing';
  verificationStatus: VerificationDisplayStatus;
  requestLabel: string;
  suppliedInformation: Array<{ label: string; value: string; status: VerificationDisplayStatus }>;
  documents: PartnerApplicationDocument[];
  verificationExplanation: string;
  lastUpdated: string;
};

export function PartnerApplicationViewerPage({ applicationId }: { applicationId: string }) {
  const token = new URLSearchParams(window.location.search).get('launch_token');
  const validation = useMemo(() => validatePartnerViewerLaunch(applicationId, token), [applicationId, token]);
  const data = useMemo(() => getPartnerApplicationViewerData(applicationId), [applicationId]);
  const summary = useMemo(() => getPartnerSafeApplicationSummary(applicationId), [applicationId]);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedSectionKey, setSelectedSectionKey] = useState<string | null>(null);
  const [requestedSections, setRequestedSections] = useState<Set<string>>(new Set());

  if (validation.status !== 'valid') {
    return <AccessDenied title="Application viewer unavailable" message={validation.message} />;
  }

  if (!data || !summary) {
    return <AccessDenied title="Application not found" message="This launch token is valid, but the requested application is unavailable." />;
  }

  const sections = createViewerSections(data.sections, data.documents);
  const selectedSection = sections.find((section) => section.key === selectedSectionKey) ?? null;
  const isVerifiedPassport = data.statuses.filter((item) => item.status.includes('Verified')).length >= 5;

  const closeViewer = () => {
    postPartnerViewerEvent('viewer.closed', { applicationId: data.applicationId });
    setNotice('Viewer closed. Return to Rental District to continue the application decision.');
  };

  const requestAction = (section: ViewerSection) => {
    postPartnerViewerEvent('application.updated', { applicationId: data.applicationId, action: section.requestLabel });
    setRequestedSections((current) => new Set(current).add(section.key));
    setNotice(`${section.requestLabel} sent to the tenant.`);
  };

  return (
    <main className="min-h-screen bg-[#f7fbff] text-navy">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <RentalPassportLogo className="h-11 w-auto max-w-[210px]" />
            <span className="hidden h-10 w-px bg-slate-200 md:block" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                Verified Rental Application
              </p>
              <h1 className="text-xl font-black md:text-2xl">{data.applicant.legalName}</h1>
              <p className="mt-1 text-sm font-semibold text-slate-600">{data.property.address}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Message Applicant
            </Button>
            <Button>
              <Star className="mr-2 h-4 w-4" />
              Save Applicant
            </Button>
            <Button variant="primary">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Accept Applicant
            </Button>
            <Button onClick={closeViewer}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-5 lg:px-8">
        {notice && <Alert tone="success">{notice}</Alert>}

        {selectedSection ? (
          <SectionDetail
            applicantName={data.applicant.legalName}
            requested={requestedSections.has(selectedSection.key)}
            section={selectedSection}
            onBack={() => setSelectedSectionKey(null)}
            onRequest={() => requestAction(selectedSection)}
          />
        ) : (
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${isVerifiedPassport ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                    {isVerifiedPassport ? <ShieldCheck className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                      Rental Passport
                    </p>
                    <h2 className="mt-1 text-4xl font-black tracking-tight">{data.applicant.legalName}</h2>
                    <p className="mt-2 text-sm font-semibold text-slate-700">{data.property.address}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
                      <span>Applied {formatDateTime(data.property.appliedAt)}</span>
                      <span>Passport {data.applicationId}</span>
                      <span>Expires {formatDateTime(validation.session.expiresAt)}</span>
                      <span>{data.partner.contextLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 lg:w-[320px]">
                  <p className="text-xs font-black uppercase tracking-wide text-blue-700">Property applied to</p>
                  <h3 className="mt-2 text-xl font-black">{data.property.address}</h3>
                  <div className="mt-3 grid gap-2 text-sm">
                    <MetaLine label="Move-in" value={formatDate(data.property.desiredMoveIn)} />
                    <MetaLine label="Lease term" value={data.property.leaseTerm} />
                    <MetaLine label="Occupants" value={data.property.occupants} />
                  </div>
                </div>
              </div>
            </Card>

            <section className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
              <Card className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black">{data.completeness.percent}% Complete</h2>
                    <p className="mt-1 text-sm font-black text-slate-700">
                      {isVerifiedPassport ? 'Verified Passport' : 'Not Verified'}
                    </p>
                  </div>
                </div>
                <div className="mt-5 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${data.completeness.percent}%` }} />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700">
                  {data.completeness.missingItems > 0
                    ? 'Some application information is still missing.'
                    : 'All requested application sections have been provided.'}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  This passport has been independently reviewed by Rental Passport. Verification means the application package was checked, not that the tenant is approved or guaranteed.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Standard Application
                  </Button>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Verification Summary
                  </Button>
                </div>
              </Card>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {sections.map((section) => (
                  <SectionSummaryCard
                    key={section.key}
                    requested={requestedSections.has(section.key)}
                    section={section}
                    onOpen={() => setSelectedSectionKey(section.key)}
                  />
                ))}
              </div>
            </section>

            {data.issues.length > 0 && (
              <Alert tone="info" title={data.issues[0].title}>
                {data.issues[0].detail}
              </Alert>
            )}

            <Alert tone="info">
              Completeness shows whether information was supplied. Verification shows whether Rental Passport independently confirmed it. Sensitive source documents are not downloadable by default.
            </Alert>
          </div>
        )}
      </section>
    </main>
  );
}

function AccessDenied({ title, message }: { title: string; message: string }) {
  return (
    <main className="min-h-screen bg-[#f8fbff] px-5 py-8 text-navy">
      <div className="mx-auto max-w-3xl">
        <RentalPassportLogo className="h-12 w-auto max-w-[220px]" />
        <Card className="mt-8 p-7">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-700">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-3xl font-black">{title}</h1>
          <p className="mt-3 leading-7 text-slate-700">{message}</p>
          <Alert tone="error" title="Access blocked">
            Rental Passport application viewers require a short-lived, scoped launch token. Permanent public links are not supported.
          </Alert>
        </Card>
      </div>
    </main>
  );
}

function SectionSummaryCard({
  section,
  requested,
  onOpen,
}: {
  section: ViewerSection;
  requested: boolean;
  onOpen: () => void;
}) {
  const outcome = sectionOutcome(section, requested);
  return (
    <button
      className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-soft transition hover:border-blue-200 hover:bg-blue-50/40"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionOutcomeBadge outcome={outcome} />
          <h3 className="mt-3 text-lg font-black">{section.title}</h3>
        </div>
        <ChevronRight className="mt-1 h-5 w-5 text-slate-400" />
      </div>
      <p className="mt-3 min-h-12 text-sm leading-6 text-slate-700">{section.summary}</p>
    </button>
  );
}

function SectionDetail({
  applicantName,
  section,
  requested,
  onBack,
  onRequest,
}: {
  applicantName: string;
  section: ViewerSection;
  requested: boolean;
  onBack: () => void;
  onRequest: () => void;
}) {
  return (
    <div className="space-y-5">
      <Button onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Passport
      </Button>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="p-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{applicantName}</p>
          <h2 className="mt-2 text-3xl font-black">{section.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{section.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <SectionOutcomeBadge outcome={sectionOutcome(section, requested)} />
            <Badge tone="slate">Updated {formatDateTime(section.lastUpdated)}</Badge>
          </div>
          <h3 className="mt-7 text-xl font-black">Supplied information</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {section.suppliedInformation.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <MetaLine label={item.label} value={item.value} />
                <div className="mt-3">
                  <StatusChip status={item.status} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-blue-700" />
              <h3 className="font-black">Verification explanation</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{section.verificationExplanation}</p>
          </div>
        </Card>
        <aside className="space-y-5">
          <Card className="p-5">
            <h3 className="text-xl font-black">Supporting documents</h3>
            <div className="mt-4 space-y-3">
              {section.documents.length > 0 ? (
                section.documents.map((document) => (
                  <div key={document.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="font-black">{document.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {document.status} - {document.access.replaceAll('_', ' ')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  No permitted supporting documents are available for this section.
                </p>
              )}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-600">Sensitive source documents are not downloadable by default.</p>
          </Card>
          <Card className="p-5">
            <h3 className="text-xl font-black">Request information</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Ask the tenant for missing, updated, or reverified information for this section.
            </p>
            <Button className="mt-4 w-full" variant={requested ? 'secondary' : 'primary'} onClick={onRequest} disabled={requested}>
              {requested ? 'Requested' : section.requestLabel}
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function sectionOutcome(section: ViewerSection, requested: boolean): 'Requested' | 'Needs Review' | 'Missing' | 'Verified' | 'Provided' {
  if (requested) return 'Requested';
  if (section.completenessStatus === 'Needs Review' || section.verificationStatus === 'Needs review') return 'Needs Review';
  if (section.completenessStatus === 'Missing' || section.verificationStatus === 'Missing') return 'Missing';
  if (section.verificationStatus === 'Verified' || section.verificationStatus === 'Verified directly' || section.verificationStatus === 'Verified by document') return 'Verified';
  return 'Provided';
}

function SectionOutcomeBadge({ outcome }: { outcome: ReturnType<typeof sectionOutcome> }) {
  const tone =
    outcome === 'Verified'
      ? 'blue'
      : outcome === 'Needs Review' || outcome === 'Requested'
        ? 'orange'
        : outcome === 'Missing'
          ? 'red'
          : 'slate';

  return (
    <Badge tone={tone} className="items-center gap-1">
      {outcome === 'Verified' && <ShieldCheck className="h-3.5 w-3.5" />}
      {outcome}
    </Badge>
  );
}

function createViewerSections(
  rawSections: PartnerApplicationSection[],
  documents: PartnerApplicationDocument[],
): ViewerSection[] {
  const byKey = (key: string) => rawSections.find((section) => section.key === key);
  const documentMatch = (terms: string[]) =>
    documents.filter((document) => terms.some((term) => document.category.toLowerCase().includes(term) || document.name.toLowerCase().includes(term)));

  const makeSection = (
    key: string,
    title: string,
    source: PartnerApplicationSection | undefined,
    requestLabel: string,
    documentTerms: string[],
    fallbackSummary: string,
    verificationExplanation: string,
  ): ViewerSection => ({
    key,
    title,
    summary: source?.summary ?? fallbackSummary,
    completenessStatus: source?.status === 'Missing' ? 'Missing' : source?.status === 'Needs review' ? 'Needs Review' : source?.status?.includes('Verified') ? 'Verified' : 'Provided',
    verificationStatus: source?.status ?? 'Missing',
    requestLabel,
    suppliedInformation: source?.evidence ?? [],
    documents: documentMatch(documentTerms),
    verificationExplanation,
    lastUpdated: source?.lastUpdated ?? new Date().toISOString(),
  });

  return [
    makeSection(
      'identity',
      'Tenant Identity',
      byKey('applicant'),
      'Request Identity Confirmation',
      ['identity', 'id'],
      'Identity information has been supplied by the applicant.',
      'Rental Passport reviewed identity information and account contact checks. Full ID documents are not displayed by default.',
    ),
    makeSection(
      'employment-income',
      'Employment & Income',
      byKey('employment-income'),
      'Request Updated Employment Information',
      ['employment', 'income', 'pay'],
      'Employment details and supporting documents have been supplied.',
      'Rental Passport independently verified employment using employer confirmation, company contact/domain review, pay stub review, and employment letter review.',
    ),
    makeSection(
      'rental-history',
      'Rental History',
      byKey('rental-history'),
      'Request Additional Rental History',
      ['lease', 'rental', 'payment'],
      'Rental history has been supplied by the applicant.',
      'Rental Passport reviewed lease records and direct landlord/property manager confirmation.',
    ),
    makeSection(
      'references',
      'References',
      byKey('references'),
      'Request Another Reference',
      ['reference'],
      'References have been supplied by the applicant.',
      'Rental Passport contacted references directly and recorded structured responses.',
    ),
    makeSection(
      'credit',
      'Credit',
      byKey('credit'),
      'Request Credit Report',
      ['credit'],
      'No credit report has been provided.',
      'Rental Passport reviewed a tenant-consented credit report and shares only the relevant summary.',
    ),
    makeSection(
      'documents',
      'Documents / Application Information',
      byKey('verification-fraud'),
      'Request Updated Document',
      ['bank', 'document'],
      'Supporting application documents are available according to tenant permissions.',
      'Rental Passport checks document consistency and exposes only permitted document views.',
    ),
  ];
}

function StatusChip({ status, label }: { status: VerificationDisplayStatus; label?: string }) {
  const tone =
    status === 'Verified' || status === 'Verified directly' || status === 'Verified by document'
      ? 'green'
      : status === 'Needs review' || status === 'Pending'
        ? 'orange'
        : status === 'Unable to verify' || status === 'Expired' || status === 'Missing'
          ? 'red'
          : 'slate';
  return (
    <Badge tone={tone} className="items-center gap-1">
      {tone === 'green' && <BadgeCheck className="h-3 w-3" />}
      {label ?? status}
    </Badge>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}
