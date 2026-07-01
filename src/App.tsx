import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Bookmark,
  BriefcaseBusiness,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  FileLock2,
  FileText,
  Gauge,
  HelpCircle,
  Home,
  IdCard,
  Link2,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  UploadCloud,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';

type View =
  | 'landing'
  | 'tenant-dashboard'
  | 'tenant-rental'
  | 'tenant-employment'
  | 'tenant-references'
  | 'tenant-credit'
  | 'tenant-identity'
  | 'tenant-share'
  | 'tenant-preview'
  | 'landlord-summary'
  | 'landlord-rental'
  | 'landlord-employment'
  | 'landlord-references'
  | 'landlord-credit'
  | 'landlord-identity';

type SectionKey = 'rental' | 'employment' | 'references' | 'credit' | 'identity';

type Section = {
  key: SectionKey;
  title: string;
  icon: LucideIcon;
  tone: string;
  tenant: View;
  landlord: View;
  progress: string;
  status: 'Verified' | 'Needs Reverification' | 'Ready to Share';
  summary: { label: string; value: string }[];
  description: string;
  tasks: string[];
  pending?: string[];
};

const applicant = {
  name: 'Kathryn',
  initials: 'K',
  location: 'Toronto, ON, Canada',
  passportId: 'RP-7F8A-C3D2',
  verifiedOn: 'May 29, 2025',
  expires: 'June 12, 2025',
  link: 'https://rentalpassport.io/p/7F8A-C3D2',
};

const sections: Section[] = [
  {
    key: 'rental',
    title: 'Rental History',
    icon: Home,
    tone: 'blue',
    tenant: 'tenant-rental',
    landlord: 'landlord-rental',
    progress: '2 of 3 complete',
    status: 'Verified',
    summary: [
      { label: 'History', value: '24+ months' },
      { label: 'Payments', value: '100% on-time' },
      { label: 'Last rental', value: '123 Maple St' },
    ],
    description: 'Verified through landlord contact and supporting records.',
    tasks: ['Add previous addresses', 'Verify with landlords'],
    pending: ['Optional documents'],
  },
  {
    key: 'employment',
    title: 'Employment',
    icon: BriefcaseBusiness,
    tone: 'green',
    tenant: 'tenant-employment',
    landlord: 'landlord-employment',
    progress: '2 of 4 complete',
    status: 'Needs Reverification',
    summary: [
      { label: 'Employer', value: 'Tech Solutions Inc.' },
      { label: 'Income', value: '$78,000' },
      { label: 'Status', value: 'Needs reverification' },
    ],
    description: 'Income changed since last verification.',
    tasks: ['Add employer', 'Verify employment'],
    pending: ['Choose verification method'],
  },
  {
    key: 'references',
    title: 'References',
    icon: Users,
    tone: 'purple',
    tenant: 'tenant-references',
    landlord: 'landlord-references',
    progress: '3 of 3 complete',
    status: 'Verified',
    summary: [
      { label: 'Provided', value: '3 references' },
      { label: 'Verified', value: '3 of 3' },
      { label: 'Feedback', value: '100% positive' },
    ],
    description: 'Verified by direct contact with consent.',
    tasks: ['Add references', 'Consent to contact', 'Verify references'],
  },
  {
    key: 'credit',
    title: 'Credit Report',
    icon: Gauge,
    tone: 'orange',
    tenant: 'tenant-credit',
    landlord: 'landlord-credit',
    progress: '2 of 2 complete',
    status: 'Verified',
    summary: [
      { label: 'Equifax', value: '742' },
      { label: 'TransUnion', value: '738' },
      { label: 'Rating', value: 'Good' },
    ],
    description: 'Current provider-verified credit summary.',
    tasks: ['Authorize credit check', 'View credit report'],
  },
  {
    key: 'identity',
    title: 'Identity Verification',
    icon: IdCard,
    tone: 'teal',
    tenant: 'tenant-identity',
    landlord: 'landlord-identity',
    progress: '2 of 2 complete',
    status: 'Verified',
    summary: [
      { label: 'Government ID', value: 'Verified' },
      { label: 'Facial match', value: 'Complete' },
      { label: 'Confidence', value: 'High' },
    ],
    description: 'Confirmed through ID, facial, phone, and email checks.',
    tasks: ['Government ID', 'Facial verification'],
  },
];

const toneClass: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  purple: 'bg-violet-50 text-violet-700 ring-violet-100',
  orange: 'bg-orange-50 text-orange-700 ring-orange-100',
  teal: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
};

const tenantCopy: Record<SectionKey, { title: string; subtitle: string; step: string; percent: string; notice: string }> = {
  rental: {
    title: 'Rental History',
    subtitle: 'Add your rental history once. We can verify it through landlord contact or supporting records.',
    step: 'Step 1 of 5',
    percent: '67%',
    notice: 'Lease uploads are optional. Many renters do not have leases, so Rental Passport supports multiple evidence sources.',
  },
  employment: {
    title: 'Employment Verification',
    subtitle: 'Choose how you would like to verify your employment and income.',
    step: 'Step 2 of 5',
    percent: '50%',
    notice: 'This section needs reverification because income changed after the last verified passport version.',
  },
  references: {
    title: 'References',
    subtitle: 'Add people who can be contacted directly to support your application.',
    step: 'Step 3 of 5',
    percent: '100%',
    notice: 'Reference outreach is only done with consent and is tracked for this passport version.',
  },
  credit: {
    title: 'Credit Report',
    subtitle: 'Choose between a provider pull or a recent report upload.',
    step: 'Step 4 of 5',
    percent: '100%',
    notice: 'Landlords see key credit factors, not the full credit report.',
  },
  identity: {
    title: 'Identity Verification',
    subtitle: 'Confirm identity through trusted providers and contact checks.',
    step: 'Step 5 of 5',
    percent: '100%',
    notice: 'Identity verification helps prevent fraud while keeping renter data protected.',
  },
};

const requirements: Record<SectionKey, Requirement[]> = {
  rental: [
    ['Previous Address', 'Required', 'Address, move-in date, move-out date, monthly rent, and reason for leaving.', Home, false],
    ['Landlord Contact', 'Recommended', 'Landlord name, phone, and email so Rental Passport can verify directly.', Phone, false],
    ['Allow Landlord Contact', 'Recommended', 'Let Rental Passport contact the landlord as the strongest verification source.', Link2, false],
    ['Lease or Rental Receipts', 'Optional', 'Lease, payment history, receipts, or inspection reports can strengthen the record.', FileText, true],
  ],
  employment: [
    ['Verify Directly With Employer', 'Recommended', 'Rental Passport contacts your employer to confirm role, status, and income.', Link2, false],
    ['Upload Employment Letter', 'Option', 'Provide a current letter confirming employer, position, and employment status.', FileText, true],
    ['Upload Recent Pay Stub', 'Option', 'Add a recent pay stub to support income verification.', Banknote, true],
    ['Upload Bank Deposits', 'Option', 'Add deposit records as supporting evidence. More evidence means stronger verification.', CreditCard, true],
  ],
  references: [
    ['Personal Reference', 'Option', 'A personal reference who can confirm reliability and communication.', Users, false],
    ['Professional Reference', 'Option', 'A work or community reference who can speak to responsibility.', BriefcaseBusiness, false],
    ['Property Manager', 'Option', 'A property manager reference can strengthen rental trust.', Home, false],
    ['Roommate Reference', 'Option', 'A roommate can confirm household reliability and tenancy behavior.', Users, false],
  ],
  credit: [
    ['Run Credit Report Through Rental Passport', 'Option A', 'Authorize a provider pull and attach verified credit signals to this passport version.', CreditCard, false],
    ['Upload Recent Credit Report', 'Option B', 'Accepted sources include Equifax, TransUnion, Experian, Borrowell, and SingleKey.', UploadCloud, true],
  ],
  identity: [
    ['Government ID', 'Provider Option', 'Driver license, passport, or provincial ID through a trusted identity provider.', IdCard, false],
    ['Facial Verification', 'Provider Option', 'Complete a secure facial match through the provider of your choice.', User, false],
    ['Phone and Email', 'Contact Check', 'Confirm both contact methods for landlord confidence.', Mail, false],
    ['Address Verification', 'Optional', 'Confirm current address using supported provider or document evidence.', Home, false],
  ],
};

type Requirement = [string, string, string, LucideIcon, boolean];

export default function App() {
  const [view, setView] = useState<View>('landing');
  const isLandlord = view.startsWith('landlord');

  return (
    <div className="min-h-screen bg-[#f8fbff] text-navy">
      <Header isLandlord={isLandlord} isLanding={view === 'landing'} go={setView} />
      {view === 'landing' && <LandingPage go={setView} />}
      {view === 'tenant-dashboard' && <TenantDashboard go={setView} />}
      {view === 'tenant-rental' && <TenantSection page="rental" go={setView} />}
      {view === 'tenant-employment' && <TenantSection page="employment" go={setView} />}
      {view === 'tenant-references' && <TenantSection page="references" go={setView} />}
      {view === 'tenant-credit' && <TenantSection page="credit" go={setView} />}
      {view === 'tenant-identity' && <TenantSection page="identity" go={setView} />}
      {view === 'tenant-share' && <ReviewShare go={setView} />}
      {view === 'tenant-preview' && <LandlordSummary go={setView} preview />}
      {view === 'landlord-summary' && <LandlordSummary go={setView} />}
      {view === 'landlord-rental' && <LandlordDetail page="rental" go={setView} />}
      {view === 'landlord-employment' && <LandlordDetail page="employment" go={setView} />}
      {view === 'landlord-references' && <LandlordDetail page="references" go={setView} />}
      {view === 'landlord-credit' && <CreditDetail go={setView} />}
      {view === 'landlord-identity' && <LandlordDetail page="identity" go={setView} />}
    </div>
  );
}

function Header({ isLandlord, isLanding, go }: { isLandlord: boolean; isLanding: boolean; go: (view: View) => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <button className="flex items-center gap-3 text-left" onClick={() => go('landing')}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-soft">
            <Home className="h-6 w-6" />
          </span>
          <span className="leading-none">
            <span className="block text-2xl font-black tracking-tight">Rental</span>
            <span className="block text-2xl font-black tracking-tight">
              Passport<span className="text-blue-600">.io</span>
            </span>
          </span>
        </button>
        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            {isLandlord ? 'Secure. Private. Trusted.' : 'Your data is secure and encrypted'}
          </span>
          {isLanding ? (
            <>
              <a href="#how-it-works" className="font-bold text-slate-700 hover:text-blue-700">How it works</a>
              <Button onClick={() => go('landlord-summary')}>Landlord Preview</Button>
              <Button primary icon={ArrowRight} onClick={() => go('tenant-dashboard')}>Create Passport</Button>
            </>
          ) : isLandlord ? (
            <>
              <Button icon={Mail}>Message Applicant</Button>
              <Button icon={Bookmark}>Save Applicant</Button>
              <Button primary icon={CheckCircle2}>Accept Applicant</Button>
            </>
          ) : (
            <>
              <Button icon={HelpCircle}>Help</Button>
              <button className="flex items-center gap-3 rounded-xl px-3 py-2 font-semibold">
                <Avatar /> Kathryn <ChevronDown className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function LandingPage({ go }: { go: (view: View) => void }) {
  const valuePillars = [
    ['Fill Out Once', 'Complete your rental information one time and reuse it for every application.', ClipboardCheck],
    ['Protect Your Privacy', 'Your personal documents stay securely inside Rental Passport. Landlords see verified information, not your private files.', FileLock2],
    ['Get Approved Faster', 'Verified identity, employment, rental history and credit help landlords review your application with confidence.', ShieldCheck],
  ] as const;

  const frustrations = [
    ['Filling out the same application over and over.', 'Build one reusable rental profile instead.'],
    ['Emailing sensitive documents to multiple landlords.', 'Keep documents in your secure passport and share verified results.'],
    ['Waiting days while landlords verify your information.', 'Send a passport with verification already attached.'],
    ['Losing track of which documents you have already sent.', 'Control access from one place and see who has viewed your passport.'],
  ];

  const verificationItems = [
    'Identity verified',
    'Employment verified',
    'Income verified',
    'Rental history verified',
    'References verified',
    'Credit verified',
  ];

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1fr_440px] lg:px-8 lg:py-24">
        <div>
          <Badge tone="blue">Your reusable rental identity</Badge>
          <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-tight md:text-7xl">
            Fill It Out Once.
            <span className="block text-blue-700">Apply Anywhere.</span>
            <span className="block">Protect Your Information.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-700">
            Stop filling out lengthy rental applications over and over. Build one secure Rental Passport that stores your verified rental information, protects your sensitive documents, and lets you apply anywhere with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button primary icon={ArrowRight} onClick={() => go('tenant-dashboard')}>Create Your Free Passport</Button>
            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 font-black text-navy transition hover:border-blue-300 hover:bg-blue-50">
              See How It Works
            </a>
          </div>
        </div>
        <Card className="self-center p-6 shadow-soft">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 p-6">
            <div className="flex items-center justify-between">
              <Avatar />
              <VerifiedBadge label="Version verified" />
            </div>
            <h2 className="mt-6 text-3xl font-black">Kathryn's Rental Passport</h2>
            <p className="mt-2 text-slate-700">One application. Verified once. Shared privately when Kathryn chooses.</p>
            <div className="mt-6 space-y-3">
              {['Application ready', 'Documents protected', 'Verification complete', 'Access controlled'].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-xl bg-white p-3">
                  <span className="font-semibold">{item}</span>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-8 lg:grid-cols-3 lg:px-8">
        {valuePillars.map(([title, text, icon]) => (
          <PainCard key={title} icon={icon} title={title} text={text} />
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-black tracking-tight">Renting Shouldn't Feel Like Starting Over Every Time.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            Rental Passport turns the most frustrating parts of applying into one reusable, verified profile that you control.
          </p>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {frustrations.map(([problem, solution]) => (
            <Card key={problem} className="p-6">
              <div className="flex gap-4">
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xl font-black">{problem}</h3>
                  <p className="mt-2 text-slate-700">{solution}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-4xl font-black tracking-tight">How It Works</h2>
          <p className="mt-3 text-lg text-slate-700">Complete your passport once, get verified, then apply without starting over.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <StepCard step="1" title="Build Your Passport" text="Complete your rental profile once." />
          <StepCard step="2" title="Get Verified" text="We verify your identity, employment, references, rental history and credit." />
          <StepCard step="3" title="Apply Anywhere" text="Share one secure Rental Passport instead of filling out applications again and again." />
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1fr_420px] lg:px-8">
          <div>
            <h2 className="text-4xl font-black tracking-tight">Your Information Stays Yours.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              Most renters send copies of their driver's licence, pay stubs, credit reports and other sensitive documents to complete strangers during the rental process.
            </p>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              Rental Passport changes that. Your documents remain securely stored inside your passport. Landlords receive independently verified information, not copies of your private documents, unless you choose to share them.
            </p>
          </div>
          <Card className="border-blue-200 bg-blue-50 p-6">
            <IconBubble icon={Lock} tone="blue" />
            <h3 className="mt-5 text-2xl font-black">Verification instead of document sharing.</h3>
            <CheckList items={['Secure document vault', 'Encrypted storage', 'Verification instead of document sharing', 'Track who has viewed your passport', 'Revoke access at any time']} />
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-black tracking-tight">Verified for Landlords. Private for Tenants.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            Rental Passport verifies information instead of simply storing documents. Landlords get the confidence they need, while tenants keep control of the files behind each verification.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {verificationItems.map((feature) => (
            <div key={feature} className="rounded-2xl border border-slate-200 bg-white p-4 font-bold shadow-sm">
              <CheckCircle2 className="mb-3 h-5 w-5 text-emerald-600" />
              {feature}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-16 lg:grid-cols-2 lg:px-8">
        <Card className="p-7">
          <h2 className="text-3xl font-black">A Better Experience for Landlords Too.</h2>
          <p className="mt-3 text-lg text-slate-700">Receive complete, verified applications. Review applicants faster, reduce fraud, and approve with confidence.</p>
          <CheckList items={['Complete verified applications', 'Faster applicant review', 'Reduced fraud risk', 'Regional rental applications']} />
        </Card>
        <Card className="p-7">
          <h2 className="text-3xl font-black">From application to lease</h2>
          <p className="mt-3 text-lg text-slate-700">Generate regional rental applications, send digital lease agreements, and complete lease signing securely through Rental Passport.</p>
          <p className="mt-5 rounded-xl bg-slate-50 p-4 font-semibold">Rental Passport helps renters apply and landlords decide before the tenancy begins.</p>
        </Card>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-20 text-center lg:px-8">
        <h2 className="text-4xl font-black tracking-tight">Ready to Stop Filling Out Rental Applications?</h2>
        <p className="mt-4 text-xl text-slate-700">Build your Rental Passport once. Protect your personal information. Apply anywhere with confidence.</p>
        <Button primary icon={ArrowRight} onClick={() => go('tenant-dashboard')} className="mt-8">Create My Free Passport</Button>
      </section>
    </main>
  );
}

function PainCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <Card className="p-7">
      <IconBubble icon={Icon} tone="blue" />
      <h2 className="mt-5 text-2xl font-black">{title}</h2>
      <p className="mt-3 text-slate-700">{text}</p>
    </Card>
  );
}

function StepCard({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <Card className="p-7">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-black text-white">{step}</div>
      <h3 className="mt-5 text-2xl font-black">{title}</h3>
      <p className="mt-3 text-slate-700">{text}</p>
    </Card>
  );
}

function TenantDashboard({ go }: { go: (view: View) => void }) {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <div className="mb-7 grid gap-5 lg:grid-cols-[1fr_300px] lg:items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight md:text-5xl">Hi Kathryn,</h1>
          <p className="mt-3 text-xl text-slate-700">Build your rental profile once. Apply everywhere.</p>
        </div>
        <button onClick={() => go('tenant-share')} className="card flex items-center gap-4 p-5 text-left hover:border-blue-300">
          <IconBubble icon={Link2} tone="blue" />
          <span>
            <strong className="block text-lg text-blue-700">Share My Passport</strong>
            <span className="text-slate-600">You are in control. Share securely.</span>
          </span>
        </button>
      </div>

      <Card className="mb-6 p-6">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
          <div>
            <div className="text-5xl font-black text-blue-700">72%</div>
            <div className="mt-1 font-bold text-slate-700">Passport complete</div>
          </div>
          <div>
            <h2 className="text-xl font-black">Complete these remaining steps</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-5">
              <ProgressItem done label="Personal Information" />
              <ProgressItem done label="Rental History" />
              <ProgressItem label="Employment Verification" />
              <ProgressItem done label="Credit Report" />
              <ProgressItem label="Review & Share" />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {sections.map((section) => <SectionCard key={section.key} section={section} go={go} />)}
        <TrustPanel />
      </div>
      <TrustBanner className="mt-6" />
    </main>
  );
}

function TenantSection({ page, go }: { page: SectionKey; go: (view: View) => void }) {
  const section = sections.find((item) => item.key === page)!;
  const copy = tenantCopy[page];
  const Icon = section.icon;

  return (
    <main className="mx-auto grid max-w-[1440px] gap-6 px-5 py-8 lg:grid-cols-[180px_minmax(0,1fr)_260px] lg:px-8">
      <SideNav active={page} mode="tenant" go={go} />
      <section>
        <BackButton label="Back to Dashboard" onClick={() => go('tenant-dashboard')} />
        <div className="mb-6 flex items-center gap-5">
          <HeroIcon icon={Icon} tone={section.tone} />
          <div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">{copy.title}</h1>
            <p className="mt-2 text-lg text-slate-700">{copy.subtitle}</p>
          </div>
        </div>
        <div className="mb-6 flex items-center gap-5">
          <Badge tone="blue">{copy.step}</Badge>
          <span className="font-semibold text-slate-700">{copy.percent} complete</span>
          <div className="h-2 flex-1 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: copy.percent }} />
          </div>
        </div>
        <Notice title={`${section.title} Required`} text={copy.notice} />
        <h2 className="mt-7 text-2xl font-black">
          {page === 'rental' ? 'Tell us about your rental history' : `Choose how to verify ${section.title.toLowerCase()}`}
        </h2>
        <p className="mt-2 text-slate-700">The more trusted evidence you provide, the stronger this passport section becomes.</p>
        <div className="mt-5 space-y-4">
          {requirements[page].map(([title, tag, text, icon, upload]) => (
            <RequirementCard key={title} title={title} tag={tag} text={text} icon={icon} upload={upload} />
          ))}
        </div>
        <VerificationEvidence page={page} />
        {page === 'credit' && <AcceptedSources />}
        <div className="mt-7 flex items-center justify-between gap-4">
          <Button icon={ArrowLeft} onClick={() => go('tenant-dashboard')}>Back</Button>
          <Button primary icon={ArrowRight} onClick={() => go(nextTenantView(page))}>Save & Continue</Button>
        </div>
      </section>
      <Aside section={section} />
    </main>
  );
}

function ReviewShare({ go }: { go: (view: View) => void }) {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <BackButton label="Back to Dashboard" onClick={() => go('tenant-dashboard')} />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section>
          <h1 className="text-4xl font-black tracking-tight">Review & Share</h1>
          <p className="mt-2 text-lg text-slate-700">Review your completed passport, choose permissions, and generate a secure landlord link.</p>
          <Card className="mt-6 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black">Passport Sections</h2>
              <VerifiedBadge label="Fully verified" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {sections.map((section) => <MiniSection key={section.key} section={section} go={go} />)}
            </div>
          </Card>
          <Card className="mt-6 p-6">
            <h2 className="text-xl font-black">Share Settings</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Setting icon={Lock} title="View-only" text="Landlords can review but not edit your passport." />
              <Setting icon={Clock} title="Expires in 14 days" text={`This link stops working on ${applicant.expires}.`} />
              <Setting icon={ShieldCheck} title="Revocable" text="You can revoke access from activity history." />
            </div>
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <label className="text-sm font-bold text-slate-600">Secure landlord link</label>
              <div className="mt-2 flex gap-2">
                <input readOnly value={applicant.link} className="min-w-0 flex-1 rounded-lg border border-blue-200 bg-white px-3 py-3 font-semibold" />
                <Button icon={Copy}>Copy</Button>
              </div>
            </div>
          </Card>
          <Card className="mt-6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Application Package</h2>
                <p className="mt-2 text-slate-700">Rental Passport automatically prepares a complete package for landlords.</p>
              </div>
              <Badge tone="blue">Auto-generated</Badge>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {['Completed Rental Application', 'Verification Summary', 'Employment Summary', 'Rental History Summary', 'Reference Summary', 'Credit Summary', 'Identity Summary', 'Rental Passport'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="mt-6 p-6">
            <h2 className="text-xl font-black">Auto-Filled Rental Applications</h2>
            <p className="mt-2 text-slate-700">Rental Passport detects location and prepares the supported application format so tenants never fill out the same information twice.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {['Ontario Standard Rental Application', 'British Columbia Rental Application', 'California Rental Application', 'Texas Rental Application', 'Landlord Custom Application'].map((item) => (
                <div key={item} className="rounded-xl border border-slate-200 p-3 font-semibold">{item}</div>
              ))}
            </div>
          </Card>
        </section>
        <aside className="space-y-5">
          <TrustBanner />
          <Card className="p-6">
            <h3 className="text-xl font-black">Before You Share</h3>
            <CheckList items={['Unique link per landlord', 'Expiration date required', 'View-only by default', 'Access is tracked', 'Link can be revoked']} />
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-black">Downloads</h3>
            <div className="mt-4 space-y-3">
              <Button icon={FileText} className="w-full">Verification Summaries</Button>
              <Button primary icon={FileText} className="w-full">Complete Application Package</Button>
            </div>
            <p className="mt-3 text-sm text-slate-600">Raw documents stay private unless explicitly shared in a future version.</p>
          </Card>
          <Button primary icon={ExternalLink} onClick={() => go('tenant-preview')} className="w-full">Preview Passport</Button>
          <Button icon={Send} onClick={() => go('landlord-summary')} className="w-full">Open Landlord View</Button>
        </aside>
      </div>
    </main>
  );
}

function LandlordSummary({ go, preview = false }: { go: (view: View) => void; preview?: boolean }) {
  return (
    <main className="mx-auto max-w-[1440px] px-5 py-7 lg:px-8">
      <BackButton label={preview ? 'Back to Share Settings' : 'Back to Passport'} onClick={() => go(preview ? 'tenant-share' : 'tenant-dashboard')} />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section>
          <Card className="border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-7">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-800">
                  <ShieldCheck className="h-4 w-4" /> Independently verified applicant
                </div>
                <h1 className="text-4xl font-black tracking-tight md:text-5xl">{applicant.name}</h1>
                <p className="mt-3 text-xl text-slate-700">Can this applicant be trusted? <strong className="text-emerald-800">Yes. Low risk with one section flagged for reverification.</strong></p>
                <div className="mt-4 grid gap-2 text-slate-700 sm:grid-cols-2">
                  <Inline icon={FileText}>Passport ID: {applicant.passportId}</Inline>
                  <Inline icon={Calendar}>Verified on: {applicant.verifiedOn}</Inline>
                  <Inline icon={Clock}>Expires: {applicant.expires}</Inline>
                  <Inline icon={MapPin}>{applicant.location}</Inline>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                <ShieldCheck className="mx-auto h-14 w-14 text-emerald-700" />
                <h2 className="mt-3 text-2xl font-black text-emerald-800">LOW RISK</h2>
                <p className="mt-2 text-slate-700">Most information is independently verified. Employment needs reverification after an income update.</p>
              </div>
            </div>
          </Card>
          <Card className="mt-6 grid gap-4 p-5 md:grid-cols-7">
            <Stat icon={Gauge} label="Credit Score" value="742" sub="Good" />
            <Stat icon={Home} label="Rental History" value="Strong" sub="24+ months" />
            <Stat icon={BriefcaseBusiness} label="Employment" value="Review" sub="Needs reverification" />
            <Stat icon={Banknote} label="Income" value="$78K" sub="Updated recently" />
            <Stat icon={IdCard} label="Identity" value="Verified" sub="High confidence" />
            <Stat icon={Users} label="References" value="3/3" sub="Verified" />
            <Stat icon={ShieldCheck} label="Risk" value="Low" sub="Overall" />
          </Card>
          <div className="mt-6 grid gap-5 lg:grid-cols-5">
            {sections.map((section) => <LandlordCard key={section.key} section={section} go={go} />)}
          </div>
          <TrustBanner className="mt-6" />
        </section>
        <aside className="space-y-5">
          <Card className="p-6">
            <h2 className="text-xl font-black">Share This Passport</h2>
            <p className="mt-2 text-slate-700">This secure link is unique to this landlord.</p>
            <div className="mt-4 flex gap-2">
              <input readOnly value={applicant.link} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-3" />
              <Button primary icon={Copy} />
            </div>
            <p className="mt-4 flex items-center gap-2 font-semibold text-slate-700"><Clock className="h-4 w-4" /> Link expires: {applicant.expires}</p>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-black">Applicant Actions</h2>
            <div className="mt-4 space-y-3">
              <Button primary icon={FileText} className="w-full">Download Application Package</Button>
              <Button icon={FileText} className="w-full">Download Verification Summary</Button>
              <Button icon={Mail} className="w-full">Message Applicant</Button>
              <Button icon={Bookmark} className="w-full">Save Applicant</Button>
              <Button primary icon={CheckCircle2} className="w-full">Accept Applicant</Button>
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-black">Document Privacy</h2>
            <p className="mt-3 text-slate-700">Landlords receive verified summaries, not raw documents. ID, credit reports, pay stubs, bank statements, employment letters, leases, and supporting documents stay inside Rental Passport.</p>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function LandlordDetail({ page, go }: { page: Exclude<SectionKey, 'credit'>; go: (view: View) => void }) {
  const detail = details[page];
  const section = sections.find((item) => item.key === page)!;
  const needsReview = section.status === 'Needs Reverification';

  return (
    <main className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
      <BackButton label="Back to Passport" onClick={() => go('landlord-summary')} />
      <div className="mb-6 grid gap-5 lg:grid-cols-[1fr_360px] lg:items-center">
        <div className="flex items-center gap-5">
          <HeroIcon icon={section.icon} tone={section.tone} />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight">{section.title} Report</h1>
              <Badge tone={needsReview ? 'orange' : 'green'}>{section.status}</Badge>
            </div>
            <p className="mt-2 text-lg text-slate-700">{detail.subtitle}</p>
          </div>
        </div>
        <Notice title={detail.noticeTitle} text={detail.noticeText} />
      </div>
      <Card className="grid gap-4 p-5 md:grid-cols-4">
        {detail.stats.map((stat) => <Stat key={stat.label} {...stat} />)}
      </Card>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card className="p-6">
          <h2 className="text-xl font-black">{detail.mainTitle}</h2>
          {page === 'rental' ? <Timeline /> : <Rows rows={detail.rows} />}
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-black">Trust Indicators</h2>
          <CheckList items={detail.checks} />
          <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-emerald-900">
            <strong>{detail.trustTitle}</strong>
            <p className="mt-1 text-sm">{detail.trustText}</p>
          </div>
        </Card>
      </div>
      <Documents />
    </main>
  );
}

const details: Record<Exclude<SectionKey, 'credit'>, {
  subtitle: string;
  noticeTitle: string;
  noticeText: string;
  mainTitle: string;
  stats: { icon: LucideIcon; label: string; value: string; sub: string }[];
  rows: { label: string; value: string }[];
  checks: string[];
  trustTitle: string;
  trustText: string;
}> = {
  rental: {
    subtitle: 'Verified by direct contact with previous landlords and lease documentation.',
    noticeTitle: 'Information independently verified',
    noticeText: 'This rental history has been verified using direct contact and trusted data sources.',
    mainTitle: 'Rental Timeline',
    stats: [
      { icon: Home, label: 'Properties Rented', value: '2', sub: 'Toronto rentals' },
      { icon: Calendar, label: 'Months History', value: '24+', sub: 'Verified history' },
      { icon: CreditCard, label: 'On-Time Payments', value: '100%', sub: 'Payment record' },
      { icon: ShieldCheck, label: 'Evictions', value: '0', sub: 'No records found' },
    ],
    rows: [],
    checks: ['Previous landlord contacted', 'Lease documentation reviewed', 'Payment history verified', 'No lease violations reported'],
    trustTitle: 'Verified by direct contact and lease documentation',
    trustText: 'Rental Passport confirmed this information with previous landlords and supporting documents.',
  },
  employment: {
    subtitle: 'Verified employment, income, and stability signals for this applicant.',
    noticeTitle: 'Needs reverification',
    noticeText: 'Income changed after the last verified passport version. Employer contact is recommended before final approval.',
    mainTitle: 'Employment Details',
    stats: [
      { icon: BriefcaseBusiness, label: 'Employer', value: 'Tech Solutions', sub: 'Inc.' },
      { icon: User, label: 'Position', value: 'Software', sub: 'Engineer' },
      { icon: Clock, label: 'Time With Employer', value: '2+', sub: 'Years' },
      { icon: Banknote, label: 'Annual Income', value: '$78K', sub: 'Verified' },
    ],
    rows: [
      { label: 'Employer', value: 'Tech Solutions Inc.' },
      { label: 'Position', value: 'Software Engineer' },
      { label: 'Employment Status', value: 'Full-time' },
      { label: 'Time with Employer', value: '2+ years' },
      { label: 'Annual Income', value: '$78,000' },
      { label: 'Verification Method', value: 'Direct employer contact, pay stubs, bank records' },
    ],
    checks: ['Previous employer contact completed', 'Recent pay stubs available', 'Bank deposit proof available', 'Income update requires reverification'],
    trustTitle: 'Versioning note',
    trustText: 'Rental Passport does not continue showing changed income as verified until the affected section is checked again.',
  },
  references: {
    subtitle: 'Personal and professional references verified with consent.',
    noticeTitle: 'References verified',
    noticeText: 'All provided references responded positively and confirmed their relationship.',
    mainTitle: 'Reference Summary',
    stats: [
      { icon: Users, label: 'Submitted', value: '3', sub: 'References' },
      { icon: CheckCircle2, label: 'Verified', value: '3', sub: 'Confirmed' },
      { icon: MessageSquare, label: 'Positive Feedback', value: '100%', sub: 'Would recommend' },
      { icon: ShieldCheck, label: 'Consent', value: 'Yes', sub: 'Tracked' },
    ],
    rows: [
      { label: 'Reference 1', value: 'Professional reference, verified by phone, would recommend' },
      { label: 'Reference 2', value: 'Personal reference, verified by email, positive response' },
      { label: 'Reference 3', value: 'Community reference, verified by phone, would recommend' },
    ],
    checks: ['Three references provided', 'Three references verified', 'Consent to contact recorded', 'Positive feedback received'],
    trustTitle: 'Consistent positive references',
    trustText: 'Reference responses support this applicant reliability and communication.',
  },
  identity: {
    subtitle: 'Government ID, facial match, and contact channels verified.',
    noticeTitle: 'Identity verified',
    noticeText: 'Identity signals were verified using trusted third-party identity checks.',
    mainTitle: 'Identity Checks',
    stats: [
      { icon: IdCard, label: 'Government ID', value: 'Verified', sub: 'Ontario license' },
      { icon: User, label: 'Facial Match', value: 'Complete', sub: 'High confidence' },
      { icon: Mail, label: 'Email', value: 'Verified', sub: 'Confirmed' },
      { icon: Phone, label: 'Phone', value: 'Verified', sub: 'Confirmed' },
    ],
    rows: [
      { label: 'Government ID', value: 'Ontario Driver License verified' },
      { label: 'Facial Match', value: 'Completed with high confidence' },
      { label: 'Name', value: 'Verified against ID' },
      { label: 'Date of Birth', value: 'Verified against ID' },
      { label: 'Provider', value: 'Jumio' },
      { label: 'Verification Date', value: applicant.verifiedOn },
    ],
    checks: ['Government ID verified', 'Facial match completed', 'Name and date of birth verified', 'Phone and email verified'],
    trustTitle: 'Identity confidence status: high',
    trustText: 'This helps reduce fraud while protecting the applicant personal data.',
  },
};

function CreditDetail({ go }: { go: (view: View) => void }) {
  return (
    <main className="mx-auto grid max-w-[1440px] gap-6 px-5 py-7 lg:grid-cols-[180px_minmax(0,1fr)_260px] lg:px-8">
      <SideNav active="credit" mode="landlord" go={go} />
      <section>
        <BackButton label="Back to Applicants" onClick={() => go('landlord-summary')} />
        <div className="mb-6 flex items-center justify-between gap-5">
          <div className="flex items-center gap-5">
          <HeroIcon icon={Gauge} tone="orange" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight">Credit Report</h1>
              <VerifiedBadge />
            </div>
            <p className="mt-2 text-slate-700">This credit report was pulled and verified on May 29, 2025.</p>
          </div>
          </div>
          <div className="hidden gap-3 xl:flex">
            <Button icon={ExternalLink}>View Summary</Button>
            <Button primary icon={FileText}>Download Summary</Button>
          </div>
        </div>
        <Notice title="Credit Report Verified" text="This report has been verified using data from Equifax and TransUnion." />
        <Card className="mt-5 p-6">
          <h2 className="text-xl font-black">Credit Score</h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1fr_260px] lg:items-center">
            <Score bureau="EQUIFAX" score="742" />
            <Score bureau="TransUnion" score="738" />
            <div className="rounded-xl bg-emerald-50 p-5">
              <h3 className="font-black text-emerald-800">Great Score!</h3>
              <p className="mt-2 text-slate-700">Applicant has a strong credit profile with low risk and responsible credit management.</p>
              <Rows rows={[{ label: 'Score Rating', value: 'Good' }, { label: 'National Average', value: '688' }, { label: 'Score Range', value: '300 - 850' }]} />
            </div>
          </div>
        </Card>
        <Card className="mt-5 p-6">
          <h2 className="text-xl font-black">Credit Summary</h2>
          <Rows rows={[
            { label: 'Payment History', value: '100% On-Time' },
            { label: 'Collections', value: 'None Found' },
            { label: 'Public Records', value: 'None Found' },
            { label: 'Credit Utilization', value: '12%' },
            { label: 'Average Account Age', value: '7.1 years' },
            { label: 'Hard Inquiries', value: '3 in past 2 years' },
            { label: 'Bankruptcy', value: 'None' },
            { label: 'Consumer Proposal', value: 'None' },
          ]} />
        </Card>
        <Card className="mt-5 border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-black">Verification & Trust</h2>
          <CheckList items={['Verified directly through provider', 'Credit report supplied directly from Equifax and TransUnion', 'Report not modified', 'Verified by Rental Passport', 'Current as of May 29, 2025']} />
        </Card>
        <Card className="mt-5 p-6">
          <h2 className="text-xl font-black">Verified Credit Summary</h2>
          <p className="mt-2 text-slate-700">Rental Passport verifies credit data through providers and shares a landlord-safe summary. The full credit report remains private unless the tenant explicitly grants additional access in a future version.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Button icon={ExternalLink}>View Credit Summary</Button>
            <Button icon={FileText}>Download Credit Summary</Button>
          </div>
        </Card>
      </section>
      <aside className="space-y-5">
        <Card className="p-6">
          <h2 className="text-xl font-black">Report Details</h2>
          <Rows rows={[
            { label: 'Report Date', value: 'May 29, 2025' },
            { label: 'Equifax Report ID', value: 'EFX-29MAY25-7F8A' },
            { label: 'TransUnion Report ID', value: 'TU-29MAY25-7F8A' },
            { label: 'Next Update Available', value: 'Jun 29, 2025' },
          ]} />
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-black">What This Means for You</h2>
          <p className="mt-3 text-slate-700">This applicant demonstrates low financial risk based on their credit profile.</p>
          <CheckList items={['Strong payment history', 'Low credit utilization', 'No collections or derogatory marks', 'More likely to pay rent on time', 'Supports a confident rental decision']} />
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-black">Available Actions</h2>
          <div className="mt-4 space-y-3">
            <Button icon={Mail} className="w-full">Message Applicant</Button>
            <Button icon={Bookmark} className="w-full">Save Applicant</Button>
            <Button primary icon={CheckCircle2} className="w-full">Accept Applicant</Button>
          </div>
        </Card>
        <TrustBanner />
      </aside>
    </main>
  );
}

function SectionCard({ section, go }: { section: Section; go: (view: View) => void }) {
  const needsReview = section.status === 'Needs Reverification';
  return (
    <button onClick={() => go(section.tenant)} className="card group p-7 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <IconBubble icon={section.icon} tone={section.tone} />
        <Badge tone={needsReview ? 'orange' : 'green'}>{section.status}</Badge>
      </div>
      <h2 className="mt-5 text-2xl font-black">{section.title}</h2>
      <p className="mt-2 min-h-12 text-slate-700">{section.description}</p>
      <div className="mt-5 space-y-3">
        {section.summary.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
            <span className="text-sm text-slate-500">{item.label}</span>
            <strong className={needsReview && item.label === 'Status' ? 'text-orange-700' : 'text-navy'}>{item.value}</strong>
          </div>
        ))}
      </div>
      <span className="mt-5 inline-flex items-center gap-2 font-bold text-blue-700 group-hover:gap-3">View <ArrowRight className="h-4 w-4" /></span>
    </button>
  );
}

function LandlordCard({ section, go }: { section: Section; go: (view: View) => void }) {
  const facts: Record<SectionKey, string[]> = {
    rental: ['2 properties rented', '24+ months history', '100% on-time payments'],
    employment: ['Tech Solutions Inc.', '$78,000 income', '2+ years current job'],
    references: ['3 provided', '3 verified', '100% positive feedback'],
    credit: ['742 Equifax score', '738 TransUnion score', 'No collections'],
    identity: ['Government ID verified', 'Facial match completed', 'Email and phone verified'],
  };
  const needsReview = section.status === 'Needs Reverification';
  return (
    <button onClick={() => go(section.landlord)} className="card p-5 text-left hover:border-blue-300">
      <IconBubble icon={section.icon} tone={section.tone} />
      <Badge tone={needsReview ? 'orange' : 'green'}>{section.status}</Badge>
      <h2 className="mt-3 text-xl font-black">{section.title}</h2>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {facts[section.key].map((fact) => <li key={fact} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-600" /> {fact}</li>)}
      </ul>
      <span className="mt-5 inline-flex items-center gap-2 font-bold text-blue-700">View Details <ArrowRight className="h-4 w-4" /></span>
    </button>
  );
}

function RequirementCard({ title, tag, text, icon: Icon, upload }: { title: string; tag: string; text: string; icon: LucideIcon; upload: boolean }) {
  return (
    <Card className="grid gap-4 p-5 md:grid-cols-[64px_1fr_220px] md:items-center">
      <IconBubble icon={Icon} tone="green" />
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-3">
          <h3 className="text-xl font-black">{title}</h3>
          <Badge tone={tag === 'Optional' || tag === 'Alternative' ? 'slate' : 'green'}>{tag}</Badge>
        </div>
        <p className="text-slate-700">{text}</p>
      </div>
      {upload ? <UploadBox /> : <Button>{title.includes('Direct') || title.includes('Allow') ? 'Start Verification' : 'Add Details'}</Button>}
    </Card>
  );
}

function VerificationEvidence({ page }: { page: SectionKey }) {
  const evidence: Record<SectionKey, string[]> = {
    rental: ['Previous landlord contacted', 'Lease or equivalent record reviewed when available', 'Payment history reviewed', 'No lease violations reported'],
    employment: ['Employer contacted directly', 'Employment letter reviewed', 'Pay stub reviewed', 'Bank deposits matched'],
    references: ['Reference contacted directly', 'Relationship confirmed', 'Consent to contact recorded', 'Positive response summarized'],
    credit: ['Credit report supplied directly from provider', 'Report not modified', 'Verified by Rental Passport', 'Current as of May 29, 2025'],
    identity: ['Government ID verified', 'Facial verification passed', 'Email verified', 'Phone verified'],
  };

  return (
    <Card className="mt-5 border-emerald-200 bg-emerald-50 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black">How verification is completed</h3>
          <p className="mt-2 text-slate-700">Rental Passport verifies information and shares the result. Source documents stay private.</p>
        </div>
        <Badge tone="green">Private by default</Badge>
      </div>
      <CheckList items={evidence[page]} />
    </Card>
  );
}

function Aside({ section }: { section: Section }) {
  return (
    <aside className="space-y-5">
      <Card className="p-6">
        <div className="flex gap-4">
          <IconBubble icon={ShieldCheck} tone="green" />
          <div>
            <h3 className="text-xl font-black">Why this matters</h3>
            <p className="mt-2 text-slate-700">Verified {section.title.toLowerCase()} helps landlords trust your application quickly.</p>
          </div>
        </div>
        <CheckList items={['Builds trust and credibility', 'Speeds up application approvals', 'Helps you stand out', 'Attached to this passport version']} />
      </Card>
      <Card className="p-6">
        <h3 className="text-xl font-black">Section Overview</h3>
        <Rows rows={[
          { label: 'Total', value: `${section.tasks.length + (section.pending?.length ?? 0)} items` },
          { label: 'Completed', value: section.progress },
          { label: 'Required', value: 'Tracked' },
          { label: 'Status', value: section.pending?.length ? 'In progress' : 'Verified' },
        ]} />
      </Card>
      <Card className="p-6">
        <h3 className="text-xl font-black">Need help?</h3>
        <p className="mt-2 text-slate-700">Document tips and support are available every step of the way.</p>
        <a className="mt-3 inline-flex items-center gap-2 font-bold text-blue-700">Contact Support <ArrowRight className="h-4 w-4" /></a>
      </Card>
    </aside>
  );
}

function SideNav({ active, mode, go }: { active: SectionKey; mode: 'tenant' | 'landlord'; go: (view: View) => void }) {
  return (
    <aside className="hidden lg:block">
      <Card className="sticky top-24 p-5">
        <div className="mb-5 flex items-center gap-3">
          <Avatar />
          <div><strong>{applicant.name}</strong><p className="text-sm text-slate-600">Low Risk</p></div>
        </div>
        <div className="space-y-2">
          {sections.map((section) => {
            const selected = section.key === active;
            return (
              <button key={section.key} onClick={() => go(mode === 'tenant' ? section.tenant : section.landlord)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${selected ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}>
                <section.icon className="h-5 w-5" />
                <span className="flex-1"><strong className="block">{section.title}</strong><span className="text-sm">{selected ? 'Selected' : 'Verified'}</span></span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </button>
            );
          })}
        </div>
      </Card>
    </aside>
  );
}

function MiniSection({ section, go }: { section: Section; go: (view: View) => void }) {
  return (
    <button onClick={() => go(section.tenant)} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 text-left hover:border-blue-300">
      <IconBubble icon={section.icon} tone={section.tone} />
      <span className="flex-1"><strong className="block">{section.title}</strong><span className="text-sm text-slate-600">{section.progress}</span></span>
      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
    </button>
  );
}

function TrustPanel() {
  return (
    <Card className="bg-blue-50 p-7">
      <IconBubble icon={ShieldCheck} tone="blue" />
      <h2 className="mt-5 text-2xl font-black">Why Build a Rental Passport?</h2>
      <CheckList items={['Apply to multiple places without re-filling applications.', 'Verified information builds trust and saves time.', 'Higher chances of approval with a complete profile.', 'You control what you share and with whom.']} />
      <a className="mt-5 inline-flex items-center gap-2 font-bold text-blue-700">Learn more <ArrowRight className="h-4 w-4" /></a>
    </Card>
  );
}

function AcceptedSources() {
  return (
    <Card className="mt-4 p-5">
      <h3 className="font-black">Accepted Sources</h3>
      <div className="mt-4 grid gap-3 text-center font-black md:grid-cols-4">
        <div className="brand red">EQUIFAX</div>
        <div className="brand cyan">TransUnion</div>
        <div className="brand purple">Experian</div>
        <div className="brand indigo">Borrowell</div>
      </div>
    </Card>
  );
}

function Timeline() {
  const rows = [
    ['May 2023 - Present', '123 Maple St, Toronto, ON', 'Greenview Property Management', '$2,150'],
    ['Jan 2021 - Apr 2023', '45 Oak Ave, Toronto, ON', 'Oak Residential Group', '$1,950'],
  ];
  return (
    <div className="mt-5 space-y-5">
      {rows.map(([date, address, landlord, rent]) => (
        <div key={address} className="grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-[160px_1fr_140px]">
          <strong>{date}</strong>
          <div>
            <strong>{address}</strong>
            <p className="mt-1 text-slate-700">Landlord: {landlord}</p>
            <p className="text-slate-700">Monthly Rent: {rent}</p>
            <div className="mt-3 flex flex-wrap gap-2"><Badge tone="green">On-time payments: 100%</Badge><Badge tone="green">No late payments</Badge><Badge tone="green">No lease violations</Badge></div>
          </div>
          <div className="font-bold text-emerald-700"><CheckCircle2 className="mb-1 h-5 w-5" />Verified<br /><span className="text-sm text-slate-600">May 29, 2025</span></div>
        </div>
      ))}
    </div>
  );
}

function Documents() {
  return (
    <Card className="mt-6 p-6">
      <h2 className="text-xl font-black">Private Source Records</h2>
      <p className="mt-2 text-slate-700">These records were used for verification but are not automatically downloadable by landlords.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        {['Lease reviewed', 'Payment history reviewed', 'Pay stub reviewed', 'Employment letter reviewed'].map((doc) => (
          <div key={doc} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex h-28 items-center justify-center rounded-lg bg-slate-50 text-slate-400"><FileLock2 className="h-10 w-10" /></div>
            <strong className="mt-3 block">{doc}</strong>
            <span className="text-sm text-slate-600">Stored privately</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Score({ bureau, score }: { bureau: string; score: string }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-black ${bureau === 'EQUIFAX' ? 'text-red-700' : 'text-cyan-600'}`}>{bureau}</div>
      <div className="mt-4 text-6xl font-black text-emerald-700">{score}</div>
      <div className="mt-2 text-xl font-black text-emerald-700">Good</div>
      <p className="mt-3 text-slate-700">Pulled: May 29, 2025</p>
    </div>
  );
}

function Setting({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return <div className="rounded-xl border border-slate-200 p-4"><Icon className="h-6 w-6 text-blue-700" /><strong className="mt-3 block">{title}</strong><p className="mt-1 text-sm text-slate-600">{text}</p></div>;
}

function UploadBox() {
  return <button className="rounded-xl border border-dashed border-blue-500 px-5 py-4 text-center font-bold text-blue-700 hover:bg-blue-50"><UploadCloud className="mx-auto mb-2 h-7 w-7" />Upload File<span className="block text-xs font-medium text-slate-600">or drag and drop</span></button>;
}

function Notice({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5"><div className="flex gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white"><CheckCircle2 className="h-5 w-5" /></span><div><strong className="text-lg text-emerald-800">{title}</strong><p className="mt-1 text-slate-700">{text}</p></div></div></div>;
}

function TrustBanner({ className = '' }: { className?: string }) {
  return <div className={`rounded-xl border border-blue-200 bg-blue-50 p-5 ${className}`}><div className="flex items-center gap-4"><IconBubble icon={Lock} tone="blue" /><div><strong className="block text-lg">Secure. Private. Verified.</strong><p className="text-slate-700">Documents stay inside Rental Passport. Landlords receive verified summaries and trust signals, not automatic access to raw files.</p></div></div></div>;
}

function Rows({ rows }: { rows: { label: string; value: string }[] }) {
  return <div className="mt-5 divide-y divide-slate-200">{rows.map((row) => <div key={row.label} className="flex items-center justify-between gap-4 py-3"><span className="text-slate-600">{row.label}</span><strong className="text-right">{row.value}</strong></div>)}</div>;
}

function CheckList({ items }: { items: string[] }) {
  return <ul className="mt-4 space-y-3">{items.map((item) => <li key={item} className="flex gap-3 text-slate-700"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> <span>{item}</span></li>)}</ul>;
}

function ProgressItem({ label, done = false }: { label: string; done?: boolean }) {
  return <div className="flex items-center gap-2 text-sm text-slate-700"><span className={`flex h-5 w-5 items-center justify-center rounded-full border ${done ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'}`}>{done && <Check className="h-3 w-3" />}</span><span>{label}</span></div>;
}

function Stat({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string; sub: string }) {
  return <div className="text-center"><Icon className="mx-auto h-7 w-7 text-emerald-700" /><div className="mt-2 text-xs font-black uppercase tracking-wide text-navy">{label}</div><div className="mt-2 text-3xl font-black text-emerald-700">{value}</div><div className="text-sm text-slate-600">{sub}</div></div>;
}

function Inline({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return <div className="flex items-center gap-2"><Icon className="h-5 w-5 text-navy" /> {children}</div>;
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button className="mb-5 inline-flex items-center gap-2 font-semibold text-blue-700" onClick={onClick}><ArrowLeft className="h-4 w-4" /> {label}</button>;
}

function HeroIcon({ icon: Icon, tone }: { icon: LucideIcon; tone: string }) {
  return <span className={`icon-hero ${toneClass[tone]}`}><Icon /></span>;
}

function IconBubble({ icon: Icon, tone }: { icon: LucideIcon; tone: string }) {
  return <span className={`icon-bubble ${toneClass[tone]}`}><Icon /></span>;
}

function VerifiedBadge({ label = 'Verified', className = '' }: { label?: string; className?: string }) {
  return <span className={`inline-flex w-fit items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-800 ${className}`}><Check className="h-3 w-3" />{label}</span>;
}

function Badge({ children, tone = 'green' }: { children: React.ReactNode; tone?: string }) {
  const tones: Record<string, string> = { green: 'bg-emerald-100 text-emerald-800', blue: 'bg-blue-100 text-blue-800', orange: 'bg-orange-100 text-orange-800', slate: 'bg-slate-100 text-slate-700', purple: 'bg-violet-100 text-violet-800' };
  return <span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-black ${tones[tone] ?? tones.green}`}>{children}</span>;
}

function Avatar() {
  return <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-black text-blue-700">{applicant.initials}</span>;
}

function Button({ children, icon: Icon, primary = false, className = '', onClick }: { children?: React.ReactNode; icon?: LucideIcon; primary?: boolean; className?: string; onClick?: () => void }) {
  return <button onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-black transition ${primary ? 'bg-blue-600 text-white shadow-soft hover:bg-blue-700' : 'border border-slate-200 bg-white text-navy hover:border-blue-300 hover:bg-blue-50'} ${className}`}>{Icon && <Icon className="h-5 w-5" />}{children}</button>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function nextTenantView(page: SectionKey): View {
  const order: SectionKey[] = ['rental', 'employment', 'references', 'credit', 'identity'];
  const next = order[order.indexOf(page) + 1];
  return next ? sections.find((section) => section.key === next)!.tenant : 'tenant-share';
}
