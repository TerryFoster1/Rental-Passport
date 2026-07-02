import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthLayout } from '@/layouts/AuthLayout';
import { useAuth } from './AuthProvider';

export function SignInPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const { error: authError } = await auth.signInWithPassword(email, password);
    if (authError) {
      setError(authError.message);
      return;
    }
    onNavigate('/app');
  };

  return (
    <AuthLayout title="Sign in" description="Access your secure Rental Passport account.">
      {!auth.isConfigured && <Alert tone="error" title="Supabase not configured">Add Supabase environment variables before using authentication.</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <Button variant="primary" type="submit" className="w-full" disabled={!auth.isConfigured}>Sign In</Button>
      </form>
      <Button variant="secondary" className="mt-3 w-full" onClick={() => auth.signInWithGoogle()} disabled={!auth.isConfigured}>
        Continue with Google
      </Button>
      <div className="mt-5 flex justify-between text-sm font-semibold">
        <button className="text-blue-700" onClick={() => onNavigate('/forgot-password')}>Forgot password?</button>
        <button className="text-blue-700" onClick={() => onNavigate('/sign-up')}>Create account</button>
      </div>
    </AuthLayout>
  );
}

export function SignUpPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    const { error: authError } = await auth.signUpWithPassword(email, password);
    if (authError) {
      setError(authError.message);
      return;
    }
    setMessage('Check your email to verify your account before continuing.');
  };

  return (
    <AuthLayout title="Create account" description="Start with secure account access. Passport features begin in later phases.">
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Input label="Password" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
        <Button variant="primary" type="submit" className="w-full" disabled={!auth.isConfigured}>Create Account</Button>
      </form>
      <Button variant="secondary" className="mt-3 w-full" onClick={() => auth.signInWithGoogle()} disabled={!auth.isConfigured}>
        Continue with Google
      </Button>
      <p className="mt-4 text-sm text-slate-600">Email/password accounts must verify email before continuing. Google users still complete required onboarding.</p>
      <button className="mt-4 text-sm font-bold text-blue-700" onClick={() => onNavigate('/sign-in')}>Already have an account?</button>
    </AuthLayout>
  );
}

export function ForgotPasswordPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    const { error: authError } = await auth.sendPasswordReset(email);
    if (authError) {
      setError(authError.message);
      return;
    }
    setMessage('Password reset instructions sent.');
  };

  return (
    <AuthLayout title="Reset access" description="Send a secure password reset email.">
      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Button variant="primary" type="submit" className="w-full" disabled={!auth.isConfigured}>Send Reset Email</Button>
      </form>
      <button className="mt-4 text-sm font-bold text-blue-700" onClick={() => onNavigate('/sign-in')}>Back to sign in</button>
    </AuthLayout>
  );
}

export function ResetPasswordPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const auth = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const { error: authError } = await auth.updatePassword(password);
    if (authError) {
      setError(authError.message);
      return;
    }
    onNavigate('/app');
  };

  return (
    <AuthLayout title="Choose a new password" description="Create a strong password for your secure account.">
      {error && <Alert tone="error">{error}</Alert>}
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <Input label="New password" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
        <Button variant="primary" type="submit" className="w-full" disabled={!auth.isConfigured}>Update Password</Button>
      </form>
    </AuthLayout>
  );
}

export function VerifyEmailPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { isEmailVerified, user } = useAuth();
  return (
    <AuthLayout title="Verify your email" description="Email verification is the first trust layer for your account.">
      <Alert tone={isEmailVerified ? 'success' : 'info'} title={isEmailVerified ? 'Email verified' : 'Check your inbox'}>
        {isEmailVerified ? 'Your email is verified. Continue to onboarding.' : 'Open the verification link sent to your email address before continuing.'}
      </Alert>
      {user?.email && <p className="mt-4 text-sm text-slate-600">Signed in as {user.email}</p>}
      <Button className="mt-5 w-full" variant="primary" onClick={() => onNavigate(isEmailVerified ? '/onboarding/profile' : '/sign-in')}>
        {isEmailVerified ? 'Continue' : 'Back to Sign In'}
      </Button>
    </AuthLayout>
  );
}

export function AuthCallbackPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <AuthLayout title="Securing your session" description="Finishing authentication with Rental Passport.">
      <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-4 font-semibold text-blue-950">
        <Link2 className="h-5 w-5" />
        Continue to finish onboarding.
      </div>
      <Button className="mt-5 w-full" variant="primary" onClick={() => onNavigate('/onboarding/profile')}>Continue</Button>
    </AuthLayout>
  );
}
