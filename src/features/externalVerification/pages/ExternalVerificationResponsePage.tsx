import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Skeleton } from '@/components/feedback/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  getExternalVerificationInvitation,
  submitExternalVerificationResponse,
} from '@/services/phaseAService';
import type {
  ExternalVerificationInvitation,
  ExternalVerificationResponsePayload,
  ExternalVerificationType,
} from '@/types/phaseA';

export function ExternalVerificationResponsePage({
  token,
  type,
}: {
  token: string;
  type: ExternalVerificationType;
}) {
  const [invitation, setInvitation] = useState<ExternalVerificationInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({
    respondentName: '',
    respondentTitle: '',
    respondentEmail: '',
    respondentPhone: '',
    declarationAccepted: false,
  });

  useEffect(() => {
    getExternalVerificationInvitation(token)
      .then(setInvitation)
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setLoading(false));
  }, [token]);

  const questions = useMemo(() => questionsFor(type), [type]);

  const update = (key: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async () => {
    setError(null);
    setNotice(null);
    try {
      const payload: ExternalVerificationResponsePayload = {
        respondentName: String(form.respondentName),
        respondentTitle: String(form.respondentTitle || ''),
        respondentEmail: String(form.respondentEmail || invitation?.recipientEmail || ''),
        respondentPhone: String(form.respondentPhone || ''),
        declarationAccepted: form.declarationAccepted === true,
        answers: Object.fromEntries(questions.map((question) => [question.key, form[question.key] ?? ''])),
      };
      await submitExternalVerificationResponse(token, payload);
      setNotice('Thank you. Your response was submitted securely to Rental Passport for manual review.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to submit this response.');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Skeleton className="h-96 w-full" />
      </PageContainer>
    );
  }

  if (error && !invitation) {
    return (
      <PageContainer>
        <Alert tone="error">{error}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Rental Passport Verification"
        title={titleFor(type)}
        description="Complete this secure response form only if the applicant authorized Rental Passport to contact you."
      />
      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="p-6">
          <div className="flex items-start gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <ShieldCheck className="mt-1 h-6 w-6 text-blue-700" />
            <div>
              <h2 className="font-black">Scoped verification request</h2>
              <p className="mt-1 text-sm leading-6 text-blue-950">
                You can respond to this request only. You cannot browse the applicant's Rental
                Passport or documents.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Input label="Responder name" value={String(form.respondentName)} onChange={(event) => update('respondentName', event.target.value)} required />
            <Input label="Responder title" value={String(form.respondentTitle)} onChange={(event) => update('respondentTitle', event.target.value)} />
            <Input label="Responder email" type="email" value={String(form.respondentEmail)} onChange={(event) => update('respondentEmail', event.target.value)} />
            <Input label="Responder phone" value={String(form.respondentPhone)} onChange={(event) => update('respondentPhone', event.target.value)} />
          </div>

          <div className="mt-6 space-y-4">
            {questions.map((question) => (
              <QuestionControl key={question.key} question={question} value={form[question.key]} onChange={update} />
            ))}
          </div>

          <label className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 p-4">
            <input
              className="mt-1 h-4 w-4"
              type="checkbox"
              checked={form.declarationAccepted === true}
              onChange={(event) => update('declarationAccepted', event.target.checked)}
            />
            <span className="text-sm leading-6 text-slate-700">
              I confirm that this response is accurate to the best of my knowledge and may be
              reviewed by Rental Passport staff for the applicant's verification request.
            </span>
          </label>

          <Button
            className="mt-6"
            variant="primary"
            disabled={!form.respondentName || form.declarationAccepted !== true || Boolean(notice)}
            onClick={submit}
          >
            Submit Secure Response
          </Button>
        </Card>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="text-xl font-black">Request details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Detail label="Recipient" value={invitation?.recipientName ?? 'Verification recipient'} />
              <Detail label="Type" value={type.replace('-', ' ')} />
              <Detail label="Expires" value={invitation ? new Date(invitation.expiresAt).toLocaleDateString() : 'Soon'} />
            </dl>
          </Card>
          <Card className="p-5">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-600" />
              <p className="text-sm leading-6 text-slate-700">
                Rental Passport staff will review your response before any verification result is
                shown to a landlord.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}

function QuestionControl({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string | boolean | undefined;
  onChange: (key: string, value: string | boolean) => void;
}) {
  if (question.kind === 'boolean') {
    return (
      <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
        <input
          className="mt-1 h-4 w-4"
          type="checkbox"
          checked={value === true}
          onChange={(event) => onChange(question.key, event.target.checked)}
        />
        <span className="text-sm font-bold text-slate-700">{question.label}</span>
      </label>
    );
  }
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{question.label}</span>
      <textarea
        className="mt-1 min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-navy outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        value={String(value ?? '')}
        onChange={(event) => onChange(question.key, event.target.value)}
      />
    </label>
  );
}

type Question = {
  key: string;
  label: string;
  kind: 'text' | 'boolean';
};

function questionsFor(type: ExternalVerificationType): Question[] {
  if (type === 'employment') {
    return [
      { key: 'company', label: 'Company or employer name', kind: 'text' },
      { key: 'employmentConfirmed', label: 'I can confirm this person is/was employed here.', kind: 'boolean' },
      { key: 'jobTitle', label: 'Job title or role confirmed', kind: 'text' },
      { key: 'employmentStatus', label: 'Employment status', kind: 'text' },
      { key: 'startDate', label: 'Start date or approximate start period', kind: 'text' },
      { key: 'incomeConfirmation', label: 'Income or pay-frequency confirmation, where legally appropriate', kind: 'text' },
      { key: 'currentInformation', label: 'The information is current to my knowledge.', kind: 'boolean' },
      { key: 'comments', label: 'Optional comments', kind: 'text' },
    ];
  }
  if (type === 'rental-history') {
    return [
      { key: 'responderRole', label: 'Your role for this tenancy', kind: 'text' },
      { key: 'tenancyAddress', label: 'Tenancy address', kind: 'text' },
      { key: 'tenancyDates', label: 'Tenancy dates', kind: 'text' },
      { key: 'recordsMatch', label: 'The tenancy records generally match the applicant information.', kind: 'boolean' },
      { key: 'rentAsAgreed', label: 'Rent was generally paid as agreed, where records permit you to answer.', kind: 'boolean' },
      { key: 'leaseIssues', label: 'Documented lease issues, where legally permitted', kind: 'text' },
      { key: 'comments', label: 'Optional comments', kind: 'text' },
    ];
  }
  return [
    { key: 'relationship', label: 'Relationship to the applicant', kind: 'text' },
    { key: 'yearsKnown', label: 'How long you have known the applicant', kind: 'text' },
    { key: 'contactConfirmed', label: 'I confirm my contact information is accurate.', kind: 'boolean' },
    { key: 'relevantContext', label: 'Relevant context for the rental application', kind: 'text' },
    { key: 'comments', label: 'Concise comments', kind: 'text' },
  ];
}

function titleFor(type: ExternalVerificationType) {
  if (type === 'employment') return 'Employment verification response';
  if (type === 'rental-history') return 'Rental history verification response';
  return 'Reference verification response';
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-black uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 capitalize text-slate-800">{value}</dd>
    </div>
  );
}

