import { useEffect, useMemo, useState } from 'react';
import { Archive, ArrowLeft, CheckCircle2, Eye, FileText, LockKeyhole, Mail, ShieldCheck, Star } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/feedback/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge, VerifiedBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/features/auth/AuthProvider';
import { SignInPage } from '@/features/auth/AuthPages';
import { activateSecureAccess, getLandlordApplicationDetail, getSecureInvite, listLandlordApplications, logLandlordSectionView, updateLandlordApplicationStatus } from '@/services/sharingService';
import type { PassportSectionKey } from '@/types/passport';
import type { LandlordApplication, LandlordApplicationDetail, LandlordApplicationStatus, SecureInviteState } from '@/types/sharing';

export function LandlordSecureAccessPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const auth = useAuth();
  const token = new URLSearchParams(window.location.search).get('token');
  const [invite, setInvite] = useState<SecureInviteState | null>(null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getSecureInvite(token).then(setInvite).catch((error: Error) => setInvite({ status: 'invalid', message: error.message }));
  }, [token]);

  const createAccess = async () => {
    if (!token || !invite || invite.status !== 'valid') return;
    setBusy(true);
    setMessage(null);
    try {
      if (!auth.user) {
        const result = await auth.signUpWithPassword(invite.share.landlord_email, password);
        if (result.error) throw result.error;
        setMessage('Secure access created. Verify your email, then return to this invitation to continue securely.');
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

  if (!invite) return <PageContainer><Skeleton className="h-64 w-full" /></PageContainer>;

  if (invite.status !== 'valid') {
    return (
      <PageContainer>
        <PageHeader eyebrow="Secure Access" title="Invitation unavailable" description={invite.message} />
        <Alert tone="error">{invite.message}</Alert>
      </PageContainer>
    );
  }

  if (!auth.user) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Secure Access" title="Protect applicant information" description="Create secure access or sign in before viewing this shared Rental Passport." />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <LockKeyhole className="h-10 w-10 text-blue-700" />
            <h2 className="mt-4 text-2xl font-black">Create Secure Access</h2>
            <p className="mt-2 text-slate-700">This invitation is restricted to {invite.share.landlord_email}.</p>
            {message && <div className="mt-4"><Alert tone={message.includes('created') ? 'success' : 'error'}>{message}</Alert></div>}
            <div className="mt-5 space-y-4">
              <Input label="Recipient email" value={invite.share.landlord_email} readOnly />
              <Input label="Secure password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <Button variant="primary" onClick={createAccess} disabled={busy || password.length < 8}>{busy ? 'Securing...' : 'Continue Securely'}</Button>
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-black">Existing access</h2>
            <p className="mt-2 text-slate-700">If you already secured this application, sign in using the invited email.</p>
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
      <PageHeader eyebrow="Secure Access" title="Continue securely" description="Your account will only see applications shared with your email." />
      {message && <Alert tone="error">{message}</Alert>}
      <Card className="p-6">
        <p className="text-slate-700">Invitation for {invite.share.landlord_email}. Access expires {new Date(invite.share.expires_at).toLocaleDateString()}.</p>
        <Button className="mt-5" variant="primary" onClick={createAccess} disabled={busy}>{busy ? 'Checking...' : 'Secure This Application'}</Button>
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
      <PageHeader eyebrow="Landlord Applications" title="Applications" description="A simple view of Rental Passports shared specifically with your email." />
      {error && <Alert tone="error">{error}</Alert>}
      {loading ? <Skeleton className="h-52 w-full" /> : applications.length > 0 ? (
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
                    <p className="mt-1 text-sm text-slate-600">Passport {application.passport_number}</p>
                    {application.property_address && <p className="mt-1 text-sm text-slate-600">{application.property_address}</p>}
                  </div>
                </div>
                <div className="grid gap-3 text-sm md:grid-cols-3 lg:min-w-[430px]">
                  <Metric label="Completeness" value={`${application.completeness}%`} />
                  <Metric label="Verification" value={application.verification_status} />
                  <Metric label="Expires" value={new Date(application.expires_at).toLocaleDateString()} />
                </div>
                <Button variant="primary" onClick={() => onNavigate(`/landlord/applications/${application.id}/passport`)}>View Passport</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="No shared applications" description="Applications appear here only after a tenant shares a Rental Passport with your email." />}
    </PageContainer>
  );
}

export function LandlordPassportPage({ applicationId, onNavigate }: { applicationId: string; onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const [detail, setDetail] = useState<LandlordApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getLandlordApplicationDetail(user, applicationId).then(setDetail).catch((nextError: Error) => setError(nextError.message));
  }, [applicationId, user]);

  const action = async (status: LandlordApplicationStatus) => {
    if (!user || !detail) return;
    await updateLandlordApplicationStatus(user, detail.application.id, status);
    setDetail({ ...detail, application: { ...detail.application, status } });
  };

  if (error) return <PageContainer><Alert tone="error">{error}</Alert></PageContainer>;
  if (!detail) return <PageContainer><Skeleton className="h-96 w-full" /></PageContainer>;

  return (
    <PageContainer>
      <PageHeader eyebrow="Shared Passport" title={detail.application.applicant_name} description="Review the verified summary. Sensitive documents are not downloadable." actions={<Button onClick={() => onNavigate('/landlord/applications')}><ArrowLeft className="mr-2 h-4 w-4" />Applications</Button>} />
      <Card className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={detail.application.applicant_name} />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-black">{detail.application.applicant_name}</h2>
                <VerifiedBadge label="Fully Verified" />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-600">Passport ID: {detail.application.passport_number}</p>
              <p className="mt-1 text-sm text-slate-600">Received {new Date(detail.application.received_at).toLocaleDateString()} · Expires {new Date(detail.application.expires_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button><Mail className="mr-2 h-4 w-4" />Message Applicant</Button>
            <Button onClick={() => action('saved')}><Star className="mr-2 h-4 w-4" />Save Applicant</Button>
            <Button variant="primary" onClick={() => action('accepted')}><CheckCircle2 className="mr-2 h-4 w-4" />Accept Applicant</Button>
            <Button variant="danger" onClick={() => action('archived')}><Archive className="mr-2 h-4 w-4" />Reject / Archive</Button>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Metric label="Passport completeness" value={`${detail.application.completeness}%`} />
          <Metric label="Verification status" value={detail.application.verification_status} />
          <Metric label="Application status" value={detail.application.status} />
        </div>
      </Card>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {detail.sections.map((section) => (
          <Card key={section.key} className="p-5">
            <ShieldCheck className="h-8 w-8 text-emerald-700" />
            <h3 className="mt-4 text-lg font-black">{section.name}</h3>
            <p className="mt-2 text-sm text-slate-600">{section.progress}% complete</p>
            <div className="mt-3"><StatusBadge status={section.status} /></div>
            <Button className="mt-5 w-full" onClick={() => onNavigate(section.route)}>View Details</Button>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <Alert tone="info">Access is logged and limited to this recipient email. ID, selfie, pay stubs, credit reports, bank records, leases, and reference responses cannot be downloaded.</Alert>
      </div>
    </PageContainer>
  );
}

export function LandlordDetailPage({ applicationId, sectionKey, onNavigate }: { applicationId: string; sectionKey: PassportSectionKey; onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const [detail, setDetail] = useState<LandlordApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getLandlordApplicationDetail(user, applicationId)
      .then((nextDetail) => {
        setDetail(nextDetail);
        return logLandlordSectionView(user, applicationId, sectionKey);
      })
      .catch((nextError: Error) => setError(nextError.message));
  }, [applicationId, sectionKey, user]);

  const section = useMemo(() => detail?.sections.find((item) => item.key === sectionKey), [detail, sectionKey]);

  if (error) return <PageContainer><Alert tone="error">{error}</Alert></PageContainer>;
  if (!detail || !section) return <PageContainer><Skeleton className="h-96 w-full" /></PageContainer>;

  return (
    <PageContainer>
      <PageHeader eyebrow="Application Detail" title={section.name} description="View-only verification detail for this shared application." actions={<Button onClick={() => onNavigate(`/landlord/applications/${applicationId}/passport`)}><ArrowLeft className="mr-2 h-4 w-4" />Passport Summary</Button>} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <VerifiedBadge label={section.verification_state === 'verified' ? 'Verified' : 'Needs Review'} />
            <StatusBadge status={section.status} />
          </div>
          <h2 className="mt-5 text-2xl font-black">What was verified</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <DetailRow label="Section" value={section.name} />
            <DetailRow label="Verification status" value={section.verification_state.replaceAll('_', ' ')} />
            <DetailRow label="Completeness" value={`${section.progress}%`} />
            <DetailRow label="How it was verified" value="Reviewed through Rental Passport verification workflow records." />
          </div>
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-blue-700" />
              <h3 className="font-black">Supporting document viewer placeholder</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">Authorized supporting documents will open in a controlled, view-only session. Downloads are disabled and future watermarking is reserved for the document viewer phase.</p>
          </div>
        </Card>
        <aside className="space-y-6">
          <Card className="p-6">
            <FileText className="h-8 w-8 text-blue-700" />
            <h2 className="mt-4 text-xl font-black">Audit notice</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">This section view is logged for tenant transparency and access control.</p>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-black">Allowed downloads</h2>
            <div className="mt-4 space-y-3">
              <Button className="w-full">Application Summary Placeholder</Button>
              <Button className="w-full">Verification Certificate Placeholder</Button>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-600">Sensitive source documents are view-only and cannot be downloaded.</p>
          </Card>
        </aside>
      </div>
    </PageContainer>
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
