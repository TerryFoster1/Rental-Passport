import { useEffect, useMemo, useState } from 'react';
import { Clock, Copy, LockKeyhole, RotateCcw, ShieldCheck } from 'lucide-react';
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
import { ActivityLogItem } from '@/features/passport/components/ActivityLogItem';
import { usePassportSummary } from '@/features/passport/usePassportSummary';
import { createPassportShare, defaultShareForm, getTenantShareAccessLogs, listTenantShares, revokePassportShare } from '@/services/sharingService';
import type { PassportShare, ShareAccessLog, ShareFormData, ShareInvitation } from '@/types/sharing';

export function TenantSharePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const passportState = usePassportSummary();
  const [form, setForm] = useState<ShareFormData>(() => defaultShareForm(null));
  const [shares, setShares] = useState<PassportShare[]>([]);
  const [logs, setLogs] = useState<ShareAccessLog[]>([]);
  const [invitation, setInvitation] = useState<ShareInvitation | null>(null);
  const [loadingShares, setLoadingShares] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([listTenantShares(user), getTenantShareAccessLogs(user)])
      .then(([nextShares, nextLogs]) => {
        setShares(nextShares);
        setLogs(nextLogs);
      })
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setLoadingShares(false));
  }, [user]);

  const versionOptions = useMemo(() => {
    if (!passportState.summary) return [];
    return [
      { id: passportState.summary.currentVersion.id, label: `Current version ${passportState.summary.currentVersion.version_number}` },
      { id: passportState.summary.draftVersion.id, label: `Draft version ${passportState.summary.draftVersion.version_number}` },
    ].filter((option, index, options) => options.findIndex((candidate) => candidate.id === option.id) === index);
  }, [passportState.summary]);

  const updateForm = (field: keyof ShareFormData, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const submitShare = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createPassportShare(user, { ...form, passport_version_id: form.passport_version_id || versionOptions[0]?.id || '' });
      setInvitation(created);
      const [nextShares, nextLogs] = await Promise.all([listTenantShares(user), getTenantShareAccessLogs(user)]);
      setShares(nextShares);
      setLogs(nextLogs);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to create secure invitation.');
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (shareId: string) => {
    if (!user) return;
    await revokePassportShare(user, shareId);
    setShares(await listTenantShares(user));
  };

  if (passportState.loading) return <ShareLoading />;
  if (passportState.error) return <PageContainer><Alert tone="error">{passportState.error}</Alert></PageContainer>;
  if (!passportState.summary) return <PageContainer><EmptyState title="Passport unavailable" description="Create your passport before sharing it securely." /></PageContainer>;

  return (
    <PageContainer>
      <PageHeader eyebrow="Secure Sharing" title="Share your passport" description="Share your passport securely without emailing sensitive documents." actions={<Button onClick={() => onNavigate('/dashboard')}>Dashboard</Button>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-2xl font-black">Generate a secure invitation</h2>
                <p className="mt-2 max-w-2xl text-slate-700">Landlords can view your verified summary, but they cannot download your sensitive documents.</p>
              </div>
              <Badge tone="green">Recipient specific</Badge>
            </div>
            {error && <div className="mt-5"><Alert tone="error">{error}</Alert></div>}
            {invitation && <div className="mt-5"><Alert tone="success">Invitation placeholder created for {invitation.share.landlord_email}. Secure URL: {invitation.invitationUrl}</Alert></div>}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Passport version</span>
                <select className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-navy outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={form.passport_version_id || versionOptions[0]?.id || ''} onChange={(event) => updateForm('passport_version_id', event.target.value)}>
                  {versionOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
              </label>
              <Input label="Landlord / property manager name" value={form.landlord_name} onChange={(event) => updateForm('landlord_name', event.target.value)} />
              <Input label="Landlord / property manager email" type="email" value={form.landlord_email} onChange={(event) => updateForm('landlord_email', event.target.value)} />
              <Input label="Property address (optional)" value={form.property_address} onChange={(event) => updateForm('property_address', event.target.value)} />
              <Input label="Access expires" type="date" value={form.expires_at} onChange={(event) => updateForm('expires_at', event.target.value)} />
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">Short message (optional)</span>
                <textarea className="mt-1 min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-navy outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={form.message} onChange={(event) => updateForm('message', event.target.value)} />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="primary" onClick={submitShare} disabled={saving}>{saving ? 'Creating...' : 'Generate Secure Invitation'}</Button>
              {invitation && <Button onClick={() => navigator.clipboard.writeText(invitation.invitationUrl)}><Copy className="mr-2 h-4 w-4" />Copy Placeholder URL</Button>}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-black">Active shares</h2>
            <p className="mt-2 text-sm text-slate-600">You can revoke access anytime.</p>
            <div className="mt-5 divide-y divide-slate-100">
              {loadingShares ? <Skeleton className="h-24 w-full" /> : shares.length > 0 ? (
                shares.map((share) => (
                  <div key={share.id} className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong>{share.landlord_name}</strong>
                        <StatusBadge status={share.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{share.landlord_email}</p>
                      <p className="mt-1 text-sm text-slate-600">Expires {new Date(share.expires_at).toLocaleDateString()}</p>
                      {share.property_address && <p className="mt-1 text-sm text-slate-600">{share.property_address}</p>}
                    </div>
                    {share.status === 'active' && <Button variant="danger" onClick={() => revoke(share.id)}><RotateCcw className="mr-2 h-4 w-4" />Revoke</Button>}
                  </div>
                ))
              ) : <EmptyState title="No active shares" description="Create a secure invitation when a landlord needs to review your passport." />}
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-6">
            <ShieldCheck className="h-9 w-9 text-emerald-700" />
            <h2 className="mt-4 text-xl font-black">Tenant controlled</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p>Every share is tied to one recipient email.</p>
              <p>Access expires automatically and can be revoked earlier.</p>
              <p>Sensitive documents remain view-only through controlled access.</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-700" />
              <h2 className="text-xl font-black">Access history</h2>
            </div>
            <div className="mt-4">
              {logs.length > 0 ? (
                <ul>{logs.map((log) => <ActivityLogItem key={log.id} activity={{ id: log.id, passport_id: log.passport_share_id, actor_user_id: log.actor_user_id, event_type: 'section_updated', description: log.description, visibility: 'tenant', created_at: log.created_at }} />)}</ul>
              ) : (
                <p className="text-sm leading-6 text-slate-600">Landlord access events will appear here after secure access is used.</p>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}

function ShareLoading() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <Skeleton className="h-16 w-2/3" />
        <Skeleton className="h-80 w-full" />
      </div>
    </PageContainer>
  );
}
