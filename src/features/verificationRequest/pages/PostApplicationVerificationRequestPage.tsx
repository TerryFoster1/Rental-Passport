import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Link2,
  LockKeyhole,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { RentalPassportLogo } from '@/components/brand/RentalPassportLogo';
import { Alert } from '@/components/feedback/Alert';
import { ConsentCheckbox } from '@/components/forms/ConsentCheckbox';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  acceptVerificationRequest,
  advanceDemoVerification,
  completeDemoPayment,
  confirmApplicationImport,
  declineVerificationRequest,
  failDemoPayment,
  getPartnerSafeStatusSummary,
  linkVerificationRequestAccount,
  recordVerificationConsent,
  validateVerificationInvitation,
} from '@/services/postApplicationVerificationService';
import { isProduction } from '@/lib/env';
import type { PostApplicationVerificationRequest } from '@/types/postApplicationVerification';

type StepKey = 'review' | 'account' | 'import' | 'consent' | 'payment' | 'verification' | 'complete';

export function PostApplicationVerificationRequestPage({ token }: { token: string | null }) {
  const validation = useMemo(() => validateVerificationInvitation(token), [token]);
  const [request, setRequest] = useState<PostApplicationVerificationRequest | null>(
    validation.status === 'valid' ? validation.request : null,
  );
  const [step, setStep] = useState<StepKey>('review');
  const [acceptedConsents, setAcceptedConsents] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);

  if (validation.status !== 'valid' || !request) {
    const message = validation.status === 'valid' ? 'This verification request could not be loaded.' : validation.message;
    return (
      <main className="min-h-screen bg-[#f8fbff] px-5 py-8 text-navy">
        <div className="mx-auto max-w-3xl">
          <RentalPassportLogo className="h-12 w-auto max-w-[220px]" />
          <Card className="mt-8 p-7">
            <LockKeyhole className="h-10 w-10 text-red-700" />
            <h1 className="mt-5 text-3xl font-black">Verification request unavailable</h1>
            <p className="mt-3 leading-7 text-slate-700">{message}</p>
          </Card>
        </div>
      </main>
    );
  }

  const accept = () => {
    setRequest(acceptVerificationRequest(request));
    setStep('account');
  };

  const decline = () => {
    setRequest(declineVerificationRequest(request));
    setNotice('Request declined. Rental Passport will send a safe declined status update to Rental District.');
  };

  const linkAccount = (mode: 'existing_account' | 'new_account') => {
    setRequest(linkVerificationRequestAccount(request, mode));
    setStep('import');
  };

  const confirmImport = () => {
    setRequest(confirmApplicationImport(request));
    setStep('consent');
  };

  const recordConsents = () => {
    const next = recordVerificationConsent(request, acceptedConsents);
    setRequest(next);
    setStep(next.paymentState === 'awaiting_payment' ? 'payment' : 'verification');
  };

  const completePayment = () => {
    setRequest(completeDemoPayment(request));
    setStep('verification');
  };

  const failPayment = () => {
    setRequest(failDemoPayment(request));
    setNotice('Demo payment failed. No live payment processor was contacted.');
  };

  const advance = () => {
    const next = advanceDemoVerification(request);
    setRequest(next);
    if (next.completedApplicationId) setStep('complete');
  };

  const allRequiredConsentsAccepted = request.consents.every(
    (consent) => !consent.required || acceptedConsents.has(consent.key) || consent.acceptedAt,
  );
  const safeSummary = getPartnerSafeStatusSummary(request);

  return (
    <main className="min-h-screen bg-[#f8fbff] text-navy">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
          <RentalPassportLogo className="h-12 w-auto max-w-[220px]" />
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={statusLabel(request.status)} />
            <Badge tone="blue">{request.partnerId.replace('_', ' ')}</Badge>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div className="space-y-5">
          {notice && <Alert tone={notice.includes('failed') ? 'error' : 'success'}>{notice}</Alert>}
          {step === 'review' && (
            <ReviewRequestCard request={request} onAccept={accept} onDecline={decline} />
          )}
          {step === 'account' && (
            <AccountLinkCard request={request} onChoose={linkAccount} />
          )}
          {step === 'import' && (
            <ImportReviewCard request={request} onConfirm={confirmImport} />
          )}
          {step === 'consent' && (
            <ConsentCard
              request={request}
              accepted={acceptedConsents}
              onToggle={(key, checked) =>
                setAcceptedConsents((current) => {
                  const next = new Set(current);
                  if (checked) next.add(key);
                  else next.delete(key);
                  return next;
                })
              }
              onContinue={recordConsents}
              disabled={!allRequiredConsentsAccepted}
            />
          )}
          {step === 'payment' && (
            <PaymentCard request={request} onComplete={completePayment} onFail={failPayment} />
          )}
          {step === 'verification' && (
            <VerificationProgressCard request={request} onAdvance={advance} />
          )}
          {step === 'complete' && (
            <CompleteCard request={request} />
          )}
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="text-xl font-black">Request summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <MetaLine label="Landlord" value={request.landlordOrganizationName} />
              <MetaLine label="Property" value={request.property.address} />
              <MetaLine label="Requested" value={formatDateTime(request.requestedAt)} />
              <MetaLine label="Expires" value={formatDateTime(request.expiresAt)} />
              <MetaLine label="Package" value={packageLabel(request.package)} />
              <MetaLine label="Payer" value={payerLabel(request)} />
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-xl font-black">Partner-safe update</h2>
            <pre className="mt-4 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">
              {JSON.stringify(safeSummary, null, 2)}
            </pre>
          </Card>
          <Card className="p-5">
            <h2 className="text-xl font-black">Events</h2>
            <div className="mt-4 space-y-3">
              {request.events.slice(-6).map((event) => (
                <div key={event.eventId} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                  <p className="font-black">{event.event}</p>
                  <p className="mt-1 text-slate-600">{formatDateTime(event.timestamp)}</p>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </section>
    </main>
  );
}

function ReviewRequestCard({
  request,
  onAccept,
  onDecline,
}: {
  request: PostApplicationVerificationRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <Card className="p-6">
      <ShieldCheck className="h-12 w-12 text-blue-700" />
      <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight">
        {request.landlordOrganizationName} has requested Rental Passport verification.
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
        {request.landlordOrganizationName} has requested Rental Passport verification for your application to {request.property.address}. Review what will be verified before continuing.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {request.checksIncluded.map((check) => (
          <div key={check} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-600" />
            <span className="font-bold">{check}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="font-black">{payerLabel(request)}</p>
        <p className="mt-1 text-sm leading-6 text-blue-950">
          Continuing lets Rental Passport import the supplied application information only after your confirmation and consent.
        </p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="primary" onClick={onAccept}>
          Continue with Rental Passport
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button onClick={onDecline}>
          <XCircle className="mr-2 h-4 w-4" />
          Decline Request
        </Button>
      </div>
    </Card>
  );
}

function AccountLinkCard({
  request,
  onChoose,
}: {
  request: PostApplicationVerificationRequest;
  onChoose: (mode: 'existing_account' | 'new_account') => void;
}) {
  return (
    <Card className="p-6">
      <Link2 className="h-10 w-10 text-blue-700" />
      <h1 className="mt-4 text-3xl font-black">Connect this request to your Rental Passport</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-700">
        Sign in if you already have a Rental Passport, or create one using {request.applicant.email}. Demo-safe account confirmation is used here; production must use real email verification.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-black">I already have a Rental Passport</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">Link the request, compare imported data with existing passport data, and reuse valid verifications.</p>
          <Button className="mt-4" variant="primary" onClick={() => onChoose('existing_account')}>Demo Sign In & Link</Button>
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-black">Create a Rental Passport</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">Create a new account and import the application data to avoid duplicate entry.</p>
          <Button className="mt-4" onClick={() => onChoose('new_account')}>Demo Create Account</Button>
        </Card>
      </div>
    </Card>
  );
}

function ImportReviewCard({ request, onConfirm }: { request: PostApplicationVerificationRequest; onConfirm: () => void }) {
  return (
    <Card className="p-6">
      <FileText className="h-10 w-10 text-blue-700" />
      <h1 className="mt-4 text-3xl font-black">Review imported application information</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-700">
        Rental Passport will import only the information you confirm. Verified information is not overwritten silently, and conflicts are flagged for your decision.
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {request.safeImportFields.map((field) => (
          <div key={`${field.section}-${field.label}`} className="rounded-xl border border-slate-200 bg-white p-4">
            <MetaLine label={field.label} value={field.value} />
            <p className="mt-2 text-xs font-bold uppercase text-slate-500">{field.source}</p>
            {field.conflict && (
              <Alert tone="info" title="Needs confirmation">
                Existing value: {field.conflict.existingValue}
              </Alert>
            )}
          </div>
        ))}
      </div>
      <Button className="mt-6" variant="primary" onClick={onConfirm}>Confirm Import</Button>
    </Card>
  );
}

function ConsentCard({
  request,
  accepted,
  onToggle,
  onContinue,
  disabled,
}: {
  request: PostApplicationVerificationRequest;
  accepted: Set<string>;
  onToggle: (key: string, checked: boolean) => void;
  onContinue: () => void;
  disabled: boolean;
}) {
  return (
    <Card className="p-6">
      <LockKeyhole className="h-10 w-10 text-blue-700" />
      <h1 className="mt-4 text-3xl font-black">Consent before verification starts</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-700">
        These permissions are not pre-selected. Consent is associated with this request, Rental District, and the requesting landlord.
      </p>
      <div className="mt-6 grid gap-3">
        {request.consents.map((consent) => (
          <ConsentCheckbox
            key={consent.key}
            checked={accepted.has(consent.key) || Boolean(consent.acceptedAt)}
            onChange={(event) => onToggle(consent.key, event.target.checked)}
            label={consent.label}
            description={consent.required ? 'Required for this verification request.' : 'Optional consent.'}
          />
        ))}
      </div>
      <Button className="mt-6" variant="primary" onClick={onContinue} disabled={disabled}>Record Consent</Button>
    </Card>
  );
}

function PaymentCard({
  request,
  onComplete,
  onFail,
}: {
  request: PostApplicationVerificationRequest;
  onComplete: () => void;
  onFail: () => void;
}) {
  return (
    <Card className="p-6">
      <CreditCard className="h-10 w-10 text-blue-700" />
      <h1 className="mt-4 text-3xl font-black">Demo checkout</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-700">
        Applicant price: {request.applicantPriceLabel}. This is a simulated checkout only. No Stripe, credit bureau, email, or live payment service is contacted.
      </p>
      {isProduction && (
        <Alert tone="error">Demo payment controls are disabled in production unless explicitly enabled for a controlled demo environment.</Alert>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="primary" onClick={onComplete} disabled={isProduction}>Complete Demo Payment</Button>
        <Button onClick={onFail} disabled={isProduction}>Simulate Payment Failure</Button>
      </div>
    </Card>
  );
}

function VerificationProgressCard({
  request,
  onAdvance,
}: {
  request: PostApplicationVerificationRequest;
  onAdvance: () => void;
}) {
  return (
    <Card className="p-6">
      <Clock className="h-10 w-10 text-blue-700" />
      <h1 className="mt-4 text-3xl font-black">Verification workflow</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-700">
        Demo-safe verification can advance through controlled stages. This does not represent a real provider check.
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {['verification_queued', 'verification_in_progress', 'manual_review', 'needs_review'].map((status) => (
          <div key={status} className={`rounded-xl border p-4 ${request.status === status ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}>
            <p className="font-black">{statusLabel(status)}</p>
          </div>
        ))}
      </div>
      <Button className="mt-6" variant="primary" onClick={onAdvance} disabled={isProduction}>Advance Demo Status</Button>
    </Card>
  );
}

function CompleteCard({ request }: { request: PostApplicationVerificationRequest }) {
  const viewerUrl = request.completedApplicationId
    ? `/partner/application/${request.completedApplicationId}?launch_token=demo-valid-rental-district`
    : null;
  return (
    <Card className="p-6">
      <ShieldCheck className="h-12 w-12 text-emerald-700" />
      <h1 className="mt-4 text-3xl font-black">Verification ready for landlord review</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-700">
        Major items are verified, and one minor document item remains Needs review. Rental District receives only safe status metadata and a secure viewer launch reference.
      </p>
      {viewerUrl && (
        <Button className="mt-6" variant="primary" onClick={() => window.open(viewerUrl, '_blank', 'noopener,noreferrer')}>
          Open Authoritative Viewer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </Card>
  );
}

function StatusBadge({ label }: { label: string }) {
  const lower = label.toLowerCase();
  const tone = lower.includes('declined') || lower.includes('expired') || lower.includes('cancelled')
    ? 'red'
    : lower.includes('complete') || lower.includes('accepted')
      ? 'green'
      : lower.includes('pending') || lower.includes('review')
        ? 'orange'
        : 'blue';
  return <Badge tone={tone}>{label}</Badge>;
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function packageLabel(value: string) {
  return value.replaceAll('_', ' ');
}

function payerLabel(request: PostApplicationVerificationRequest) {
  if (request.payerMode === 'applicant_pays') return `Applicant pays ${request.applicantPriceLabel}`;
  if (request.payerMode === 'landlord_pays') return `Paid by ${request.landlordOrganizationName}`;
  return "Covered by your landlord's plan";
}

function statusLabel(value: string) {
  return value.replaceAll('_', ' ');
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}
