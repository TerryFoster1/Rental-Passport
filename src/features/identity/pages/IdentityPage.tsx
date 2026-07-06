import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { ArrowLeft, IdCard, ShieldCheck } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ConsentCheckbox } from '@/components/forms/ConsentCheckbox';
import { DocumentList } from '@/components/forms/DocumentList';
import { FormSectionCard } from '@/components/forms/FormSectionCard';
import { SaveStatusIndicator } from '@/components/forms/SaveStatusIndicator';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/features/auth/AuthProvider';
import { ContactVerificationStatus } from '@/features/identity/components/ContactVerificationStatus';
import { IdentityDocumentUpload } from '@/features/identity/components/IdentityDocumentUpload';
import { IdentityReadinessChecklist } from '@/features/identity/components/IdentityReadinessChecklist';
import { PrivacyTrustNotice } from '@/features/identity/components/PrivacyTrustNotice';
import { sectionStatusLabel } from '@/features/passport/components/passportLabels';
import { usePassportSummary } from '@/features/passport/usePassportSummary';
import {
  emptyIdentityForm,
  getIdentityModuleState,
  markIdentityReadyForReview,
  markIdentityUnderReview,
  saveIdentityDraft,
  uploadIdentityDocument,
} from '@/services/identityService';
import type { IdentityDocumentType, IdentityFormData, IdentityModuleState, IdentityUploadKind } from '@/types/identity';

export function IdentityPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user, isEmailVerified } = useAuth();
  const passportState = usePassportSummary();
  const [moduleState, setModuleState] = useState<IdentityModuleState | null>(null);
  const [form, setForm] = useState<IdentityFormData>({ ...emptyIdentityForm, email: user?.email ?? '' });
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadIdentity = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const nextState = await getIdentityModuleState(user);
      setModuleState(nextState);
      if (nextState.profile) setForm(profileToForm(nextState.profile));
    } catch (identityError) {
      setError(identityError instanceof Error ? identityError.message : 'Unable to load identity section.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadIdentity();
    });
  }, [loadIdentity]);

  const identitySection = passportState.summary?.sections.find((section) => section.key === 'identity_confirmation');
  const requiredSignalsReady = useMemo(() => {
    const requiredKeys = ['legal_details', 'address_provided', 'email_verified', 'phone_placeholder', 'tenant_consent', 'manual_review'];
    return requiredKeys.every((key) => moduleState?.signals.find((signal) => signal.key === key)?.complete);
  }, [moduleState?.signals]);

  const updateField = <Key extends keyof IdentityFormData>(key: Key, value: IdentityFormData[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaveState('idle');
    setNotice('');
  };

  const updateTextField = (key: keyof IdentityFormData) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => updateField(key, event.target.value as never);

  const saveDraft = async () => {
    if (!user) return;
    setSaveState('saving');
    setError('');
    setNotice('');
    try {
      const nextState = await saveIdentityDraft(user, form);
      setModuleState(nextState);
      setSaveState('saved');
      setNotice('Identity draft saved. Passport completeness has been updated.');
      await passportState.refresh();
    } catch (identityError) {
      setSaveState('idle');
      setError(identityError instanceof Error ? identityError.message : 'Unable to save identity draft.');
    }
  };

  const uploadDocument = async (kind: IdentityUploadKind, file: File) => {
    if (!user) return;
    setError('');
    setNotice('');
    try {
      const nextState = await uploadIdentityDocument(user, kind, file);
      setModuleState(nextState);
      setNotice(`${file.name} was uploaded securely. No public download link was created.`);
      await passportState.refresh();
    } catch (identityError) {
      setError(identityError instanceof Error ? identityError.message : 'Unable to upload identity file.');
    }
  };

  const markReady = async () => {
    if (!user) return;
    setError('');
    setNotice('');
    try {
      const nextState = await markIdentityReadyForReview(user, form);
      setModuleState(nextState);
      setNotice('Identity section is ready for manual review. Identity review is usually completed within 24 hours.');
      await passportState.refresh();
    } catch (identityError) {
      setError(identityError instanceof Error ? identityError.message : 'Complete required identity details and consent before requesting review.');
    }
  };

  const markUnderReview = async () => {
    if (!user) return;
    setError('');
    try {
      const nextState = await markIdentityUnderReview(user);
      setModuleState(nextState);
      setNotice('Under Review placeholder state is active. Provider-based verification is not implemented yet.');
      await passportState.refresh();
    } catch (identityError) {
      setError(identityError instanceof Error ? identityError.message : 'Unable to start review placeholder.');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-16 w-2/3" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Identity"
        title="Identity Verification"
        description="Confirm account identity signals with secure manual review. This does not approve a tenant or determine housing eligibility."
        actions={
          <Button onClick={() => onNavigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {error && <Alert tone="error">{error}</Alert>}
          {notice && <Alert tone="success">{notice}</Alert>}

          <Alert tone="info" title="Identity documents stay protected">
            Landlords see identity verification status in future sharing flows, not your full ID document or selfie.
          </Alert>

          <FormSectionCard title="Legal Identity" description="Use your legal name exactly as it appears on your government-issued ID.">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Legal first name" value={form.legal_first_name} onChange={updateTextField('legal_first_name')} required />
              <Input label="Middle name (optional)" value={form.middle_name} onChange={updateTextField('middle_name')} />
              <Input label="Legal last name" value={form.legal_last_name} onChange={updateTextField('legal_last_name')} required />
              <Input label="Preferred name (optional)" value={form.preferred_name} onChange={updateTextField('preferred_name')} />
              <Input label="Date of birth" type="date" value={form.date_of_birth} onChange={updateTextField('date_of_birth')} required />
              <SelectField label="Accepted ID type" value={form.id_document_type} onChange={updateTextField('id_document_type')} options={identityDocumentTypeOptions} />
              <Input label="Country" value={form.country} onChange={updateTextField('country')} required />
              <Input label="Province / State" value={form.province_state} onChange={updateTextField('province_state')} required />
              <div className="md:col-span-2">
                <Input label="Current address" value={form.current_address} onChange={updateTextField('current_address')} required />
              </div>
            </div>
          </FormSectionCard>

          <FormSectionCard title="Contact Verification" description="Email uses your account verification status. Phone verification remains a manual placeholder for MVP.">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Email" type="email" value={form.email} onChange={updateTextField('email')} required />
              <Input label="Phone number" value={form.phone_number} onChange={updateTextField('phone_number')} required />
            </div>
          </FormSectionCard>

          <FormSectionCard title="Government ID Upload" description="Upload the front and back of your government-issued ID. These documents are private by default.">
            <div className="space-y-4">
              <IdentityDocumentUpload kind="government_id_front" onFileSelected={uploadDocument} />
              <IdentityDocumentUpload kind="government_id_back" onFileSelected={uploadDocument} />
            </div>
          </FormSectionCard>

          <FormSectionCard title="Selfie Upload" description="Upload a selfie for manual comparison. The selfie is not displayed elsewhere and is never used as your profile photo.">
            <IdentityDocumentUpload kind="selfie" onFileSelected={uploadDocument} />
          </FormSectionCard>

          <FormSectionCard title="Uploaded Identity Files" description="Raw ID documents and selfies are not exposed outside tenant-owned and future internal reviewer paths.">
            <DocumentList documents={moduleState?.documents ?? []} />
          </FormSectionCard>

          <FormSectionCard title="Privacy & Consent" description="Consent is required before identity can be submitted for review. You can save a draft without submitting for review.">
            <div className="space-y-3">
              <ConsentCheckbox checked={form.consent_review_government_id} onChange={(event) => updateField('consent_review_government_id', event.target.checked)} label="I consent to Rental Passport reviewing my government ID." />
              <ConsentCheckbox checked={form.consent_review_selfie} onChange={(event) => updateField('consent_review_selfie', event.target.checked)} label="I consent to Rental Passport reviewing my selfie for manual comparison." />
              <ConsentCheckbox checked={form.consent_confirm_legal_identity} onChange={(event) => updateField('consent_confirm_legal_identity', event.target.checked)} label="I consent to Rental Passport confirming my legal identity details." />
              <ConsentCheckbox checked={form.consent_store_verification_result} onChange={(event) => updateField('consent_store_verification_result', event.target.checked)} label="I consent to Rental Passport storing the identity verification result." />
              <ConsentCheckbox checked={form.consent_share_identity_status} onChange={(event) => updateField('consent_share_identity_status', event.target.checked)} label="I consent to sharing identity verification status with intended landlords in future sharing flows." />
            </div>
          </FormSectionCard>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <SaveStatusIndicator state={saveState} />
            <div className="flex flex-wrap gap-3">
              <Button onClick={saveDraft}>Save Draft</Button>
              <Button variant="primary" onClick={markReady} disabled={!requiredSignalsReady}>
                Mark Ready for Review
              </Button>
              {moduleState?.status === 'ready_for_review' && <Button onClick={markUnderReview}>Start Under Review Placeholder</Button>}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <IdCard className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">Identity Summary</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">Identity review is usually completed within 24 hours after manual review begins.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <StatusBadge status={identitySection ? sectionStatusLabel(identitySection.status) : 'In Progress'} />
              <Badge tone="blue">{identitySection?.progress ?? 50}% Complete</Badge>
              <p className="text-sm text-slate-600">Required uploads: ID front, ID back, and selfie.</p>
            </div>
          </Card>

          <ContactVerificationStatus emailVerified={isEmailVerified} phoneStatus={moduleState?.profile?.phone_verification_status ?? 'manual_pending'} />
          <IdentityReadinessChecklist signals={moduleState?.signals ?? []} />
          <PrivacyTrustNotice />

          <Card className="p-6">
            <div className="flex gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <p className="text-sm leading-6 text-slate-700">Future AI-assisted review, OCR, tamper detection, and paid ID provider integrations are intentionally not implemented in this MVP phase.</p>
            </div>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (event: ChangeEvent<HTMLSelectElement>) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <select className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-navy outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function profileToForm(profile: IdentityFormData): IdentityFormData {
  return {
    ...emptyIdentityForm,
    ...profile,
  };
}

const identityDocumentTypeOptions: Array<{ value: IdentityDocumentType; label: string }> = [
  { value: 'drivers_licence', label: "Driver's licence" },
  { value: 'passport', label: 'Passport' },
  { value: 'state_id', label: 'Provincial / State ID' },
  { value: 'permanent_resident_card', label: 'Permanent resident card' },
  { value: 'other_government_id', label: 'Other government-issued ID' },
];
