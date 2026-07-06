import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { ArrowLeft, Home, Plus, ShieldCheck } from 'lucide-react';
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
import { AddressFields } from '@/features/rentalHistory/components/AddressFields';
import { ContactMethodFields } from '@/features/rentalHistory/components/ContactMethodFields';
import { DateRangeFields } from '@/features/rentalHistory/components/DateRangeFields';
import { RentalRecordCard } from '@/features/rentalHistory/components/RentalRecordCard';
import {
  createEmptyRentalRecord,
  getRentalHistoryModuleState,
  markRentalHistoryReadyForReview,
  markRentalHistoryUnderReview,
  saveRentalHistoryDraft,
  uploadRentalHistoryDocument,
} from '@/services/rentalHistoryService';
import type { RentalHistoryDocumentKind, RentalHistoryModuleState, RentalHistoryRecordForm } from '@/types/rentalHistory';

export function RentalHistoryPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const passportState = usePassportSummary();
  const [moduleState, setModuleState] = useState<RentalHistoryModuleState | null>(null);
  const [records, setRecords] = useState<RentalHistoryRecordForm[]>([createEmptyRentalRecord()]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadRentalHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const nextState = await getRentalHistoryModuleState(user);
      const nextRecords = nextState.records.length > 0 ? nextState.records.map(recordToForm) : [createEmptyRentalRecord()];
      setModuleState(nextState);
      setRecords(nextRecords);
      setSelectedId(nextRecords[0]?.local_id ?? '');
    } catch (rentalError) {
      setError(rentalError instanceof Error ? rentalError.message : 'Unable to load rental history.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadRentalHistory();
    });
  }, [loadRentalHistory]);

  const selectedRecord = records.find((record) => record.local_id === selectedId) ?? records[0];
  const selectedPersistedId = selectedRecord?.id;
  const rentalSection = passportState.summary?.sections.find((section) => section.key === 'rental_history');
  const selectedDocuments = moduleState?.documents.filter((document) => document.rentalRecordId === selectedPersistedId) ?? [];

  const requiredSignalsReady = useMemo(() => {
    const requiredKeys = ['address_provided', 'manager_contact', 'tenant_consent', 'verification_request_ready', 'manual_review'];
    return requiredKeys.every((key) => moduleState?.signals.find((signal) => signal.key === key)?.complete);
  }, [moduleState?.signals]);

  const updateRecord = (key: keyof RentalHistoryRecordForm, value: string | boolean) => {
    if (!selectedRecord) return;
    setRecords((current) =>
      current.map((record) =>
        record.local_id === selectedRecord.local_id
          ? {
              ...record,
              [key]: value,
              move_out_date: key === 'is_current_residence' && value === true ? '' : record.move_out_date,
            }
          : record,
      ),
    );
    setSaveState('idle');
    setNotice('');
  };

  const updateTextField = (key: keyof RentalHistoryRecordForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateRecord(key, event.target.value);

  const addRecord = () => {
    const next = createEmptyRentalRecord();
    setRecords((current) => [...current, next]);
    setSelectedId(next.local_id);
    setSaveState('idle');
  };

  const removeRecord = (localId: string) => {
    setRecords((current) => {
      const next = current.filter((record) => record.local_id !== localId);
      if (selectedId === localId) setSelectedId(next[0]?.local_id ?? '');
      return next.length > 0 ? next : [createEmptyRentalRecord()];
    });
    setSaveState('idle');
  };

  const saveDraft = async () => {
    if (!user) return;
    setSaveState('saving');
    setError('');
    setNotice('');
    try {
      const nextState = await saveRentalHistoryDraft(user, records);
      const nextRecords = nextState.records.map(recordToForm);
      setModuleState(nextState);
      setRecords(nextRecords);
      setSelectedId(nextRecords[0]?.local_id ?? '');
      setSaveState('saved');
      setNotice('Rental history draft saved. Passport completeness has been updated.');
      await passportState.refresh();
    } catch (rentalError) {
      setSaveState('idle');
      setError(rentalError instanceof Error ? rentalError.message : 'Unable to save rental history draft.');
    }
  };

  const uploadDocument = async (kind: RentalHistoryDocumentKind, file: File) => {
    if (!user || !selectedPersistedId) {
      setError('Save this rental record before uploading documents.');
      return;
    }

    setError('');
    setNotice('');
    try {
      const nextState = await uploadRentalHistoryDocument(user, selectedPersistedId, kind, file);
      setModuleState(nextState);
      setNotice(`${file.name} was uploaded securely. No public download link was created.`);
      await passportState.refresh();
    } catch (rentalError) {
      setError(rentalError instanceof Error ? rentalError.message : 'Unable to upload document.');
    }
  };

  const markReady = async () => {
    if (!user) return;
    setError('');
    setNotice('');
    try {
      const nextState = await markRentalHistoryReadyForReview(user, records);
      setModuleState(nextState);
      setNotice('Rental history section is ready for manual review.');
      await passportState.refresh();
    } catch (rentalError) {
      setError(rentalError instanceof Error ? rentalError.message : 'Complete required rental history details and consent before requesting review.');
    }
  };

  const markUnderReview = async () => {
    if (!user) return;
    setError('');
    try {
      const nextState = await markRentalHistoryUnderReview(user);
      setModuleState(nextState);
      setNotice('Under Review placeholder state is active. Automated landlord verification is not implemented yet.');
      await passportState.refresh();
    } catch (rentalError) {
      setError(rentalError instanceof Error ? rentalError.message : 'Unable to start review placeholder.');
    }
  };

  if (loading || !selectedRecord) {
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
        eyebrow="Rental History"
        title="Rental History Verification"
        description="Add where you lived, when you lived there, and who can verify the tenancy. Rental Passport builds confidence from evidence, not tenant scores."
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

          <FormSectionCard title="Rental Records" description="Add one or more current or previous residences. Each record can have its own landlord or property manager contact.">
            <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
              <div className="space-y-3">
                {records.map((record, index) => (
                  <RentalRecordCard key={record.local_id} record={record} index={index} selected={record.local_id === selectedRecord.local_id} onSelect={() => setSelectedId(record.local_id)} onRemove={() => removeRecord(record.local_id)} />
                ))}
                <Button className="w-full" onClick={addRecord}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Rental Record
                </Button>
              </div>
              <div className="space-y-5">
                <AddressFields record={selectedRecord} onChange={updateRecord} />
                <DateRangeFields record={selectedRecord} onChange={updateRecord} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Monthly rent" type="number" min="0" value={selectedRecord.monthly_rent} onChange={updateTextField('monthly_rent')} required />
                  <Input label="Reason for leaving/current status" value={selectedRecord.reason_for_leaving} onChange={updateTextField('reason_for_leaving')} />
                </div>
              </div>
            </div>
          </FormSectionCard>

          <FormSectionCard title="Landlord / Property Manager Contact" description="Provide a contact who can confirm the tenancy. Automated contact workflows come later.">
            <ContactMethodFields record={selectedRecord} onChange={updateRecord} />
          </FormSectionCard>

          <FormSectionCard title="Supporting Documents" description="Upload documents that support this tenancy. Rent payment proof is optional and bank statements are not required by default.">
            <div className="space-y-4">
              <UploadBox label="Lease agreement" description="PDF, JPG, or PNG. Maximum 10MB." onFileSelected={(file) => uploadDocument('lease_agreement', file)} />
              <UploadBox label="Rent receipt" description="Receipt showing rent payment for this tenancy." onFileSelected={(file) => uploadDocument('rent_receipt', file)} />
              <UploadBox label="Tenant ledger" description="Ledger or statement from landlord/property manager." onFileSelected={(file) => uploadDocument('tenant_ledger', file)} />
              <UploadBox label="Move-in/move-out document" description="Optional document confirming move dates." optional onFileSelected={(file) => uploadDocument('move_in_out_document', file)} />
              <UploadBox label="Landlord letter" description="Optional letter confirming tenancy." optional onFileSelected={(file) => uploadDocument('landlord_letter', file)} />
              <UploadBox label="Rent payment proof" description="Optional. Do not upload bank proof unless you choose to provide more confidence." optional onFileSelected={(file) => uploadDocument('rent_payment_proof', file)} />
              <UploadBox label="Other supporting document" description="Optional supporting evidence for manual review." optional onFileSelected={(file) => uploadDocument('other', file)} />
              <DocumentList documents={selectedDocuments} />
            </div>
          </FormSectionCard>

          <FormSectionCard title="Consent" description="Consent is required before rental history can be submitted for review. You can save a draft without submitting for review.">
            <div className="space-y-3">
              <ConsentCheckbox checked={selectedRecord.consent_contact_manager} onChange={(event) => updateRecord('consent_contact_manager', event.target.checked)} label="I consent to Rental Passport contacting this landlord or property manager for manual verification." />
              <ConsentCheckbox checked={selectedRecord.consent_review_documents} onChange={(event) => updateRecord('consent_review_documents', event.target.checked)} label="I consent to Rental Passport reviewing my rental history documents." />
              <ConsentCheckbox checked={selectedRecord.consent_use_in_passport} onChange={(event) => updateRecord('consent_use_in_passport', event.target.checked)} label="I consent to using this rental history information in my Rental Passport." />
              <ConsentCheckbox checked={selectedRecord.consent_share_summary} onChange={(event) => updateRecord('consent_share_summary', event.target.checked)} label="I consent to sharing a verified rental history summary with intended landlords in future sharing flows." />
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
                <Home className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">Rental History Summary</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">Current state and completion readiness for this passport section.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <StatusBadge status={rentalSection ? sectionStatusLabel(rentalSection.status) : 'In Progress'} />
              <Badge tone="blue">{rentalSection?.progress ?? 50}% Complete</Badge>
              <p className="text-sm text-slate-600">Passport completeness updates when rental history is started, submitted, or needs reverification.</p>
            </div>
          </Card>

          <VerificationReadinessCard signals={moduleState?.signals ?? []} />

          <Card className="p-6">
            <div className="flex gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <div>
                <h2 className="font-black">Secure document handling</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">Rental history documents are tenant-owned, stored in a private bucket, and no public download links are generated.</p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}

function recordToForm(record: RentalHistoryRecordForm): RentalHistoryRecordForm {
  return {
    ...createEmptyRentalRecord(),
    ...record,
    local_id: record.id ?? record.local_id,
  };
}
