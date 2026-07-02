import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ToastProvider } from '@/components/feedback/Toast';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { AuthCallbackPage, ForgotPasswordPage, ResetPasswordPage, SignInPage, SignUpPage, VerifyEmailPage } from '@/features/auth/AuthPages';
import { ProfilePage } from '@/features/profile/ProfilePage';
import {
  PassportActivityPage,
  PassportOverviewPage,
  PassportPreviewPage,
  PassportSectionPlaceholderPage,
  PassportSettingsPage,
  TenantDashboardPage,
} from '@/features/passport/pages/PassportPages';
import { AppShell } from '@/layouts/AppShell';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { env } from '@/lib/env';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';

const authRoutes = new Set(['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/verify-email', '/auth/callback']);
const publicRoutes = new Set(['/', '/privacy', '/terms', '/contact', '/faq']);
const protectedRoutes = new Set([
  '/app',
  '/dashboard',
  '/profile',
  '/onboarding/profile',
  '/landlord',
  '/passport',
  '/passport/preview',
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
        {pathname !== '/' && <PublicInfoPage path={pathname} />}
      </PublicLayout>
    );
  }

  if (protectedRoutes.has(pathname)) {
    return <ProtectedApp pathname={pathname} onNavigate={navigate} />;
  }

  return (
    <PublicLayout onNavigate={navigate}>
      <EmptyState title="Page not found" description="The requested page is not available in this application foundation." action={<Button onClick={() => navigate('/')}>Go Home</Button>} />
    </PublicLayout>
  );
}

function ProtectedApp({ pathname, onNavigate }: { pathname: string; onNavigate: (path: string) => void }) {
  const auth = useAuth();

  if (!auth.user) {
    return (
      <AuthLayout title="Sign in required" description="Use your account credentials to continue to the protected application shell.">
        <SignInPage onNavigate={onNavigate} />
      </AuthLayout>
    );
  }

  if (!auth.isEmailVerified && pathname !== '/verify-email') {
    return (
      <AuthLayout title="Verify your email" description="Email verification is required before accessing account onboarding.">
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

  if (pathname.startsWith('/passport') || pathname === '/dashboard' || pathname === '/app') {
    return (
      <AppShell onNavigate={onNavigate}>
        <TenantPassportRoute pathname={pathname} onNavigate={onNavigate} />
      </AppShell>
    );
  }

  if (pathname === '/landlord') {
    return (
      <AppShell mode="landlord" onNavigate={onNavigate}>
        <RoleGate allowed={['landlord', 'property_manager']} fallback={<UnauthorizedWorkspace />}>
          <LandlordFoundation />
        </RoleGate>
      </AppShell>
    );
  }

  return null;
}

function TenantPassportRoute({ pathname, onNavigate }: { pathname: string; onNavigate: (path: string) => void }) {
  if (pathname === '/app' || pathname === '/dashboard') return <TenantDashboardPage onNavigate={onNavigate} />;
  if (pathname === '/passport') return <PassportOverviewPage onNavigate={onNavigate} />;
  if (pathname === '/passport/preview') return <PassportPreviewPage onNavigate={onNavigate} />;
  if (pathname === '/passport/activity') return <PassportActivityPage onNavigate={onNavigate} />;
  if (pathname === '/passport/settings') return <PassportSettingsPage onNavigate={onNavigate} />;
  if (pathname === '/passport/rental-history') return <PassportSectionPlaceholderPage sectionKey="rental_history" onNavigate={onNavigate} />;
  if (pathname === '/passport/employment') return <PassportSectionPlaceholderPage sectionKey="employment" onNavigate={onNavigate} />;
  if (pathname === '/passport/references') return <PassportSectionPlaceholderPage sectionKey="references" onNavigate={onNavigate} />;
  if (pathname === '/passport/credit-report') return <PassportSectionPlaceholderPage sectionKey="credit_report" onNavigate={onNavigate} />;
  if (pathname === '/passport/identity') return <PassportSectionPlaceholderPage sectionKey="identity_confirmation" onNavigate={onNavigate} />;
  return <TenantDashboardPage onNavigate={onNavigate} />;
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

function RoleGate({ allowed, children, fallback }: { allowed: string[]; children: ReactNode; fallback: ReactNode }) {
  const { roles } = useAuth();
  const hasAccess = useMemo(() => roles.some((role) => allowed.includes(role)), [allowed, roles]);
  return hasAccess ? <>{children}</> : <>{fallback}</>;
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

function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[1fr_380px] lg:px-8">
        <div>
          <StatusBadge status="Production foundation" />
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-navy md:text-6xl">Rental Passport</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            A secure identity foundation for renters, landlords, and future rental platform integrations. Phase 1 establishes account access, trust states, and profile ownership.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => onNavigate('/sign-up')}>Create Account</Button>
            <Button onClick={() => onNavigate('/sign-in')}>Sign In</Button>
          </div>
        </div>
        <Card className="p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-black">Security-first platform layer</h2>
          <p className="mt-3 text-slate-700">The web app is the first client on top of an API-first architecture. Passport data, sharing, and verification workflows begin in later phases.</p>
          <div className="mt-6 space-y-3">
            <TrustRow label="Email/password authentication" />
            <TrustRow label="Google OAuth ready" />
            <TrustRow label="Profile and consent foundation" />
          </div>
        </Card>
      </section>
    </main>
  );
}

function LandlordFoundation() {
  return (
    <PageContainer>
      <PageHeader title="Landlord workspace foundation" description="This protected layout exists for future role-based workflows. Reviewer portals and dashboards are not implemented in Phase 1." />
      <EmptyState title="No landlord features yet" description="Role routing is active. Application review, passport intake, and decision workflows begin in later phases." />
    </PageContainer>
  );
}

function UnauthorizedWorkspace() {
  return (
    <PageContainer>
      <EmptyState title="Role access required" description="This area is reserved for landlord and property manager roles." />
    </PageContainer>
  );
}

function PublicInfoPage({ path }: { path: string }) {
  const title = path === '/privacy' ? 'Privacy' : path === '/terms' ? 'Terms' : path === '/faq' ? 'FAQ' : 'Contact';
  return (
    <PageContainer>
      <PageHeader title={title} description={`${env.appName} public policy and support content will be maintained through the documentation-backed content process.`} />
      <Alert tone="info">This placeholder keeps public routing stable without introducing business workflows before their implementation phase.</Alert>
    </PageContainer>
  );
}

function TrustRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
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
