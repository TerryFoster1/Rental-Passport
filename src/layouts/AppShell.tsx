import type { ReactNode } from 'react';
import { FileText, LayoutDashboard, LogOut, UserCircle } from 'lucide-react';
import { RentalPassportLogo } from '@/components/brand/RentalPassportLogo';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthProvider';

export function AppShell({
  children,
  mode = 'tenant',
  onNavigate,
}: {
  children: ReactNode;
  mode?: 'tenant' | 'landlord' | 'admin';
  onNavigate: (path: string) => void;
}) {
  const { profile, signOut } = useAuth();
  const displayName =
    profile?.preferred_name ||
    [profile?.legal_first_name, profile?.legal_last_name].filter(Boolean).join(' ') ||
    profile?.email ||
    'Account';

  const handleSignOut = async () => {
    await signOut();
    onNavigate('/sign-in');
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] text-navy">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button
            className="flex items-center text-left"
            onClick={() =>
              onNavigate(
                mode === 'tenant' ? '/dashboard' : mode === 'admin' ? '/admin' : '/landlord',
              )
            }
          >
            <RentalPassportLogo className="h-12 w-auto max-w-[220px] sm:h-14" />
          </button>
          <nav className="hidden items-center gap-3 md:flex">
            <Button
              variant="ghost"
              onClick={() =>
                onNavigate(
                  mode === 'tenant' ? '/dashboard' : mode === 'admin' ? '/admin' : '/landlord',
                )
              }
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {mode === 'tenant' ? 'Dashboard' : mode === 'admin' ? 'Admin Home' : 'Landlord Home'}
            </Button>
            {mode === 'tenant' && (
              <>
                <Button variant="ghost" onClick={() => onNavigate('/passport')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Passport
                </Button>
                <Button variant="ghost" onClick={() => onNavigate('/passport/activity')}>
                  Activity
                </Button>
              </>
            )}
            {mode === 'admin' && (
              <Button variant="ghost" onClick={() => onNavigate('/admin/verifications')}>
                <FileText className="mr-2 h-4 w-4" />
                Verification Queue
              </Button>
            )}
            <Button variant="ghost" onClick={() => onNavigate('/profile')}>
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </nav>
          <div className="flex items-center gap-3">
            <Avatar name={displayName} />
            <div className="hidden text-right md:block">
              <strong className="block text-sm">{displayName}</strong>
              <span className="text-xs text-slate-500">{profile?.account_status ?? 'Loading'}</span>
            </div>
            <Button variant="ghost" onClick={handleSignOut} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
