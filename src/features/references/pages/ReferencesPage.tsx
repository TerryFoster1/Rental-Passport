import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, ShieldCheck, UsersRound } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ConsentCheckbox } from '@/components/forms/ConsentCheckbox';
import { FormSectionCard } from '@/components/forms/FormSectionCard';
import { SaveStatusIndicator } from '@/components/forms/SaveStatusIndicator';
import { VerificationReadinessCard } from '@/components/forms/VerificationReadinessCard';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/AuthProvider';
import { sectionStatusLabel } from '@/features/passport/components/passportLabels';
import { usePassportSummary } from '@/features/passport/usePassportSummary';
import { ReferenceCard } from '@/features/references/components/ReferenceCard';
import { ReferenceForm } from '@/features/references/components/ReferenceForm';
import { ReferenceStatusBadge } from '@/features/references/components/ReferenceStatusBadge';
import {
  createEmptyReference,
  getReferencesModuleState,
  markReferencesReadyForReview,
  markReferencesUnderReview,
  saveReferencesDraft,
} from '@/services/referencesService';
import type { ReferenceFormData, ReferencesModuleState } from '@/types/references';

export function ReferencesPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const passportState = usePassportSummary();
  const [moduleState, setModuleState] = useState<ReferencesModuleState | null>(null);
  const [references, setReferences] = useState<ReferenceFormData[]>([createEmptyReference()]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadReferences = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const nextState = await getReferencesModuleState(user);
      const nextReferences = nextState.references.length > 0 ? nextState.references.map(recordToForm) : [createEmptyReference()];
      setModuleState(nextState);
      setReferences(nextReferences);
      setSelectedId(nextReferences[0]?.local_id ?? '');
    } catch (referenceError) {
      setError(referenceError instanceof Error ? referenceError.message : 'Unable to load references.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadReferences();
    });
  }, [loadReferences]);

  const selectedReference = references.find((reference) => reference.local_id === selectedId) ?? references[0];
  const referencesSection = passportState.summary?.sections.find((section) => section.key === 'references');
  const recommendedCount = 3;
  const requiredSignalsReady = useMemo(() => {
    const requiredKeys = ['reference_added', 'consent_given', 'ready_for_review', 'manual_review'];
    return requiredKeys.every((key) => moduleState?.signals.find((signal) => signal.key === key)?.complete);
  }, [moduleState?.signals]);

  const updateReference = (key: keyof ReferenceFormData, value: string | boolean) => {
    if (!selectedReference) return;
    setReferences((current) => current.map((reference) => (reference.local_id === selectedReference.local_id ? { ...reference, [key]: value } : reference)));
    setSaveState('idle');
    setNotice('');
  };

  const addReference = () => {
    const next = createEmptyReference();
    setReferences((current) => [...current, next]);
    setSelectedId(next.local_id);
    setSaveState('idle');
  };

  const removeReference = (localId: string) => {
    setReferences((current) => {
      const next = current.filter((reference) => reference.local_id !== localId);
      if (selectedId === localId) setSelectedId(next[0]?.local_id ?? '');
      return next.length > 0 ? next : [createEmptyReference()];
    });
    setSaveState('idle');
  };

  const saveDraft = async () => {
    if (!user) return;
    setSaveState('saving');
    setError('');
    setNotice('');
    try {
      const nextState = await saveReferencesDraft(user, references);
      const nextReferences = nextState.references.map(recordToForm);
      setModuleState(nextState);
      setReferences(nextReferences);
      setSelectedId(nextReferences[0]?.local_id ?? '');
      setSaveState('saved');
      setNotice('References draft saved. Passport completeness has been updated.');
      await passportState.refresh();
    } catch (referenceError) {
      setSaveState('idle');
      setError(referenceError instanceof Error ? referenceError.message : 'Unable to save references draft.');
    }
  };

  const markReady = async () => {
    if (!user) return;
    setError('');
    setNotice('');
    try {
      const nextState = await markReferencesReadyForReview(user, references);
      setModuleState(nextState);
      setNotice('References section is ready for manual review.');
      await passportState.refresh();
    } catch (referenceError) {
      setError(referenceError instanceof Error ? referenceError.message : 'Complete required reference details and consent before requesting review.');
    }
  };

  const markUnderReview = async () => {
    if (!user) return;
    setError('');
    try {
      const nextState = await markReferencesUnderReview(user);
      setModuleState(nextState);
      setNotice('Under Review placeholder state is active. Automated reference emails are not implemented yet.');
      await passportState.refresh();
    } catch (referenceError) {
      setError(referenceError instanceof Error ? referenceError.message : 'Unable to start review placeholder.');
    }
  };

  if (loading || !selectedReference) {
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
        eyebrow="References"
        title="Reference Verification"
        description="Choose people who know you well and can confidently speak about your reliability. The goal is to verify information, not judge people."
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

          <Alert tone="info" title="Your references stay under your control">
            Your references will never be contacted without your consent. Future verification will confirm contact details, relationship, response, and review status.
          </Alert>

          <FormSectionCard title="Reference List" description="Add multiple personal or professional references. Three references is a useful target, but not a score.">
            <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
              <div className="space-y-3">
                {references.map((reference, index) => (
                  <ReferenceCard key={reference.local_id} reference={reference} index={index} selected={reference.local_id === selectedReference.local_id} onSelect={() => setSelectedId(reference.local_id)} onRemove={() => removeReference(reference.local_id)} />
                ))}
                <Button className="w-full" onClick={addReference}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Reference
                </Button>
              </div>
              <ReferenceForm reference={selectedReference} onChange={updateReference} />
            </div>
          </FormSectionCard>

          <FormSectionCard title="Consent" description="Consent is required before references can be submitted for review. You can save a draft without submitting for review.">
            <div className="space-y-3">
              <ConsentCheckbox checked={selectedReference.consent_contact_reference} onChange={(event) => updateReference('consent_contact_reference', event.target.checked)} label="I consent to Rental Passport contacting this reference in a future verification workflow." />
              <ConsentCheckbox checked={selectedReference.consent_verify_information} onChange={(event) => updateReference('consent_verify_information', event.target.checked)} label="I consent to Rental Passport verifying the reference information I supplied." />
              <ConsentCheckbox checked={selectedReference.consent_store_results} onChange={(event) => updateReference('consent_store_results', event.target.checked)} label="I consent to Rental Passport storing reference verification results." />
              <ConsentCheckbox checked={selectedReference.consent_share_summary} onChange={(event) => updateReference('consent_share_summary', event.target.checked)} label="I consent to sharing a verified reference summary with intended landlords in future sharing flows." />
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
                <UsersRound className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">References Summary</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">Current state and readiness for this passport section.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <StatusBadge status={referencesSection ? sectionStatusLabel(referencesSection.status) : 'In Progress'} />
              <ReferenceStatusBadge status={moduleState?.status ?? 'draft'} />
              <Badge tone="blue">{references.length} Added</Badge>
              <p className="text-sm text-slate-600">Recommended: {recommendedCount} references. This is guidance, not a score.</p>
            </div>
          </Card>

          <VerificationReadinessCard signals={moduleState?.signals ?? []} />

          <Card className="p-6">
            <div className="flex gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <div>
                <h2 className="font-black">Verification philosophy</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">Future reference verification will prepare useful trust signals such as response, relationship confirmation, and reviewed comments. No reference scoring is implemented.</p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}

function recordToForm(reference: ReferenceFormData): ReferenceFormData {
  return {
    ...createEmptyReference(),
    ...reference,
    local_id: reference.id ?? reference.local_id,
  };
}
