import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/feedback/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/features/auth/AuthProvider';
import { createLandlordInformationRequest } from '@/services/phaseAService';
import { SignInPage } from '@/features/auth/AuthPages';
import {
  activateSecureAccess,
  getLandlordApplicationDetail,
  getSecureInvite,
  listLandlordApplications,
  logLandlordSectionView,
  requestLandlordInformation,
  updateLandlordApplicationStatus,
} from '@/services/sharingService';
import type { PassportSectionKey } from '@/types/passport';
import type {
  LandlordApplication,
  LandlordApplicationDetail,
  LandlordApplicationStatus,
  LandlordInformationRequest,
  LandlordPassportSection,
  SecureInviteState,
} from '@/types/sharing';

export function LandlordSecureAccessPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const auth = useAuth();
  const token = new URLSearchParams(window.location.search).get('token');
  const [invite, setInvite] = useState<SecureInviteState | null>(null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getSecureInvite(token)
      .then(setInvite)
      .catch((error: Error) => setInvite({ status: 'invalid', message: error.message }));
  }, [token]);

  const createAccess = async () => {
    if (!token || !invite || invite.status !== 'valid') return;
    setBusy(true);
    setMessage(null);
    try {
      if (!auth.user) {
        const result = await auth.signUpWithPassword(invite.share.landlord_email, password);
        if (result.error) throw result.error;
        setMessage(
          'Secure access created. Verify your email, then return to this invitation to continue securely.',
        );
        return;
      }
      const applicationId = await activateSecureAccess(auth.user, token);
      onNavigate(`/landlord/applications/${applicationId}/passport`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to continue securely.');
    } finally {
      setBusy(false);
    }
  };

  if (!invite)
    return (
      <PageContainer>
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    );

  if (invite.status !== 'valid') {
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Secure Access"
          title="Invitation unavailable"
          description={invite.message}
        />
        <Alert tone="error">{invite.message}</Alert>
      </PageContainer>
    );
  }

  if (!auth.user) {
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Secure Access"
          title="Protect applicant information"
          description="Create secure access or sign in before viewing this shared Rental Passport."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <LockKeyhole className="h-10 w-10 text-blue-700" />
            <h2 className="mt-4 text-2xl font-black">Create Secure Access</h2>
            <p className="mt-2 text-slate-700">
              This invitation is restricted to {invite.share.landlord_email}.
            </p>
            {message && (
              <div className="mt-4">
                <Alert tone={message.includes('created') ? 'success' : 'error'}>{message}</Alert>
              </div>
            )}
            <div className="mt-5 space-y-4">
              <Input label="Recipient email" value={invite.share.landlord_email} readOnly />
              <Input
                label="Secure password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <Button
                variant="primary"
                onClick={createAccess}
                disabled={busy || password.length < 8}
              >
                {busy ? 'Securing...' : 'Continue Securely'}
              </Button>
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-black">Existing access</h2>
            <p className="mt-2 text-slate-700">
              If you already secured this application, sign in using the invited email.
            </p>
            <div className="mt-5">
              <SignInPage onNavigate={onNavigate} />
            </div>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Secure Access"
        title="Continue securely"
        description="Your account will only see applications shared with your email."
      />
      {message && <Alert tone="error">{message}</Alert>}
      <Card className="p-6">
        <p className="text-slate-700">
          Invitation for {invite.share.landlord_email}. Access expires{' '}
          {new Date(invite.share.expires_at).toLocaleDateString()}.
        </p>
        <Button className="mt-5" variant="primary" onClick={createAccess} disabled={busy}>
          {busy ? 'Checking...' : 'Secure This Application'}
        </Button>
      </Card>
    </PageContainer>
  );
}

export function LandlordApplicationsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<LandlordApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listLandlordApplications(user)
      .then(setApplications)
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Landlord Applications"
        title="Applications"
        description="A simple view of Rental Passports shared specifically with your email."
      />
      {error && <Alert tone="error">{error}</Alert>}
      {loading ? (
        <Skeleton className="h-52 w-full" />
      ) : applications.length > 0 ? (
        <div className="grid gap-5">
          {applications.map((application) => (
            <Card key={application.id} className="p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <Avatar name={application.applicant_name} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black">{application.applicant_name}</h2>
                      <StatusBadge status={application.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      Passport {application.passport_number}
                    </p>
                    {application.property_address && (
                      <p className="mt-1 text-sm text-slate-600">{application.property_address}</p>
                    )}
                  </div>
                </div>
                <div className="grid gap-3 text-sm md:grid-cols-3 lg:min-w-[430px]">
                  <Metric label="Completeness" value={`${application.completeness}%`} />
                  <Metric label="Verification" value={application.verification_status} />
                  <Metric label="Expires" value={formatDate(application.expires_at)} />
                </div>
                <Button
                  variant="primary"
                  onClick={() => onNavigate(`/landlord/applications/${application.id}/passport`)}
                >
                  View Passport
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No shared applications"
          description="Applications appear here only after a tenant shares a Rental Passport with your email."
        />
      )}
    </PageContainer>
  );
}

export function LandlordPassportPage({
  applicationId,
  onNavigate,
}: {
  applicationId: string;
  onNavigate: (path: string) => void;
}) {
  const { user } = useAuth();
  const [detail, setDetail] = useState<LandlordApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<LandlordInformationRequest[]>([]);

  useEffect(() => {
    if (!user) return;
    getLandlordApplicationDetail(user, applicationId)
      .then((nextDetail) => {
        setDetail(nextDetail);
        setRequests(nextDetail.informationRequests);
      })
      .catch((nextError: Error) => setError(nextError.message));
  }, [applicationId, user]);

  const action = async (status: LandlordApplicationStatus) => {
    if (!user || !detail) return;
    await updateLandlordApplicationStatus(user, detail.application.id, status);
    setDetail({ ...detail, application: { ...detail.application, status } });
  };

  if (error)
    return (
      <PageContainer>
        <Alert tone="error">{error}</Alert>
      </PageContainer>
    );
  if (!detail)
    return (
      <PageContainer>
        <Skeleton className="h-96 w-full" />
      </PageContainer>
    );

  const passport = detail.passport;
  const openRequests = new Set(
    requests.filter((request) => request.status === 'requested').map((request) => request.section_key),
  );

  return (
    <main className="min-h-screen bg-[#f7fbff] px-4 py-4 text-navy md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <Card className="p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <button
                aria-label="Back to applications"
                className="mt-1 rounded-full border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
                onClick={() => onNavigate('/landlord/applications')}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <Avatar name={passport.displayName} />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Rental Passport</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">{passport.displayName}</h1>
                <p className="mt-1 text-sm font-semibold text-slate-700">{passport.propertyAddress}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
                  <span>Applied {formatDate(passport.applicationDate)}</span>
                  <span>Passport {passport.passportId}</span>
                  <span>Expires {formatDate(passport.expiresAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Message Applicant
              </Button>
              <Button onClick={() => action('saved')}>
                <Star className="mr-2 h-4 w-4" />
                Save Applicant
              </Button>
              <Button variant="primary" onClick={() => action('accepted')}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Accept Applicant
              </Button>
              <Button variant="danger" onClick={() => action('archived')}>
                <Archive className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        </Card>

        <section className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <Card className="p-5">
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${passport.isPaidVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                {passport.isPaidVerified ? <ShieldCheck className="h-7 w-7" /> : <FileText className="h-7 w-7" />}
              </div>
              <div>
                <h2 className="text-3xl font-black">{passport.completenessPercent}% Complete</h2>
                <p className="mt-1 text-sm font-black text-slate-700">
                  {passport.isPaidVerified ? 'Verified Passport' : passport.verificationState}
                </p>
              </div>
            </div>
            <div className="mt-5 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: `${passport.completenessPercent}%` }} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">{passport.completenessMessage}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{passport.verificationMessage}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {passport.downloadLabels.map((label) => (
                <Button key={label}>
                  <Download className="mr-2 h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </Card>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {detail.sections.map((section) => (
              <SectionSummaryCard
                key={section.key}
                requested={openRequests.has(section.key)}
                section={section}
                onOpen={() => onNavigate(section.route)}
              />
            ))}
          </div>
        </section>

        <Alert tone="info">
          Completeness shows whether information was supplied. Verification shows whether Rental Passport independently confirmed it. Sensitive source documents are not downloadable by default.
        </Alert>
      </div>
    </main>
  );
}

export function LandlordDetailPage({
  applicationId,
  sectionKey,
  onNavigate,
}: {
  applicationId: string;
  sectionKey: PassportSectionKey;
  onNavigate: (path: string) => void;
}) {
  const { user } = useAuth();
  const [detail, setDetail] = useState<LandlordApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [requestedSections, setRequestedSections] = useState<Set<PassportSectionKey>>(new Set());

  useEffect(() => {
    if (!user) return;
    getLandlordApplicationDetail(user, applicationId)
      .then((nextDetail) => {
        setDetail(nextDetail);
        return logLandlordSectionView(user, applicationId, sectionKey);
      })
      .catch((nextError: Error) => setError(nextError.message));
  }, [applicationId, sectionKey, user]);

  const section = useMemo(
    () => detail?.sections.find((item) => item.key === sectionKey),
    [detail, sectionKey],
  );

  if (error)
    return (
      <PageContainer>
        <Alert tone="error">{error}</Alert>
      </PageContainer>
    );
  if (!detail || !section)
    return (
      <PageContainer>
        <Skeleton className="h-96 w-full" />
      </PageContainer>
    );

  const createRequest = async () => {
    if (!user) return;
    try {
      const request = await requestLandlordInformation(
        user,
        applicationId,
        section.key,
        section.requestActionLabel,
        `${section.requestActionLabel} requested by landlord from the passport detail page.`,
      );
      await createLandlordInformationRequest(user, {
        applicationId,
        passportId: detail.application.passport_id,
        passportVersionId: detail.application.passport_version_id,
        tenantUserId: detail.application.tenant_user_id,
        sectionKey: section.key,
        requestType: landlordRequestType(section.key),
        message: `${section.requestActionLabel} requested by landlord from the passport detail page.`,
      });
      setRequestedSections((current) => new Set(current).add(request.section_key));
      setNotice(`${section.requestActionLabel} sent to the tenant.`);
    } catch (requestError) {
      setNotice(requestError instanceof Error ? requestError.message : 'Unable to create request.');
    }
  };

  const isRequested = requestedSections.has(section.key);

  return (
    <PageContainer>
      <PageHeader
        eyebrow={detail.application.applicant_name}
        title={section.name}
        description={section.summary}
        actions={
          <Button onClick={() => onNavigate(`/landlord/applications/${applicationId}/passport`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Passport
          </Button>
        }
      />
      {notice && <Alert tone={notice.includes('sent') ? 'success' : 'error'}>{notice}</Alert>}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <PassportStatusBadge label={section.completenessStatus} />
            <PassportStatusBadge label={section.verificationState} verification />
            {section.verificationDate && <Badge tone="green">Reviewed {formatDate(section.verificationDate)}</Badge>}
            {section.expiresAt && <Badge tone="slate">Expires {formatDate(section.expiresAt)}</Badge>}
          </div>
          <h2 className="mt-6 text-xl font-black">Supplied information</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {section.suppliedInformation.map((item) => (
              <DetailRow key={item.label} label={item.label} value={item.value} />
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
            <h2 className="text-xl font-black">Supporting documents</h2>
            <div className="mt-4 space-y-3">
              {section.permittedDocuments.length > 0 ? (
                section.permittedDocuments.map((document) => (
                  <div key={document.name} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="font-black">{document.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{document.status} - {document.access}</p>
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
            <h2 className="text-xl font-black">Request information</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Ask the tenant for missing, updated, or reverified information for this section.
            </p>
            <Button className="mt-4 w-full" variant={isRequested ? 'secondary' : 'primary'} onClick={createRequest} disabled={isRequested}>
              {isRequested ? 'Requested' : section.requestActionLabel}
            </Button>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}

function SectionSummaryCard({
  section,
  requested,
  onOpen,
}: {
  section: LandlordPassportSection;
  requested: boolean;
  onOpen: () => void;
}) {
  const outcome = landlordSectionOutcome(section, requested);
  return (
    <button
      className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-soft transition hover:border-blue-200 hover:bg-blue-50/40"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <PassportStatusBadge label={outcome} verification={outcome === 'Verified'} />
          <h3 className="mt-3 text-lg font-black">{section.name}</h3>
        </div>
        <ChevronRight className="mt-1 h-5 w-5 text-slate-400" />
      </div>
      <p className="mt-3 min-h-12 text-sm leading-6 text-slate-700">{section.summary}</p>
    </button>
  );
}

function landlordSectionOutcome(section: LandlordPassportSection, requested: boolean) {
  if (requested) return 'Requested';
  if (section.completenessStatus === 'Needs Reverification' || section.verificationState === 'Needs Reverification') return 'Needs Reverification';
  if (section.completenessStatus === 'Under Review' || section.verificationState === 'Under Review') return 'Under Review';
  if (section.completenessStatus === 'Missing') return 'Missing';
  if (section.verificationState === 'Verified') return 'Verified';
  if (section.completenessStatus === 'Incomplete') return 'Incomplete';
  return 'Provided';
}

function landlordRequestType(sectionKey: PassportSectionKey) {
  const map = {
    identity_confirmation: 'identity_confirmation',
    credit_report: 'credit_report',
    employment: 'updated_employment',
    rental_history: 'additional_rental_history',
    references: 'another_reference',
  } as const;
  return map[sectionKey];
}

function PassportStatusBadge({ label, verification = false }: { label: string; verification?: boolean }) {
  const lower = label.toLowerCase();
  const tone = lower.includes('verified')
    ? 'blue'
    : lower.includes('missing') || lower.includes('expired')
      ? 'red'
      : lower.includes('review') || lower.includes('requested') || lower.includes('incomplete')
        ? 'orange'
        : lower.includes('provided') || lower.includes('complete')
          ? 'blue'
          : 'slate';
  return (
    <Badge tone={tone} className="items-center gap-1">
      {verification && lower.includes('verified') && <ShieldCheck className="h-3.5 w-3.5" />}
      {label}
    </Badge>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <strong className="mt-1 block text-lg text-navy">{value}</strong>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}
