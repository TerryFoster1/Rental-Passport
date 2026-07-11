import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileSignature,
  FileText,
  FolderOpen,
  Home,
  IdCard,
  LockKeyhole,
  MessageSquare,
  Send,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VerifiedBadge } from '@/components/ui/Badge';

const rentalDistrictDemoUrl =
  import.meta.env.VITE_RENTAL_DISTRICT_DEMO_URL ??
  'http://localhost:5000/rental-passport-demo';

const sections = [
  {
    icon: IdCard,
    title: 'Identity',
    detail: 'Government ID, legal name, phone, and email verified.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Employment',
    detail: 'Tech Solutions Inc. employment and income documents verified.',
  },
  {
    icon: Home,
    title: 'Rental history',
    detail: '24+ months of Ontario rental history and landlord references verified.',
  },
  {
    icon: Users,
    title: 'References',
    detail: 'Three references confirmed and attached to the passport summary.',
  },
  {
    icon: ClipboardCheck,
    title: 'Credit report',
    detail: 'Verified credit summary included for the selected landlord.',
  },
];

const timeline = [
  'Kathryn creates one Rental Passport and completes verification.',
  'Kathryn applies to a Rental District listing with one consented share.',
  'The landlord receives the completed application and verified passport.',
  'The landlord approves the applicant and creates the tenancy.',
  'Rental District generates the Ontario lease package for signature.',
];

export function InvestorDemoPage() {
  const openRentalDistrict = () => {
    window.location.href = rentalDistrictDemoUrl;
  };

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
        <div>
          <VerifiedBadge label="Investor demo" />
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-navy md:text-6xl">
            Apply with a verified Rental Passport.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
            This walkthrough shows the end-to-end investor demo: Kathryn owns a fully verified
            passport, shares it into Rental District, applies to a live test listing, and the test
            landlord approves the application into a tenancy and lease signing package.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" onClick={openRentalDistrict}>
              Open Rental District Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button onClick={() => window.print()}>Print Demo Brief</Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-blue-700">Verified passport holder</p>
              <h2 className="mt-2 text-3xl font-black">Kathryn</h2>
              <p className="mt-1 text-sm text-slate-600">Passport ID RP-7F8A-C3D2</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Fact label="Status" value="Fully verified" />
            <Fact label="Location" value="Toronto, ON" />
            <Fact label="Credit" value="742 good" />
            <Fact label="Risk" value="Low" />
          </div>
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-700">
            <LockKeyhole className="mr-2 inline h-4 w-4 text-blue-700" />
            Kathryn controls the share. Rental District receives only the consented application
            packet for the selected landlord and property.
          </div>
        </Card>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-8 md:grid-cols-5 lg:px-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title} className="p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-black">{section.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{section.detail}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div>
            <h2 className="text-3xl font-black text-navy">What the investor can test</h2>
            <p className="mt-3 leading-7 text-slate-700">
              The demo follows the cross-product workflow Rental Passport is designed to power:
              identity and verification in Rental Passport, application and lease operations in
              Rental District.
            </p>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div key={item} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm font-semibold leading-6 text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <Card className="grid gap-6 bg-gradient-to-br from-blue-50 to-white p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-black uppercase text-blue-700">
              <Building2 className="h-4 w-4" />
              Rental District handoff
            </div>
            <h2 className="mt-2 text-2xl font-black">Send Kathryn's verified application packet.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
              Opens the Rental District V2 investor demo with test landlord properties, a selected
              Toronto listing, the full verified passport packet, landlord approval, tenancy
              creation, and lease signing package.
            </p>
          </div>
          <Button variant="primary" className="h-fit" onClick={openRentalDistrict}>
            Continue to Rental District
            <FileSignature className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      </section>
    </main>
  );
}

const viewerDocuments = [
  ['Government ID', 'Identity reviewer matched legal name and document metadata.', 'View-only verification record'],
  ['Employment letter', 'Employer contact and uploaded letter reviewed.', 'Verified source summary'],
  ['Pay stubs', 'Income consistency checked against employment details.', 'Sensitive document protected'],
  ['Lease history', 'Previous landlord confirmation and lease timeline matched.', 'Verified rental history'],
  ['Credit report', 'Provider report date, score, and key factors verified.', 'Credit summary only'],
];

export function RentalPassportSecureViewerPage() {
  return (
    <main className="min-h-screen bg-[#f8fbff] text-navy">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <img src="/brand/rental-passport-logo.png" alt="Rental Passport" className="h-12 w-auto max-w-[220px]" />
          <VerifiedBadge label="Secure landlord viewer" />
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-4">
          <Card className="p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-black">Kathryn Casey</h1>
            <p className="mt-1 text-sm text-slate-600">Passport ID RP-7F8A-C3D2</p>
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
              Fully verified
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-xs font-black uppercase text-slate-500">Access rules</p>
            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
              <p>Shared only with Greenview Property Management.</p>
              <p>Access expires when the application is closed or converted to tenancy.</p>
              <p>Documents are view-only summaries unless Kathryn grants expanded access.</p>
            </div>
          </Card>
        </aside>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-black uppercase text-blue-700">Rental Passport</p>
                <h2 className="mt-2 text-4xl font-black">Verified rental profile</h2>
                <p className="mt-3 max-w-3xl leading-7 text-slate-700">
                  Landlords review verified facts, consented application details, document verification
                  trails, and available actions without receiving unrestricted document access.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Fact label="Credit" value="742 good" />
                <Fact label="Income" value="$78,000 CAD" />
                <Fact label="History" value="24+ months" />
                <Fact label="Risk" value="Low" />
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-5">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} className="p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <h3 className="font-black">{section.title}</h3>
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{section.detail}</p>
                  <button className="mt-3 text-sm font-black text-blue-700">View trail</button>
                </Card>
              );
            })}
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Documents and verification</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Source documents are protected. The landlord sees what was checked, who verified it,
                  and what can be relied on for this application.
                </p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-700" />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {viewerDocuments.map(([name, detail, status]) => (
                <div key={name} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-black">{name}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
                      <p className="mt-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">{status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="grid gap-3 bg-white p-5 md:grid-cols-5">
            <ActionButton icon={<MessageSquare className="h-4 w-4" />} label="Ask for info" />
            <ActionButton icon={<CalendarDays className="h-4 w-4" />} label="Schedule viewing" />
            <ActionButton icon={<CheckCircle2 className="h-4 w-4" />} label="Save" />
            <ActionButton icon={<XCircle className="h-4 w-4" />} label="Reject" tone="red" />
            <ActionButton icon={<Send className="h-4 w-4" />} label="Approve" tone="green" />
          </Card>
        </div>
      </section>
    </main>
  );
}

function ActionButton({ icon, label, tone = 'blue' }: { icon: ReactNode; label: string; tone?: 'blue' | 'green' | 'red' }) {
  const classes = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    red: 'border-red-200 bg-red-50 text-red-700',
  };
  return (
    <button className={`rounded-xl border px-4 py-3 text-sm font-black ${classes[tone]}`}>
      <span className="mr-2 inline-flex align-middle">{icon}</span>
      {label}
    </button>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 flex items-center gap-1 font-black text-navy">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        {value}
      </p>
    </div>
  );
}
