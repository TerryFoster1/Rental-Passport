import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { StatusBadge, VerifiedBadge } from '@/components/ui/Badge';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProgressCard } from '@/components/layout/ProgressCard';
import { useAuth } from '@/features/auth/AuthProvider';
import { upsertCurrentProfile, type ProfileInput } from '@/services/profileService';

const defaultProfile = {
  legal_first_name: '',
  middle_name: '',
  legal_last_name: '',
  preferred_name: '',
  phone: '',
  country: 'Canada',
  province_state: 'Ontario',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Toronto',
};

export function ProfilePage({ onNavigate, onboarding = false }: { onNavigate: (path: string) => void; onboarding?: boolean }) {
  const auth = useAuth();
  const [form, setForm] = useState<ProfileInput>(defaultProfile);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!auth.profile || cancelled) return;
      setForm({
        legal_first_name: auth.profile.legal_first_name ?? '',
        middle_name: auth.profile.middle_name ?? '',
        legal_last_name: auth.profile.legal_last_name ?? '',
        preferred_name: auth.profile.preferred_name ?? '',
        phone: auth.profile.phone ?? '',
        country: auth.profile.country ?? 'Canada',
        province_state: auth.profile.province_state ?? 'Ontario',
        language: auth.profile.language ?? 'en',
        timezone: auth.profile.timezone ?? defaultProfile.timezone,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [auth.profile]);

  const update = (key: keyof ProfileInput, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!auth.user) return;
    setError('');
    setSaved(false);
    try {
      await upsertCurrentProfile(auth.user, form);
      await auth.refreshProfile();
      setSaved(true);
      if (onboarding) onNavigate('/app');
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : 'Unable to save profile.');
    }
  };

  const completion = auth.profile ? 100 : 60;

  return (
    <PageContainer>
      <PageHeader
        eyebrow={onboarding ? 'Required onboarding' : 'Profile'}
        title={onboarding ? 'Complete your account profile' : 'Account profile'}
        description="Phase 1 collects account identity and contact fields only. Passport data begins in Phase 2."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-6">
          {error && <Alert tone="error">{error}</Alert>}
          {saved && <Alert tone="success">Profile saved.</Alert>}
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={submit}>
            <Input label="Legal First Name" value={form.legal_first_name} onChange={(event) => update('legal_first_name', event.target.value)} required />
            <Input label="Middle Name (optional)" value={form.middle_name} onChange={(event) => update('middle_name', event.target.value)} />
            <Input label="Legal Last Name" value={form.legal_last_name} onChange={(event) => update('legal_last_name', event.target.value)} required />
            <Input label="Preferred Name (optional)" value={form.preferred_name} onChange={(event) => update('preferred_name', event.target.value)} />
            <Input label="Email" value={auth.user?.email ?? ''} readOnly />
            <Input label="Phone" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="Manual confirmation in Phase 1" />
            <Input label="Country" value={form.country} onChange={(event) => update('country', event.target.value)} required />
            <Input label="Province/State" value={form.province_state} onChange={(event) => update('province_state', event.target.value)} required />
            <Input label="Language" value={form.language} onChange={(event) => update('language', event.target.value)} required />
            <Input label="Timezone" value={form.timezone} onChange={(event) => update('timezone', event.target.value)} required />
            <div className="md:col-span-2">
              <Button variant="primary" type="submit">Save Profile</Button>
            </div>
          </form>
        </Card>
        <aside className="space-y-5">
          <ProgressCard label="Account foundation" value={completion} description="Profile and trust-layer readiness for future passport features." />
          <Card className="p-6">
            <h2 className="text-xl font-black">Verification Status</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 font-semibold"><Mail className="h-5 w-5 text-blue-700" />Email</span>
                {auth.isEmailVerified ? <VerifiedBadge label="Email Verified" /> : <StatusBadge status="Needs Verification" />}
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 font-semibold"><Phone className="h-5 w-5 text-blue-700" />Phone</span>
                <StatusBadge status="Manual Placeholder" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-black">Consent Records</h2>
            <div className="mt-4 flex gap-3 rounded-xl bg-slate-50 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <p className="text-sm text-slate-700">Consent tables are available for account terms, privacy, verification, and future document access. No passport consents are collected in Phase 1.</p>
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="flex items-center gap-2 text-xl font-black"><ShieldCheck className="h-5 w-5 text-emerald-600" />Account Status</h2>
            <div className="mt-4"><StatusBadge status={auth.profile?.account_status ?? 'Profile Pending'} /></div>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
