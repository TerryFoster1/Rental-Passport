import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Flag,
  LockKeyhole,
  MessageSquare,
  RefreshCcw,
  ShieldCheck,
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
  PartnerApplicationIssue,
  PartnerApplicationSection,
  VerificationDisplayStatus,
} from '@/types/partnerApplication';

export function PartnerApplicationViewerPage({ applicationId }: { applicationId: string }) {
  const token = new URLSearchParams(window.location.search).get('launch_token');
  const validation = useMemo(() => validatePartnerViewerLaunch(applicationId, token), [applicationId, token]);
  const data = useMemo(() => getPartnerApplicationViewerData(applicationId), [applicationId]);
  const summary = useMemo(() => getPartnerSafeApplicationSummary(applicationId), [applicationId]);
  const [notice, setNotice] = useState<string | null>(null);

  if (validation.status !== 'valid') {
    return <AccessDenied title="Application viewer unavailable" message={validation.message} />;
  }

  if (!data || !summary) {
    return <AccessDenied title="Application not found" message="This launch token is valid, but the requested application is unavailable." />;
  }

  const closeViewer = () => {
    postPartnerViewerEvent('viewer.closed', { applicationId: data.applicationId });
    setNotice('Viewer close event sent when opened from an approved partner origin.');
  };

  const requestAction = (label: string) => {
    postPartnerViewerEvent('application.updated', { applicationId: data.applicationId, action: label });
    setNotice(`${label} recorded in the demo viewer. Production will create an auditable request.`);
  };

  return (
    <main className="min-h-screen bg-[#f8fbff] text-navy">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <RentalPassportLogo className="h-11 w-auto max-w-[210px]" />
            <span className="hidden h-10 w-px bg-slate-200 md:block" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                Verified Rental Application
              </p>
              <h1 className="text-xl font-black md:text-2xl">{data.applicant.legalName}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">{data.partner.contextLabel}</Badge>
            <Badge tone="green">{data.completeness.consentStatus}</Badge>
            <Button onClick={closeViewer}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1500px] gap-6 px-5 py-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-5">
          <Card className="p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-2xl font-black">{data.applicant.legalName}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              Application {data.applicationId}
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <MetaLine label="Property" value={data.property.address} />
              <MetaLine label="Applied" value={formatDateTime(data.property.appliedAt)} />
              <MetaLine label="Passport account" value={data.rentalPassportAccountId} />
              <MetaLine label="Partner reference" value={data.property.partnerPropertyReference} />
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Partner-safe summary
            </p>
            <div className="mt-4 grid gap-3">
              <SummaryMetric label="Completeness" value={`${data.completeness.percent}%`} />
              <SummaryMetric label="Unresolved" value={String(summary.unresolved_issue_count)} />
              <SummaryMetric label="State" value={summary.current_application_state.replaceAll('_', ' ')} />
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-600">
              Partner platforms may display a summary, but Rental Passport displays the authoritative application.
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <LockKeyhole className="h-5 w-5 text-blue-700" />
              <h2 className="font-black">Session controls</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <p>Token scope: one application, one partner, one landlord user.</p>
              <p>Expires: {formatDateTime(validation.session.expiresAt)}</p>
              <p>Mode: {validation.session.mode === 'embed' ? 'Secure embed' : 'New tab'}</p>
            </div>
          </Card>
        </aside>

        <div className="space-y-6">
          {notice && <Alert tone="success">{notice}</Alert>}

          <Card className="p-6">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                <div className="flex flex-wrap gap-2">
                  <StatusChip status={data.completeness.consentStatus} />
                  <Badge tone="blue">Read-only review</Badge>
                  <Badge tone="slate">No final tenancy decision here</Badge>
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                  Application review workspace
                </h2>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
                  Review verified facts, unresolved items, consent records, and permitted evidence.
                  Rental Passport owns the full application; partner platforms receive safe summary metadata.
                </p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-black uppercase tracking-wide text-blue-700">Property applied to</p>
                <h3 className="mt-2 text-xl font-black">{data.property.address}</h3>
                <div className="mt-4 grid gap-2 text-sm text-blue-950">
                  <MetaLine label="Move-in" value={formatDate(data.property.desiredMoveIn)} />
                  <MetaLine label="Lease term" value={data.property.leaseTerm} />
                  <MetaLine label="Occupants" value={data.property.occupants} />
                </div>
              </div>
            </div>
          </Card>

          {data.issues.length > 0 && (
            <section className="grid gap-3 md:grid-cols-2">
              {data.issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </section>
          )}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.statuses.map((item) => (
              <Card key={item.label} className="p-4">
                <StatusChip status={item.status} />
                <h3 className="mt-3 text-lg font-black">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              </Card>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-4">
              {data.sections.map((section) => (
                <ApplicationSectionCard key={section.key} section={section} />
              ))}
            </div>
            <aside className="space-y-5">
              <Card className="p-5">
                <h2 className="text-xl font-black">Applicant information</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <MetaLine label="Legal name" value={data.applicant.legalName} />
                  <MetaLine label="Preferred name" value={data.applicant.preferredName} />
                  <MetaLine label="Email" value={data.applicant.email} />
                  <MetaLine label="Phone" value={data.applicant.phone} />
                  <MetaLine label="Date of birth" value={formatDate(data.applicant.dateOfBirth)} />
                  <MetaLine label="Current address" value={data.applicant.currentAddress} />
                  <MetaLine label="Pets" value={data.property.pets} />
                  <MetaLine label="Smoking" value={data.property.smoking} />
                  <MetaLine label="Parking" value={data.property.parking} />
                  <MetaLine label="Emergency contact" value={data.property.emergencyContact} />
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="text-xl font-black">Landlord actions</h2>
                <div className="mt-4 grid gap-3">
                  <ActionButton label="Mark reviewed" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => requestAction('mark_reviewed')} />
                  <ActionButton label="Request missing information" icon={<MessageSquare className="h-4 w-4" />} onClick={() => requestAction('request_missing_information')} />
                  <ActionButton label="Request re-verification" icon={<RefreshCcw className="h-4 w-4" />} onClick={() => requestAction('request_reverification')} />
                  <ActionButton label="Request updated document" icon={<FileText className="h-4 w-4" />} onClick={() => requestAction('request_updated_document')} />
                </div>
                <p className="mt-4 text-xs leading-5 text-slate-600">
                  Approve, decline, waitlist, lease creation, and tenancy creation stay in the partner platform.
                </p>
              </Card>

              <Card className="p-5">
                <h2 className="text-xl font-black">Downloads</h2>
                <div className="mt-4 grid gap-3">
                  <ActionButton label="Standard application" icon={<Download className="h-4 w-4" />} onClick={() => downloadText('standard-application.txt', buildApplicationDownload(data.applicationId))} />
                  <ActionButton label="Verification summary" icon={<Download className="h-4 w-4" />} onClick={() => downloadText('verification-summary.json', JSON.stringify(summary, null, 2))} />
                  <ActionButton label="Permitted documents list" icon={<Download className="h-4 w-4" />} onClick={() => downloadText('permitted-documents.txt', buildDocumentDownload(data.documents))} />
                </div>
              </Card>
            </aside>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="text-xl font-black">Documents</h2>
              <div className="mt-4 space-y-3">
                {data.documents.map((document) => (
                  <DocumentRow key={document.id} document={document} />
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <h2 className="text-xl font-black">Declaration, consent, and audit</h2>
              <div className="mt-4 space-y-4">
                {data.declarations.map((item) => (
                  <MetaLine key={item.label} label={item.label} value={formatDateTime(item.acceptedAt)} />
                ))}
              </div>
              <div className="mt-6 border-t border-slate-200 pt-4">
                {data.audit.map((item) => (
                  <div key={`${item.label}-${item.timestamp}`} className="mb-3 flex gap-3 text-sm">
                    <Clock className="mt-0.5 h-4 w-4 flex-none text-blue-700" />
                    <p>
                      <strong>{item.label}</strong>
                      <span className="block text-slate-600">{formatDateTime(item.timestamp)} by {item.actor}</span>
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <Card className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-black">Return to partner platform</h2>
              <p className="mt-1 text-sm text-slate-600">Use the partner return action when embedded, or open the partner application in a new tab.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={closeViewer}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return
              </Button>
              <Button onClick={() => window.open(data.partner.returnUrl, '_blank', 'noopener,noreferrer')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open partner
              </Button>
            </div>
          </Card>
        </div>
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

function ApplicationSectionCard({ section }: { section: PartnerApplicationSection }) {
  return (
    <details className="group rounded-xl border border-slate-200 bg-white p-5 shadow-soft" open={section.key === 'summary'}>
      <summary className="flex cursor-pointer list-none flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <StatusChip status={section.status} />
          <h2 className="mt-3 text-2xl font-black">{section.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{section.summary}</p>
        </div>
        <span className="text-sm font-bold text-blue-700 group-open:hidden">Expand</span>
        <span className="hidden text-sm font-bold text-blue-700 group-open:inline">Collapse</span>
      </summary>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {section.evidence.map((item) => (
          <div key={`${section.key}-${item.label}`} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="mt-1 font-semibold text-slate-900">{item.value}</p>
            <div className="mt-3">
              <StatusChip status={item.status} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-500">Last updated {formatDateTime(section.lastUpdated)}</p>
    </details>
  );
}

function StatusChip({ status }: { status: VerificationDisplayStatus }) {
  const tone =
    status === 'Verified' || status === 'Verified directly' || status === 'Verified by document'
      ? 'green'
      : status === 'Needs review' || status === 'Pending'
        ? 'orange'
        : status === 'Unable to verify' || status === 'Expired' || status === 'Missing'
          ? 'red'
          : 'slate';
  const Icon = tone === 'green' ? BadgeCheck : tone === 'orange' ? AlertTriangle : tone === 'red' ? Flag : FileText;
  return (
    <Badge tone={tone} className="items-center gap-1">
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

function IssueCard({ issue }: { issue: PartnerApplicationIssue }) {
  return (
    <Card className="border-orange-200 bg-orange-50 p-5">
      <div className="flex gap-3">
        <AlertTriangle className="mt-1 h-5 w-5 flex-none text-orange-700" />
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-orange-800">{issue.severity.replaceAll('_', ' ')}</p>
          <h3 className="mt-1 text-lg font-black text-orange-950">{issue.title}</h3>
          <p className="mt-2 text-sm leading-6 text-orange-950">{issue.detail}</p>
        </div>
      </div>
    </Card>
  );
}

function DocumentRow({ document }: { document: PartnerApplicationDocument }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black">{document.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{document.category}</p>
        </div>
        <StatusChip status={document.status} />
      </div>
      <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
        <MetaLine label="Uploaded" value={formatDate(document.uploadedAt)} />
        <MetaLine label="Expiry" value={document.expiresAt ? formatDate(document.expiresAt) : 'Not set'} />
        <MetaLine label="Access" value={document.access.replaceAll('_', ' ')} />
      </div>
    </div>
  );
}

function ActionButton({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button className="flex w-full items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-black text-blue-700 hover:bg-blue-50" onClick={onClick}>
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-black capitalize">{value}</p>
    </div>
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

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildApplicationDownload(applicationId: string) {
  return [
    'Rental Passport Standard Application Package',
    `Application ID: ${applicationId}`,
    'Applicant: Kathryn Casey',
    'Property: 123 Maple St, Unit 1204, Toronto, ON',
    'Status: Complete with one optional document item needing review',
    '',
    'This demo package contains safe summary data only. Production downloads must enforce tenant consent, document permissions, watermarking, expiry, and audit logs.',
  ].join('\n');
}

function buildDocumentDownload(documents: PartnerApplicationDocument[]) {
  return documents
    .map((document) => `${document.name} | ${document.category} | ${document.status} | ${document.access}`)
    .join('\n');
}
