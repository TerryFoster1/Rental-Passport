import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileLock2,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Skeleton } from '@/components/feedback/Skeleton';
import { UploadBox } from '@/components/forms/UploadBox';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  autosaveOnboardingStage,
  captureConsent,
  createManualCreditOperation,
  createOutreachInvitation,
  getGuidedOnboardingSummary,
  onboardingStages,
  submitPassportForManualVerification,
  uploadEvidenceDocument,
} from '@/services/phaseAService';
import type { GuidedOnboardingSummary, OnboardingStageKey, OutreachType } from '@/types/phaseA';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function GuidedOnboardingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user, profile, isEmailVerified } = useAuth();
  const [summary, setSummary] = useState<GuidedOnboardingSummary | null>(null);
  const [activeStage, setActiveStage] = useState<OnboardingStageKey>('account_contact');
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [outreachEmail, setOutreachEmail] = useState('');
  const [outreachName, setOutreachName] = useState('');

  useEffect(() => {
    if (!user) return;
    getGuidedOnboardingSummary(user)
      .then((next) => {
        setSummary(next);
        setActiveStage(next.nextStage.key);
      })
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [user]);

  const active = useMemo(
    () => summary?.stages.find((stage) => stage.key === activeStage),
    [activeStage, summary],
  );

  if (!user) return null;

  const saveStage = async (progress: number, draft: Record<string, unknown> = {}) => {
    setSaveState('saving');
    setMessage(null);
    try {
      const next = await autosaveOnboardingStage(user, activeStage, draft, progress);
      setSummary(next);
      setSaveState('saved');
    } catch (error) {
      setSaveState('error');
      setMessage(error instanceof Error ? error.message : 'Unable to save onboarding progress.');
    }
  };

  const recordConsent = async () => {
    if (!active) return;
    setSaveState('saving');
    try {
      await Promise.all(
        active.consentPurposes.map((purpose) =>
          captureConsent(user, {
            purpose,
            consentTextVersion: 'phase-a-2026-07-23',
            consentTextSnapshot: `I authorize Rental Passport to use my information for ${purpose.replace(/_/g, ' ')} in the Phase A manual verification workflow.`,
          }),
        ),
      );
      await saveStage(Math.max(active.progressRecord.progress, 75), {
        ...active.progressRecord.draft,
        consentRecordedAt: new Date().toISOString(),
      });
      setMessage('Consent recorded with the current text version.');
    } catch (error) {
      setSaveState('error');
      setMessage(error instanceof Error ? error.message : 'Unable to record consent.');
    }
  };

  const uploadSampleEvidence = async (file: File) => {
    if (!active?.sectionKey) {
      setMessage('This stage stores supporting information but is not tied to a passport section yet.');
      return;
    }
    setSaveState('saving');
    try {
      const documentType = active.sectionKey === 'identity_confirmation' ? 'government_id_front' : active.sectionKey === 'credit_report' ? 'credit_report' : 'supporting_document';
      await uploadEvidenceDocument(user, active.sectionKey, documentType, file);
      await saveStage(Math.max(active.progressRecord.progress, 60), {
        ...active.progressRecord.draft,
        lastUploadName: file.name,
      });
      setMessage('Evidence registered privately. Source documents remain unavailable to landlords by default.');
    } catch (error) {
      setSaveState('error');
      setMessage(error instanceof Error ? error.message : 'Upload failed. Check the file and try again.');
    }
  };

  const createOutreach = async () => {
    if (!active?.sectionKey || !outreachEmail || !outreachName) return;
    const typeByStage: Partial<Record<OnboardingStageKey, OutreachType>> = {
      employment_income: 'employer',
      rental_history: 'previous_landlord',
      references: 'reference',
    };
    const outreachType = typeByStage[active.key];
    if (!outreachType) {
      setMessage('This stage does not use third-party outreach.');
      return;
    }

    setSaveState('saving');
    try {
      const result = await createOutreachInvitation(user, {
        sectionKey: active.sectionKey,
        outreachType,
        recipientName: outreachName,
        recipientEmail: outreachEmail,
      });
      await saveStage(Math.max(active.progressRecord.progress, 80), {
        ...active.progressRecord.draft,
        outreachRecipient: outreachEmail,
      });
      setMessage(
        result.emailDeliveryStatus === 'sent'
          ? 'Secure outreach invitation sent. Final verification still requires reviewer approval.'
          : `Secure outreach invitation recorded. Email status: ${result.emailDeliveryStatus}. Final verification still requires reviewer approval.`,
      );
      setOutreachEmail('');
      setOutreachName('');
    } catch (error) {
      setSaveState('error');
      setMessage(error instanceof Error ? error.message : 'Unable to create outreach invitation.');
    }
  };

  const authorizeCredit = async () => {
    setSaveState('saving');
    try {
      await captureConsent(user, {
        purpose: 'credit_authorization',
        consentTextVersion: 'phase-a-credit-2026-07-23',
        consentTextSnapshot: 'I authorize Rental Passport staff to process a manual credit report work item through the approved operational workflow.',
      });
      await createManualCreditOperation(user, 'authorized');
      await saveStage(100, { creditAuthorizedAt: new Date().toISOString() });
      setMessage('Credit authorization recorded. The status remains pending until staff process the manual check.');
    } catch (error) {
      setSaveState('error');
      setMessage(error instanceof Error ? error.message : 'Unable to authorize the manual credit workflow.');
    }
  };

  const submitForReview = async () => {
    setSaveState('saving');
    try {
      await submitPassportForManualVerification(user);
      await saveStage(100, { submittedForManualVerificationAt: new Date().toISOString() });
      setMessage('Manual verification cases were created for staff review.');
    } catch (error) {
      setSaveState('error');
      setMessage(error instanceof Error ? error.message : 'Unable to submit for manual verification.');
    }
  };

  if (loading || !summary || !active) {
    return (
      <PageContainer>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Guided Onboarding"
        title="Build your Rental Passport step by step"
        description="Complete the application once, then submit sections for manual verification. Completeness and verification are tracked separately."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => onNavigate('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="primary" onClick={() => onNavigate(active.route)}>
              Open Section
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black uppercase tracking-wide text-blue-700">Overall</p>
              <StatusBadge status={`${summary.overallProgress}% complete`} />
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: `${summary.overallProgress}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {summary.requiredComplete} of {summary.requiredTotal} required stages complete.
            </p>
            <div className="mt-4 rounded-xl bg-blue-50 p-3 text-sm font-bold text-blue-900">
              Verification still requires reviewer approval.
            </div>
          </Card>
          <nav className="space-y-2">
            {summary.stages.map((stage, index) => (
              <button
                key={stage.key}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  stage.key === activeStage ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'
                }`}
                onClick={() => setActiveStage(stage.key)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase text-slate-500">Step {index + 1}</span>
                  {stage.required ? <Badge tone="blue">Required</Badge> : <Badge tone="slate">Optional</Badge>}
                </div>
                <strong className="mt-2 block text-sm">{stage.title}</strong>
                <div className="mt-2 flex items-center gap-2">
                  {stage.progressRecord.status === 'complete' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  )}
                  <span className="text-xs font-bold text-slate-600">{stage.progressRecord.status}</span>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        <section className="space-y-5">
          {message && <Alert tone={saveState === 'error' ? 'error' : 'success'}>{message}</Alert>}
          <Card className="p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={active.required ? 'blue' : 'slate'}>{active.required ? 'Required' : 'Optional'}</Badge>
                  <StatusBadge status={`Completeness: ${active.progressRecord.status}`} />
                  <StatusBadge status="Verification: not verified" />
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-navy">{active.title}</h2>
                <p className="mt-3 max-w-2xl leading-7 text-slate-700">{active.description}</p>
              </div>
              <SavePill saveState={saveState} />
            </div>

            <div className="mt-6 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: `${active.progressRecord.progress}%` }} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-5 w-5 text-blue-700" />
                  <h3 className="font-black">Required items</h3>
                </div>
                <ul className="mt-4 space-y-2">
                  {active.requiredItems.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                  <h3 className="font-black">Verification boundary</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700">
                  Completing this step only marks the section complete. A reviewer must approve evidence
                  before Rental Passport shows it as verified.
                </p>
              </Card>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-black">Stage actions</h3>
            <div className="mt-5 grid gap-4">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => saveStage(35, { contactEmailConfirmed: isEmailVerified, profileEmail: profile?.email ?? user.email })}>
                  Autosave Draft
                </Button>
                <Button variant="primary" onClick={() => saveStage(100, { completedFromGuidedOnboarding: true })}>
                  Mark Stage Complete
                </Button>
                <Button onClick={recordConsent}>
                  <FileLock2 className="mr-2 h-4 w-4" />
                  Record Required Consent
                </Button>
              </div>

              {active.sectionKey && (
                <UploadBox
                  label="Private evidence upload"
                  description="Accepted formats: PDF, JPG, PNG. Files are private by default and source downloads stay disabled for landlords."
                  onFileSelected={uploadSampleEvidence}
                />
              )}

              {['employment_income', 'rental_history', 'references'].includes(active.key) && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-700" />
                    <h4 className="font-black">Secure third-party outreach</h4>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    This prepares an expiring response link and records outreach history. It does not
                    auto-verify the section.
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <Input label="Recipient name" value={outreachName} onChange={(event) => setOutreachName(event.target.value)} />
                    <Input label="Recipient email" type="email" value={outreachEmail} onChange={(event) => setOutreachEmail(event.target.value)} />
                    <Button className="self-end" variant="primary" onClick={createOutreach} disabled={!outreachEmail || !outreachName}>
                      Prepare Invite
                    </Button>
                  </div>
                </div>
              )}

              {active.key === 'credit' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <h4 className="font-black text-amber-950">Manual credit workflow</h4>
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    Tenant authorization creates a staff work item. Credit remains pending until
                    authorized staff process and reviewers approve the permitted summary.
                  </p>
                  <Button className="mt-4" variant="primary" onClick={authorizeCredit}>
                    Authorize Manual Credit Check
                  </Button>
                </div>
              )}

              {active.key === 'review_verification_choice' && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <h4 className="font-black text-emerald-950">Submit for manual verification</h4>
                  <p className="mt-2 text-sm leading-6 text-emerald-900">
                    This creates internal review cases for each passport section. It does not mark
                    any section verified until reviewers approve the evidence.
                  </p>
                  <Button className="mt-4" variant="primary" onClick={submitForReview}>
                    Submit for Staff Review
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <div className="flex flex-wrap justify-between gap-3">
            <Button
              disabled={activeStage === onboardingStages[0].key}
              onClick={() => setActiveStage(previousStage(activeStage))}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button variant="primary" onClick={() => setActiveStage(nextStage(activeStage))}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

function SavePill({ saveState }: { saveState: SaveState }) {
  const label = {
    idle: 'Ready to save',
    saving: 'Saving...',
    saved: 'Saved',
    error: 'Needs attention',
  }[saveState];
  const icon = saveState === 'saving' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />;
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-700">
      {icon}
      {label}
    </span>
  );
}

function previousStage(activeStage: OnboardingStageKey) {
  const index = onboardingStages.findIndex((stage) => stage.key === activeStage);
  return onboardingStages[Math.max(0, index - 1)].key;
}

function nextStage(activeStage: OnboardingStageKey) {
  const index = onboardingStages.findIndex((stage) => stage.key === activeStage);
  return onboardingStages[Math.min(onboardingStages.length - 1, index + 1)].key;
}
