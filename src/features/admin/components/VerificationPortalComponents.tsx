import { useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, FileSearch, Flag, MessageSquare, UserCheck } from 'lucide-react';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { FraudFlagType, VerificationCaseDetail, VerificationChecklistItem, VerificationDecisionType, VerificationPriority } from '@/types/verificationPortal';
import type { ReviewerAssistanceSummary } from '@/types/launchReadiness';

export function CaseSummaryCard({ detail }: { detail: VerificationCaseDetail }) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-blue-700">Applicant Summary</p>
          <h2 className="mt-2 text-3xl font-black">{detail.case.applicant_name}</h2>
          <p className="mt-1 text-sm text-slate-600">Passport {detail.case.passport_number}</p>
          <p className="mt-1 text-sm text-slate-600">Submitted {new Date(detail.case.submitted_at).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={detail.case.status.replaceAll('_', ' ')} />
          <Badge tone={detail.case.priority === 'urgent' ? 'red' : detail.case.priority === 'high' ? 'orange' : 'slate'}>{detail.case.priority}</Badge>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryMetric label="Section" value={detail.case.section_key.replaceAll('_', ' ')} />
        <SummaryMetric label="Verification Type" value={detail.case.verification_type.replaceAll('_', ' ')} />
        <SummaryMetric label="Assigned To" value={detail.case.assigned_reviewer_name ?? 'Unassigned'} />
      </div>
    </Card>
  );
}

export function VerificationChecklist({ items, onToggle }: { items: VerificationChecklistItem[]; onToggle: (itemId: string, checked: boolean) => void }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-black">Verification Checklist</h2>
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <label key={item.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <input className="mt-1 h-4 w-4" type="checkbox" checked={item.checked} onChange={(event) => onToggle(item.id, event.target.checked)} />
            <span>
              <strong className="block">{item.label}</strong>
              <span className="text-xs font-semibold text-slate-500">{item.required ? 'Required audit item' : 'Optional review item'}</span>
            </span>
          </label>
        ))}
      </div>
    </Card>
  );
}

export function EvidenceViewer({ sectionLabel }: { sectionLabel: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <FileSearch className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-black">Uploaded Documents</h2>
      </div>
      <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
        <p className="font-black">Secure evidence viewer placeholder</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{sectionLabel} documents will render here for authorized reviewers only. Document views are audit logged and prepared for future AI assistance, OCR, and anomaly highlighting.</p>
      </div>
    </Card>
  );
}

export function ReviewerAssistanceCard({ assistance }: { assistance: ReviewerAssistanceSummary }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-black">AI Assistance</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{assistance.summary}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <AssistanceColumn title="Outstanding" items={assistance.outstandingItems} empty="No outstanding checklist items." />
        <AssistanceColumn title="Review Flags" items={assistance.potentialInconsistencies.map((item) => item.title)} empty="No generated flags." />
        <AssistanceColumn title="Follow-up" items={assistance.followUpQuestions} empty="No follow-up prompts." />
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-500">AI assistance does not approve, reject, or score applicants. Human reviewers make all final decisions.</p>
    </Card>
  );
}

export function ReviewerNotes({ notes, onAdd }: { notes: VerificationCaseDetail['notes']; onAdd: (body: string) => void }) {
  const [body, setBody] = useState('');
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-black">Internal Notes</h2>
      </div>
      <p className="mt-2 text-sm text-slate-600">Internal only. Never visible to tenants or landlords.</p>
      <textarea className="mt-4 min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-navy outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={body} onChange={(event) => setBody(event.target.value)} />
      <Button className="mt-3" onClick={() => { onAdd(body); setBody(''); }}>Add Note</Button>
      <div className="mt-5 space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm leading-6 text-slate-700">{note.body}</p>
            <p className="mt-2 text-xs font-semibold text-slate-500">{note.author_name} · {new Date(note.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DecisionPanel({ onDecision }: { onDecision: (decision: VerificationDecisionType, reason: string) => void }) {
  const [decision, setDecision] = useState<VerificationDecisionType>('approve');
  const [reason, setReason] = useState('');
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-700" />
        <h2 className="text-xl font-black">Decision Panel</h2>
      </div>
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Decision</span>
          <select className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-navy outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={decision} onChange={(event) => setDecision(event.target.value as VerificationDecisionType)}>
            <option value="approve">Approve</option>
            <option value="needs_more_information">Needs More Information</option>
            <option value="reject">Reject</option>
            <option value="escalate">Escalate</option>
            <option value="fraud_review">Fraud Review</option>
          </select>
        </label>
        <Input label="Decision reasoning" value={reason} onChange={(event) => setReason(event.target.value)} />
        <Button variant="primary" onClick={() => onDecision(decision, reason)}>Record Decision</Button>
      </div>
    </Card>
  );
}

export function FraudFlagCard({ flags, onFlag }: { flags: VerificationCaseDetail['fraudFlags']; onFlag: (type: FraudFlagType, description: string) => void }) {
  const [flagType, setFlagType] = useState<FraudFlagType>('possible_altered_document');
  const [description, setDescription] = useState('');
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <Flag className="h-5 w-5 text-red-700" />
        <h2 className="text-xl font-black">Fraud Flags</h2>
      </div>
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Flag type</span>
          <select className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-navy outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" value={flagType} onChange={(event) => setFlagType(event.target.value as FraudFlagType)}>
            <option value="possible_fake_id">Possible fake ID</option>
            <option value="possible_fake_employer">Possible fake employer</option>
            <option value="possible_fake_landlord">Possible fake landlord</option>
            <option value="possible_altered_document">Possible altered document</option>
            <option value="possible_duplicate_account">Possible duplicate account</option>
            <option value="identity_mismatch">Identity mismatch</option>
            <option value="other">Other</option>
          </select>
        </label>
        <Input label="Internal description" value={description} onChange={(event) => setDescription(event.target.value)} />
        <Button variant="danger" onClick={() => onFlag(flagType, description)}><AlertTriangle className="mr-2 h-4 w-4" />Create Fraud Flag</Button>
      </div>
      <div className="mt-5 space-y-3">
        {flags.map((flag) => <StatusTimeline key={flag.id} label={flag.flag_type.replaceAll('_', ' ')} detail={flag.description} date={flag.created_at} />)}
      </div>
    </Card>
  );
}

export function CaseTimeline({ activity }: { activity: VerificationCaseDetail['activity'] }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-black">Verification Timeline</h2>
      <div className="mt-5 space-y-3">
        {activity.map((item) => <StatusTimeline key={item.id} label={item.event_type.replaceAll('_', ' ')} detail={item.description} date={item.created_at} />)}
      </div>
    </Card>
  );
}

export function AssignmentCard({ assignedTo, onAssign, onPriority }: { assignedTo: string | null; onAssign: () => void; onPriority: (priority: VerificationPriority) => void }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <UserCheck className="h-5 w-5 text-blue-700" />
        <h2 className="text-xl font-black">Assignment</h2>
      </div>
      <p className="mt-2 text-sm text-slate-600">Assigned to {assignedTo ?? 'Unassigned queue'}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={onAssign}>Assign to Me</Button>
        <select className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-bold text-navy" onChange={(event) => onPriority(event.target.value as VerificationPriority)} defaultValue="">
          <option value="" disabled>Set priority</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
    </Card>
  );
}

export function RequestInformationModal({ onRequest }: { onRequest: (requestedItem: string, message: string) => void }) {
  const [requestedItem, setRequestedItem] = useState('');
  const [message, setMessage] = useState('');
  return (
    <Card className="p-6">
      <h2 className="text-xl font-black">Request Information</h2>
      <p className="mt-2 text-sm text-slate-600">Creates a tenant-facing request while preserving internal notes.</p>
      <div className="mt-4 space-y-4">
        <Input label="Requested item" value={requestedItem} onChange={(event) => setRequestedItem(event.target.value)} />
        <Input label="Tenant message" value={message} onChange={(event) => setMessage(event.target.value)} />
        <Button onClick={() => { onRequest(requestedItem, message); setRequestedItem(''); setMessage(''); }}>Create Request</Button>
      </div>
    </Card>
  );
}

export function StatusTimeline({ label, detail, date }: { label: string; detail: string; date: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <strong className="block capitalize">{label}</strong>
      <p className="mt-1 text-sm text-slate-700">{detail}</p>
      <p className="mt-2 text-xs font-semibold text-slate-500">{new Date(date).toLocaleString()}</p>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <strong className="mt-1 block capitalize">{value}</strong>
    </div>
  );
}

function AssistanceColumn({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div>
      <h3 className="text-sm font-black uppercase text-slate-500">{title}</h3>
      <ul className="mt-2 space-y-2">
        {(items.length > 0 ? items : [empty]).slice(0, 4).map((item) => <li key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-700">{item}</li>)}
      </ul>
    </div>
  );
}
