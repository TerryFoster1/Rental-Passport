import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  FileText,
  Globe2,
  KeyRound,
  Lock,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ToastProvider } from '@/components/feedback/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  AdminDashboardPage,
  AdminGate,
  VerificationCasePage,
  VerificationQueuePage,
} from '@/features/admin/pages/AdminPages';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import {
  AuthCallbackPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  SignInPage,
  SignUpPage,
  VerifyEmailPage,
} from '@/features/auth/AuthPages';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { EmploymentPage } from '@/features/employment/pages/EmploymentPage';
import { CreditReportPage } from '@/features/creditReport/pages/CreditReportPage';
import { DeveloperPortalPage } from '@/features/developers/pages/DeveloperPortalPage';
import { IdentityPage } from '@/features/identity/pages/IdentityPage';
import {
  LandlordApplicationsPage,
  LandlordDetailPage,
  LandlordPassportPage,
  LandlordSecureAccessPage,
} from '@/features/landlord/pages/LandlordPages';
import { InvestorDemoPage, RentalPassportSecureViewerPage } from '@/features/demo/pages/InvestorDemoPage';
import { PricingPage } from '@/features/pricing/pages/PricingPage';
import { RentalHistoryPage } from '@/features/rentalHistory/pages/RentalHistoryPage';
import { ReferencesPage } from '@/features/references/pages/ReferencesPage';
import { TenantSharePage } from '@/features/sharing/pages/TenantSharePage';
import {
  PassportActivityPage,
  PassportOverviewPage,
  PassportPreviewPage,
  PassportSettingsPage,
  TenantDashboardPage,
} from '@/features/passport/pages/PassportPages';
import { AppShell } from '@/layouts/AppShell';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { env } from '@/lib/env';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';

const authRoutes = new Set([
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/callback',
]);
const publicRoutes = new Set([
  '/',
  '/pricing',
  '/privacy',
  '/terms',
  '/contact',
  '/demo',
  '/demo/passport-view',
  '/faq',
  '/developers',
]);
const protectedRoutes = new Set([
  '/admin',
  '/admin/verifications',
  '/app',
  '/dashboard',
  '/profile',
  '/onboarding/profile',
  '/landlord',
  '/landlord/applications',
  '/passport',
  '/passport/preview',
  '/passport/share',
  '/passport/activity',
  '/passport/settings',
  '/passport/rental-history',
  '/passport/employment',
  '/passport/references',
  '/passport/credit-report',
  '/passport/identity',
]);

function getPath() {
  return window.location.pathname || '/';
}

function setRoute(path: string) {
  if (path === getPath()) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function usePathname() {
  const [pathname, setPathname] = useState(getPath);

  useEffect(() => {
    const handleChange = () => setPathname(getPath());
    window.addEventListener('popstate', handleChange);
    return () => window.removeEventListener('popstate', handleChange);
  }, []);

  return pathname;
}

function AppRoutes() {
  const pathname = usePathname();
  const auth = useAuth();
  const navigate = (path: string) => setRoute(path);

  if (auth.loading) return <LoadingScreen />;

  if (authRoutes.has(pathname)) {
    return (
      <AuthFrame path={pathname}>
        {pathname === '/sign-up' && <SignUpPage onNavigate={navigate} />}
        {pathname === '/forgot-password' && <ForgotPasswordPage onNavigate={navigate} />}
        {pathname === '/reset-password' && <ResetPasswordPage onNavigate={navigate} />}
        {pathname === '/verify-email' && <VerifyEmailPage onNavigate={navigate} />}
        {pathname === '/auth/callback' && <AuthCallbackPage onNavigate={navigate} />}
        {pathname === '/sign-in' && <SignInPage onNavigate={navigate} />}
      </AuthFrame>
    );
  }

  if (publicRoutes.has(pathname)) {
    return (
      <PublicLayout onNavigate={navigate}>
        {pathname === '/' && <LandingPage onNavigate={navigate} />}
        {pathname === '/demo' && <InvestorDemoPage />}
        {pathname === '/demo/passport-view' && <RentalPassportSecureViewerPage />}
        {pathname === '/pricing' && <PricingPage onNavigate={navigate} />}
        {pathname === '/developers' && <DeveloperPortalPage onNavigate={navigate} />}
        {pathname !== '/' && pathname !== '/demo' && pathname !== '/demo/passport-view' && pathname !== '/pricing' && pathname !== '/developers' && (
          <PublicInfoPage path={pathname} />
        )}
      </PublicLayout>
    );
  }

  if (pathname === '/landlord/secure-access') {
    return <LandlordSecureAccessPage onNavigate={navigate} />;
  }

  if (isProtectedRoute(pathname)) {
    return <ProtectedApp pathname={pathname} onNavigate={navigate} />;
  }

  return (
    <PublicLayout onNavigate={navigate}>
      <EmptyState
        title="Page not found"
        description="The requested page is not available in this application foundation."
        action={<Button onClick={() => navigate('/')}>Go Home</Button>}
      />
    </PublicLayout>
  );
}

function ProtectedApp({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: (path: string) => void;
}) {
  const auth = useAuth();

  if (!auth.user) {
    return (
      <AuthLayout
        title="Sign in required"
        description="Use your account credentials to continue to the protected application shell."
      >
        <SignInPage onNavigate={onNavigate} />
      </AuthLayout>
    );
  }

  if (!auth.isEmailVerified && pathname !== '/verify-email') {
    return (
      <AuthLayout
        title="Verify your email"
        description="Email verification is required before accessing account onboarding."
      >
        <VerifyEmailPage onNavigate={onNavigate} />
      </AuthLayout>
    );
  }

  if (!auth.profile && pathname !== '/onboarding/profile') {
    return (
      <AppShell onNavigate={onNavigate}>
        <ProfilePage onNavigate={onNavigate} onboarding />
      </AppShell>
    );
  }

  if (pathname === '/profile' || pathname === '/onboarding/profile') {
    return (
      <AppShell onNavigate={onNavigate}>
        <ProfilePage onNavigate={onNavigate} onboarding={pathname === '/onboarding/profile'} />
      </AppShell>
    );
  }

  if (pathname.startsWith('/admin')) {
    return (
      <AppShell mode="admin" onNavigate={onNavigate}>
        <AdminGate>
          <AdminRoute pathname={pathname} onNavigate={onNavigate} />
        </AdminGate>
      </AppShell>
    );
  }

  if (pathname.startsWith('/passport') || pathname === '/dashboard' || pathname === '/app') {
    return (
      <AppShell onNavigate={onNavigate}>
        <TenantPassportRoute pathname={pathname} onNavigate={onNavigate} />
      </AppShell>
    );
  }

  if (pathname.startsWith('/landlord')) {
    return (
      <AppShell mode="landlord" onNavigate={onNavigate}>
        <LandlordRoute pathname={pathname} onNavigate={onNavigate} />
      </AppShell>
    );
  }

  return null;
}

function TenantPassportRoute({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: (path: string) => void;
}) {
  if (pathname === '/app' || pathname === '/dashboard')
    return <TenantDashboardPage onNavigate={onNavigate} />;
  if (pathname === '/passport') return <PassportOverviewPage onNavigate={onNavigate} />;
  if (pathname === '/passport/preview') return <PassportPreviewPage onNavigate={onNavigate} />;
  if (pathname === '/passport/share') return <TenantSharePage onNavigate={onNavigate} />;
  if (pathname === '/passport/activity') return <PassportActivityPage onNavigate={onNavigate} />;
  if (pathname === '/passport/settings') return <PassportSettingsPage onNavigate={onNavigate} />;
  if (pathname === '/passport/rental-history') return <RentalHistoryPage onNavigate={onNavigate} />;
  if (pathname === '/passport/employment') return <EmploymentPage onNavigate={onNavigate} />;
  if (pathname === '/passport/references') return <ReferencesPage onNavigate={onNavigate} />;
  if (pathname === '/passport/credit-report') return <CreditReportPage onNavigate={onNavigate} />;
  if (pathname === '/passport/identity') return <IdentityPage onNavigate={onNavigate} />;
  return <TenantDashboardPage onNavigate={onNavigate} />;
}

function LandlordRoute({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: (path: string) => void;
}) {
  if (pathname === '/landlord' || pathname === '/landlord/applications')
    return <LandlordApplicationsPage onNavigate={onNavigate} />;

  const passportMatch = pathname.match(/^\/landlord\/applications\/([^/]+)\/passport$/);
  if (passportMatch)
    return <LandlordPassportPage applicationId={passportMatch[1]} onNavigate={onNavigate} />;

  const detailMatch = pathname.match(
    /^\/landlord\/applications\/([^/]+)\/(employment|rental-history|references|credit-report|identity)$/,
  );
  if (detailMatch) {
    const sectionMap = {
      employment: 'employment',
      'rental-history': 'rental_history',
      references: 'references',
      'credit-report': 'credit_report',
      identity: 'identity_confirmation',
    } as const;
    return (
      <LandlordDetailPage
        applicationId={detailMatch[1]}
        sectionKey={sectionMap[detailMatch[2] as keyof typeof sectionMap]}
        onNavigate={onNavigate}
      />
    );
  }

  return <LandlordApplicationsPage onNavigate={onNavigate} />;
}

function isProtectedRoute(pathname: string) {
  return (
    protectedRoutes.has(pathname) ||
    pathname.startsWith('/landlord/applications/') ||
    pathname.startsWith('/admin/verifications/')
  );
}

function AdminRoute({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: (path: string) => void;
}) {
  if (pathname === '/admin') return <AdminDashboardPage onNavigate={onNavigate} />;
  if (pathname === '/admin/verifications') return <VerificationQueuePage onNavigate={onNavigate} />;
  const caseMatch = pathname.match(/^\/admin\/verifications\/([^/]+)$/);
  if (caseMatch) return <VerificationCasePage caseId={caseMatch[1]} onNavigate={onNavigate} />;
  return <AdminDashboardPage onNavigate={onNavigate} />;
}

function AuthFrame({ path, children }: { path: string; children: ReactNode }) {
  const copy: Record<string, { title: string; description: string }> = {
    '/sign-in': {
      title: 'Sign in',
      description: 'Access your Rental Passport account foundation.',
    },
    '/sign-up': {
      title: 'Create account',
      description: 'Start with email and password or continue with Google.',
    },
    '/forgot-password': {
      title: 'Reset password',
      description: 'Request a secure password reset link.',
    },
    '/reset-password': {
      title: 'Choose a new password',
      description: 'Complete the password reset flow from your email link.',
    },
    '/verify-email': {
      title: 'Verify your email',
      description: 'Email verification is required before onboarding continues.',
    },
    '/auth/callback': {
      title: 'Finishing sign in',
      description: 'Complete the OAuth callback and continue to the app.',
    },
  };

  const selected = copy[path] ?? copy['/sign-in'];
  return (
    <AuthLayout title={selected.title} description={selected.description}>
      {children}
    </AuthLayout>
  );
}

function LoadingScreen() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <Skeleton className="h-16 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    </PageContainer>
  );
}

const homeBenefits = [
  {
    title: 'Apply Anywhere',
    copy: 'Use one reusable application across apartments, landlords, and rental sites.',
    icon: Globe2,
  },
  {
    title: 'Get Verified',
    copy: 'Add trusted badges for identity, work, rental history, references, and credit.',
    icon: BadgeCheck,
  },
  {
    title: 'Stay Secure',
    copy: 'Share summaries and verified facts without emailing sensitive files.',
    icon: Lock,
  },
  {
    title: 'Stand Out',
    copy: 'Give landlords a complete, organized application the moment you apply.',
    icon: Star,
  },
];

const homeSteps = [
  ['Create your passport', 'Add your rental details once.'],
  ['Verify your information', 'Turn documents into trusted proof.'],
  ['Share securely', 'Control who can view your passport.'],
  ['Apply anywhere', 'Send a verified application in seconds.'],
];

const renterReasons = [
  'No repetitive applications',
  'Secure document sharing',
  'Verified applications landlords trust',
  'You control your information',
  'Faster applications when a place feels right',
];

const homePlans = [
  {
    name: 'Free',
    price: '$0',
    copy: 'Create your passport and share it securely.',
    cta: 'Create Free Passport',
  },
  {
    name: 'Verified',
    price: '$29 CAD',
    copy: 'Add trusted verification badges landlords can review.',
    cta: 'Get Verified',
    badge: 'Most Popular',
  },
  {
    name: 'Verified + Credit',
    price: '$45 CAD',
    copy: 'Include a verified credit summary with your passport.',
    cta: 'Get Verified + Credit',
    badge: 'Best Value',
  },
];

function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <main className="overflow-hidden">
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1fr)] lg:px-8 lg:py-24">
        <div className="relative z-10">
          <p className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
            One application. Every rental.
          </p>
          <h1 className="mt-7 max-w-4xl text-5xl font-black tracking-tight text-navy md:text-7xl">
            Fill out your last rental application.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 md:text-xl">
            Create one secure Rental Passport, verify your information, and apply to as many
            apartments as you want without filling out the same application over and over again.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              variant="primary"
              className="px-6 py-3 text-base"
              onClick={() => onNavigate('/sign-up')}
            >
              Create Your Free Passport
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button className="px-6 py-3 text-base" onClick={() => onNavigate('/demo')}>
              See How It Works
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-sm font-bold text-slate-600">
            <TrustRow label="Free to start" />
            <TrustRow label="Renter controlled" />
            <TrustRow label="Verified when you need it" />
          </div>
        </div>
        <PassportMockup />
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 lg:grid-cols-4 lg:px-8">
        {homeBenefits.map((benefit) => (
          <Card key={benefit.title} className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <benefit.icon className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-black">{benefit.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{benefit.copy}</p>
          </Card>
        ))}
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionIntro
            eyebrow="How it works"
            title="Create it once. Reuse it everywhere."
            description="Rental Passport turns your application details and documents into a secure profile you can share when you find a place you love."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {homeSteps.map(([title, copy], index) => (
              <Card key={title} className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{copy}</p>
                <StepIllustration index={index} />
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionIntro
            eyebrow="Why renters choose it"
            title="The same application should not slow you down every time."
            description="Your Rental Passport keeps the hard parts ready, organized, and under your control."
            align="left"
          />
        </div>
        <Card className="p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            {renterReasons.map((reason) => (
              <div key={reason} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-600" />
                <span className="font-bold text-slate-800">{reason}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionIntro
            eyebrow="Simple pricing"
            title="Free to start. Verified when you are ready."
            description="$0 to build your passport. $29 to get verified. $45 to include a verified credit report."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {homePlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex h-full flex-col p-6 ${plan.badge === 'Most Popular' ? 'border-blue-500 shadow-soft ring-1 ring-blue-200' : ''}`}
              >
                {plan.badge && (
                  <span className="absolute right-5 top-5 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    {plan.badge}
                  </span>
                )}
                <h3 className="pr-24 text-2xl font-black">{plan.name}</h3>
                <p className="mt-4 text-4xl font-black tracking-tight text-navy">{plan.price}</p>
                <p className="mt-4 min-h-12 text-sm leading-6 text-slate-700">{plan.copy}</p>
                <Button
                  className="mt-7 w-full"
                  variant={plan.badge === 'Most Popular' ? 'primary' : 'secondary'}
                  onClick={() => onNavigate('/sign-up')}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="ghost" onClick={() => onNavigate('/pricing')}>
              Compare all plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-20 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <Card className="p-6 md:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-6 max-w-2xl text-3xl font-black tracking-tight md:text-5xl">
            Built for renters. Trusted by landlords.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            Landlords receive independently verified information without getting unlimited access to
            your sensitive documents.
          </p>
        </Card>
        <div className="space-y-4">
          <TrustPanel title="Verified facts" copy="Identity, employment, rental history, references, and credit summaries can be reviewed quickly." />
          <TrustPanel title="Protected documents" copy="Sensitive source files stay controlled by the renter and are not passed around by email." />
          <TrustPanel title="Faster decisions" copy="A complete passport helps landlords review applications with more confidence." />
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionIntro
            eyebrow="The future"
            title="Apply instantly from the places you already search."
            description="Rental sites can show a simple button: Apply with RentalPassport.io."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {['CityRentals', 'Maple Homes', 'Apartment Market'].map((site) => (
              <RentalSiteMockup key={site} site={site} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20 text-center lg:px-8">
        <h2 className="text-4xl font-black tracking-tight text-navy md:text-6xl">
          Stop starting from zero.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-700">
          Build your Rental Passport once and keep it ready for the next apartment.
        </p>
        <div className="mt-8">
          <Button variant="primary" className="px-6 py-3 text-base" onClick={() => onNavigate('/sign-up')}>
            Create Your Free Passport
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </main>
  );
}

function PassportMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-[48px] bg-blue-100/70 blur-3xl" />
      <Card className="relative overflow-hidden p-5 shadow-soft">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">
                Rental Passport
              </p>
              <h2 className="mt-2 text-2xl font-black text-navy">Kathryn Casey</h2>
              <p className="mt-1 text-sm text-slate-600">Verified renter profile</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              Verified
            </span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MiniStat label="Credit" value="742" />
            <MiniStat label="History" value="24+ mo" />
            <MiniStat label="Income" value="$78K" />
          </div>
          <div className="mt-6 space-y-3">
            {['Identity verified', 'Employment verified', 'Rental history verified'].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="font-bold text-slate-800">{item}</span>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <Send className="h-5 w-5 text-blue-700" />
              <p className="font-black text-blue-950">Ready to share</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-blue-900">
              Send a secure application link without retyping the same information.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-center">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-navy">{value}</p>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-navy md:text-5xl">{title}</h2>
      <p className="mt-5 text-lg leading-8 text-slate-700">{description}</p>
    </div>
  );
}

function StepIllustration({ index }: { index: number }) {
  const icons = [FileText, BadgeCheck, KeyRound, Sparkles];
  const Icon = icons[index] ?? FileText;
  return (
    <div className="mt-7 flex h-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-white">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-soft">
        <Icon className="h-7 w-7" />
      </div>
    </div>
  );
}

function TrustPanel({ title, copy }: { title: string; copy: string }) {
  return (
    <Card className="p-5">
      <div className="flex gap-4">
        <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-emerald-600" />
        <div>
          <h3 className="font-black">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-700">{copy}</p>
        </div>
      </div>
    </Card>
  );
}

function RentalSiteMockup({ site }: { site: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <p className="font-black text-slate-800">{site}</p>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">
            Listing
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="h-32 rounded-2xl bg-gradient-to-br from-blue-100 via-white to-slate-100" />
        <h3 className="mt-5 text-xl font-black">Bright one-bedroom apartment</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Verified applications accepted instantly.
        </p>
        <button className="mt-5 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white shadow-soft">
          Apply with RentalPassport.io
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

function PublicInfoPage({ path }: { path: string }) {
  const title =
    path === '/privacy'
      ? 'Privacy'
      : path === '/terms'
        ? 'Terms'
        : path === '/faq'
          ? 'FAQ'
          : 'Contact';
  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={`${env.appName} public policy and support content will be maintained through the documentation-backed content process.`}
      />
      <Alert tone="info">
        This placeholder keeps public routing stable without introducing business workflows before
        their implementation phase.
      </Alert>
    </PageContainer>
  );
}

function TrustRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      {label}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
