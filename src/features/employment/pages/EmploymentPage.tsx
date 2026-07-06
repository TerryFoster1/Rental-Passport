import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { ArrowLeft, BriefcaseBusiness, ShieldCheck } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ConsentCheckbox } from '@/components/forms/ConsentCheckbox';
import { DocumentList } from '@/components/forms/DocumentList';
import { FormSectionCard } from '@/components/forms/FormSectionCard';
import { SaveStatusIndicator } from '@/components/forms/SaveStatusIndicator';
import { UploadBox } from '@/components/forms/UploadBox';
import { VerificationReadinessCard } from '@/components/forms/VerificationReadinessCard';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/features/auth/AuthProvider';
import { sectionStatusLabel } from '@/features/passport/components/passportLabels';
import { usePassportSummary } from '@/features/passport/usePassportSummary';
import {
  emptyEmploymentForm,
  getEmploymentModuleState,
  markEmploymentReadyForReview,
  markEmploymentUnderReview,
  saveEmploymentDraft,
  uploadEmploymentDocument,
} from '@/services/employmentService';
import type { EmploymentDocumentKind, EmploymentFormData, EmploymentModuleState } from '@/types/employment';

export function EmploymentPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const passportState = usePassportSummary();
  const [moduleState, setModuleState] = useState<EmploymentModuleState | null>(null);
  const [form, setForm] = useState<EmploymentFormData>(emptyEmploymentForm);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadEmployment = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const nextState = await getEmploymentModuleState(user);
      setModuleState(nextState);
      if (nextState.record) setForm(recordToForm(nextState.record));
    } catch (employmentError) {
      setError(employmentError instanceof Error ? employmentError.message : 'Unable to load employment section.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadEmployment();
    });
  }, [loadEmployment]);

  const employmentSection = passportState.summary?.sections.find((section) => section.key === 'employment');
  const requiredSignalsReady = useMemo(() => {
    const requiredKeys = ['employer_details', 'company_domain', 'employer_contact', 'tenant_consent', 'manual_review'];
    return requiredKeys.every((key) => moduleState?.signals.find((signal) => signal.key === key)?.complete);
  }, [moduleState?.signals]);

  const updateField = <Key extends keyof EmploymentFormData>(key: Key, value: EmploymentFormData[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaveState('idle');
    setNotice('');
  };

  const updateTextField = (key: keyof EmploymentFormData) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => updateField(key, event.target.value as never);

  const saveDraft = async () => {
    if (!user) return;
    setSaveState('saving');
    setError('');
    setNotice('');

    try {
      const nextState = await saveEmploymentDraft(user, form);
      setModuleState(nextState);
      setSaveState('saved');
      setNotice('Employment draft saved. Passport completeness has been updated.');
      await passportState.refresh();
    } catch (employmentError) {
      setSaveState('idle');
      setError(employmentError instanceof Error ? employmentError.message : 'Unable to save employment draft.');
    }
  };

  const uploadDocument = async (kind: EmploymentDocumentKind, file: File) => {
    if (!user) return;
    setError('');
    setNotice('');

    try {
      const nextState = await uploadEmploymentDocument(user, kind, file);
      setModuleState(nextState);
      setNotice(`${file.name} was uploaded securely. No public download link was created.`);
      await passportState.refresh();
    } catch (employmentError) {
      setError(employmentError instanceof Error ? employmentError.message : 'Unable to upload document.');
    }
  };

  const markReady = async () => {
    if (!user) return;
    setError('');
    setNotice('');

    try {
      const nextState = await markEmploymentReadyForReview(user, form);
      setModuleState(nextState);
      setNotice('Employment section is ready for manual review.');
      await passportState.refresh();
    } catch (employmentError) {
      setError(employmentError instanceof Error ? employmentError.message : 'Complete required employment details and consent before requesting review.');
    }
  };

  const markUnderReview = async () => {
    if (!user) return;
    setError('');

    try {
      const nextState = await markEmploymentUnderReview(user);
      setModuleState(nextState);
      setNotice('Under Review placeholder state is active. Manual review automation is not implemented yet.');
      await passportState.refresh();
    } catch (employmentError) {
      setError(employmentError instanceof Error ? employmentError.message : 'Unable to start review placeholder.');
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
        eyebrow="Employment"
        title="Employment Verification"
        description="Add your employment details once so landlords can quickly see your verified income and work history."
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

          <FormSectionCard title="Employer Details" description="Tell us who you work for and who may confirm your employment when manual review begins.">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Employer name" value={form.employer_name} onChange={updateTextField('employer_name')} required />
              <Input label="Employer website" value={form.employer_website} onChange={updateTextField('employer_website')} placeholder="https://example.com" />
              <Input label="Employer email domain" value={form.employer_email_domain} onChange={updateTextField('employer_email_domain')} placeholder="example.com" required />
              <Input label="Employer contact name" value={form.employer_contact_name} onChange={updateTextField('employer_contact_name')} required />
              <Input label="Employer contact email" type="email" value={form.employer_contact_email} onChange={updateTextField('employer_contact_email')} required />
              <Input label="Employer contact phone" value={form.employer_contact_phone} onChange={updateTextField('employer_contact_phone')} />
            </div>
          </FormSectionCard>

          <FormSectionCard title="Job & Income" description="Income is used as a factual passport field. Rental Passport does not make approval recommendations.">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Job title" value={form.job_title} onChange={updateTextField('job_title')} required />
              <SelectField label="Employment type" value={form.employment_type} onChange={updateTextField('employment_type')} options={employmentTypeOptions} />
              <SelectField label="Employment status" value={form.employment_status} onChange={updateTextField('employment_status')} options={employmentStatusOptions} />
              <Input label="Start date" type="date" value={form.start_date} onChange={updateTextField('start_date')} required />
              <Input label="Annual income" type="number" min="0" value={form.annual_income} onChange={updateTextField('annual_income')} required />
              <SelectField label="Pay frequency" value={form.pay_frequency} onChange={updateTextField('pay_frequency')} options={payFrequencyOptions} />
              <div className="md:col-span-2">
                <Input label="Work location" value={form.work_location} onChange={updateTextField('work_location')} placeholder="Toronto, ON or Remote" />
              </div>
            </div>
          </FormSectionCard>

          <FormSectionCard title="Supporting Documents" description="Upload documents that support your employment details. Bank deposit proof is optional and may only be requested if more confidence is needed.">
            <div className="space-y-4">
              <UploadBox label="Recent pay stub" description="PDF, JPG, or PNG. Maximum 10MB." onFileSelected={(file) => uploadDocument('pay_stub', file)} />
              <UploadBox label="Employment letter" description="A letter from your employer confirming role or income." onFileSelected={(file) => uploadDocument('employment_letter', file)} />
              <UploadBox label="Offer letter" description="Useful for new jobs or recent employment changes." optional onFileSelected={(file) => uploadDocument('offer_letter', file)} />
              <UploadBox label="Bank deposit proof" description="Optional. Do not upload unless you choose to provide more confidence." optional onFileSelected={(file) => uploadDocument('bank_deposit_proof', file)} />
              <UploadBox label="Other supporting document" description="Optional supporting evidence for manual review." optional onFileSelected={(file) => uploadDocument('other', file)} />
              <DocumentList documents={moduleState?.documents ?? []} />
            </div>
          </FormSectionCard>

          <FormSectionCard title="Consent" description="Consent is required before employment can be submitted for review. You can save a draft without submitting for review.">
            <div className="space-y-3">
              <ConsentCheckbox checked={form.consent_contact_employer} onChange={(event) => updateField('consent_contact_employer', event.target.checked)} label="I consent to Rental Passport contacting my employer for manual verification." />
              <ConsentCheckbox checked={form.consent_review_documents} onChange={(event) => updateField('consent_review_documents', event.target.checked)} label="I consent to Rental Passport reviewing my employment documents." />
              <ConsentCheckbox checked={form.consent_use_in_passport} onChange={(event) => updateField('consent_use_in_passport', event.target.checked)} label="I consent to using this employment information in my Rental Passport." />
              <ConsentCheckbox checked={form.consent_share_summary} onChange={(event) => updateField('consent_share_summary', event.target.checked)} label="I consent to sharing a verified employment summary with intended landlords in future sharing flows." />
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
                <BriefcaseBusiness className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">Employment Summary</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">Current state and completion readiness for this passport section.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <StatusBadge status={employmentSection ? sectionStatusLabel(employmentSection.status) : 'In Progress'} />
              <Badge tone="blue">{employmentSection?.progress ?? 50}% Complete</Badge>
              <p className="text-sm text-slate-600">Passport completeness updates when this section is started, submitted, or needs reverification.</p>
            </div>
          </Card>

          <VerificationReadinessCard signals={moduleState?.signals ?? []} />

          <Card className="p-6">
            <div className="flex gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <div>
                <h2 className="font-black">Secure document handling</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">Employment documents are tenant-owned, stored in a private bucket, and no public download links are generated.</p>
              </div>
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

function recordToForm(record: EmploymentFormData): EmploymentFormData {
  return {
    ...emptyEmploymentForm,
    ...record,
  };
}

const employmentTypeOptions = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'other', label: 'Other' },
];

const employmentStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'probationary', label: 'Probationary' },
  { value: 'leave', label: 'Leave' },
  { value: 'ended', label: 'Ended' },
];

const payFrequencyOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'semimonthly', label: 'Semi-monthly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
  { value: 'other', label: 'Other' },
];
