import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { ArrowLeft, Landmark, ShieldCheck } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ConsentCheckbox } from '@/components/forms/ConsentCheckbox';
import { FormSectionCard } from '@/components/forms/FormSectionCard';
import { SaveStatusIndicator } from '@/components/forms/SaveStatusIndicator';
import { VerificationReadinessCard } from '@/components/forms/VerificationReadinessCard';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/features/auth/AuthProvider';
import { sectionStatusLabel } from '@/features/passport/components/passportLabels';
import { usePassportSummary } from '@/features/passport/usePassportSummary';
import { ConsentNotice } from '@/features/creditReport/components/ConsentNotice';
import { CreditProviderCard } from '@/features/creditReport/components/CreditProviderCard';
import { CreditSummaryCard } from '@/features/creditReport/components/CreditSummaryCard';
import { CreditUploadCard } from '@/features/creditReport/components/CreditUploadCard';
import {
  emptyCreditReportForm,
  getCreditReportModuleState,
  markCreditUnderReview,
  requestCreditVerification,
  saveCreditReportDraft,
  uploadCreditReportDocument,
} from '@/services/creditReportService';
import type { CreditProviderKey, CreditReportFormData, CreditReportModuleState, CreditReportWorkflow } from '@/types/creditReport';

export function CreditReportPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const passportState = usePassportSummary();
  const [moduleState, setModuleState] = useState<CreditReportModuleState | null>(null);
  const [form, setForm] = useState<CreditReportFormData>(emptyCreditReportForm);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadCreditReport = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const nextState = await getCreditReportModuleState(user);
      setModuleState(nextState);
      if (nextState.report) setForm(reportToForm(nextState.report));
    } catch (creditError) {
      setError(creditError instanceof Error ? creditError.message : 'Unable to load credit report section.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadCreditReport();
    });
  }, [loadCreditReport]);

  const creditSection = passportState.summary?.sections.find((section) => section.key === 'credit_report');
  const requiredSignalsReady = useMemo(
    () => form.consent_credit_authorization && form.consent_storage && form.consent_review && form.consent_landlord_sharing && form.consent_expiration,
    [form.consent_credit_authorization, form.consent_expiration, form.consent_landlord_sharing, form.consent_review, form.consent_storage],
  );

  const updateField = <Key extends keyof CreditReportFormData>(key: Key, value: CreditReportFormData[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaveState('idle');
    setNotice('');
  };

  const updateTextField = (key: keyof CreditReportFormData) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => updateField(key, event.target.value as never);

  const chooseWorkflow = (workflow: CreditReportWorkflow) => {
    updateField('workflow', workflow);
    updateField('provider_key', workflow === 'provider_request' ? 'manual_review' : 'manual_review');
  };

  const saveDraft = async () => {
    if (!user) return;
    setSaveState('saving');
    setError('');
    setNotice('');
    try {
      const nextState = await saveCreditReportDraft(user, form);
      setModuleState(nextState);
      setSaveState('saved');
      setNotice('Credit report draft saved. Passport completeness has been updated.');
      await passportState.refresh();
    } catch (creditError) {
      setSaveState('idle');
      setError(creditError instanceof Error ? creditError.message : 'Unable to save credit report draft.');
    }
  };

  const uploadDocument = async (file: File) => {
    if (!user) return;
    setError('');
    setNotice('');
    try {
      const nextState = await uploadCreditReportDocument(user, file);
      setModuleState(nextState);
      setNotice(`${file.name} was uploaded securely. No public download link was created.`);
      await passportState.refresh();
    } catch (creditError) {
      setError(creditError instanceof Error ? creditError.message : 'Unable to upload credit report.');
    }
  };

  const requestReview = async () => {
    if (!user) return;
    setError('');
    setNotice('');
    try {
      const nextState = await requestCreditVerification(user, form);
      setModuleState(nextState);
      setNotice(form.workflow === 'provider_request' ? 'Manual provider request created for credit verification.' : 'Uploaded credit report is ready for manual review.');
      await passportState.refresh();
    } catch (creditError) {
      setError(creditError instanceof Error ? creditError.message : 'Complete required credit consent before requesting verification.');
    }
  };

  const markUnderReview = async () => {
    if (!user) return;
    setError('');
    try {
      const nextState = await markCreditUnderReview(user);
      setModuleState(nextState);
      setNotice('Under Review placeholder state is active. Bureau integrations are not implemented yet.');
      await passportState.refresh();
    } catch (creditError) {
      setError(creditError instanceof Error ? creditError.message : 'Unable to start review placeholder.');
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
        eyebrow="Credit Report"
        title="Credit Report Verification"
        description="Rental Passport verifies the authenticity and ownership of a credit report. It does not judge applicants or recommend acceptance."
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

          <Alert tone="info" title="Trusted summary, not a bureau report">
            A poor credit score can still produce a fully verified passport. Verification confirms report source, date, authenticity, and ownership.
          </Alert>

          <FormSectionCard title="Credit Options" description="Choose how you want to prepare your credit report for manual verification.">
            <div className="grid gap-4 md:grid-cols-2">
              <CreditProviderCard workflow="provider_request" selected={form.workflow === 'provider_request'} onSelect={() => chooseWorkflow('provider_request')} />
              <CreditProviderCard workflow="tenant_upload" selected={form.workflow === 'tenant_upload'} onSelect={() => chooseWorkflow('tenant_upload')} />
            </div>
          </FormSectionCard>

          {form.workflow === 'tenant_upload' && (
            <FormSectionCard title="Uploaded Report" description="Upload a recent PDF report. Replacement later can trigger reverification for the Credit Report section only.">
              <CreditUploadCard documents={moduleState?.documents ?? []} onFileSelected={uploadDocument} />
            </FormSectionCard>
          )}

          <FormSectionCard title="Future Landlord Summary Fields" description="These fields prepare the trusted future summary without exposing unnecessary raw bureau information.">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="Provider" value={form.provider_key} onChange={updateTextField('provider_key')} options={providerOptions} />
              <Input label="Report date" type="date" value={form.report_date} onChange={updateTextField('report_date')} />
              <Input label="Credit score" type="number" min="0" value={form.credit_score} onChange={updateTextField('credit_score')} />
              <Input label="Credit score range" value={form.credit_score_range} onChange={updateTextField('credit_score_range')} />
              <Input label="Payment history" value={form.payment_history} onChange={updateTextField('payment_history')} />
              <Input label="Collections" value={form.collections} onChange={updateTextField('collections')} />
              <Input label="Public records" value={form.public_records} onChange={updateTextField('public_records')} />
              <Input label="Credit utilization" value={form.credit_utilization} onChange={updateTextField('credit_utilization')} />
              <Input label="Bankruptcy" value={form.bankruptcy} onChange={updateTextField('bankruptcy')} />
              <Input label="Consumer proposal" value={form.consumer_proposal} onChange={updateTextField('consumer_proposal')} />
              <Input label="Hard inquiries" type="number" min="0" value={form.hard_inquiries} onChange={updateTextField('hard_inquiries')} />
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">Notes</span>
                <textarea className="mt-1 min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-navy outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={form.notes} onChange={updateTextField('notes')} />
              </label>
            </div>
          </FormSectionCard>

          <FormSectionCard title="Consent" description="Consent is required before Rental Passport can obtain, store, review, or prepare a credit report summary.">
            <div className="space-y-3">
              <ConsentCheckbox checked={form.consent_credit_authorization} onChange={(event) => updateField('consent_credit_authorization', event.target.checked)} label="I authorize Rental Passport to obtain or review my credit report for verification." />
              <ConsentCheckbox checked={form.consent_storage} onChange={(event) => updateField('consent_storage', event.target.checked)} label="I consent to secure storage of my credit report and verification result." />
              <ConsentCheckbox checked={form.consent_review} onChange={(event) => updateField('consent_review', event.target.checked)} label="I consent to manual review of the credit report and supporting summary fields." />
              <ConsentCheckbox checked={form.consent_landlord_sharing} onChange={(event) => updateField('consent_landlord_sharing', event.target.checked)} label="I consent to sharing a verified credit summary with intended landlords in future sharing flows." />
              <ConsentCheckbox checked={form.consent_expiration} onChange={(event) => updateField('consent_expiration', event.target.checked)} label="I understand credit verification may expire and require reverification." />
            </div>
          </FormSectionCard>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <SaveStatusIndicator state={saveState} />
            <div className="flex flex-wrap gap-3">
              <Button onClick={saveDraft}>Save Draft</Button>
              <Button variant="primary" onClick={requestReview} disabled={!requiredSignalsReady}>
                Request Verification
              </Button>
              {moduleState?.status === 'ready_for_review' && <Button onClick={markUnderReview}>Start Under Review Placeholder</Button>}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <CreditSummaryCard report={moduleState?.report ?? null} sectionStatus={creditSection ? sectionStatusLabel(creditSection.status) : 'In Progress'} progress={creditSection?.progress ?? 50} />
          <VerificationReadinessCard signals={moduleState?.signals ?? []} />
          <ConsentNotice />
          <Card className="p-6">
            <div className="flex gap-3">
              <Landmark className="h-6 w-6 text-blue-700" />
              <p className="text-sm leading-6 text-slate-700">No SingleKey, FrontLobby, Equifax, TransUnion, OCR, AI fraud review, automated refresh, or landlord credit page is implemented in this phase.</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <p className="text-sm leading-6 text-slate-700">Sensitive credit documents remain tenant-owned, private, and are never exposed through direct public URLs.</p>
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

function reportToForm(report: CreditReportFormData): CreditReportFormData {
  return {
    ...emptyCreditReportForm,
    ...report,
  };
}

const providerOptions: Array<{ value: CreditProviderKey; label: string }> = [
  { value: 'manual_review', label: 'Manual Review' },
  { value: 'singlekey', label: 'SingleKey' },
  { value: 'frontlobby', label: 'FrontLobby' },
  { value: 'equifax', label: 'Equifax' },
  { value: 'transunion', label: 'TransUnion' },
];
