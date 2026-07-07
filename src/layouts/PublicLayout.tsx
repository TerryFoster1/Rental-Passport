import { RentalPassportLogo } from '@/components/brand/RentalPassportLogo';
import { Button } from '@/components/ui/Button';

export function PublicLayout({
  children,
  onNavigate,
}: {
  children: React.ReactNode;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="min-h-screen bg-[#f8fbff] text-navy">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button className="flex items-center text-left" onClick={() => onNavigate('/')}>
            <RentalPassportLogo className="h-12 w-auto max-w-[220px] sm:h-14" />
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onNavigate('/sign-in')}>
              Sign In
            </Button>
            <Button variant="primary" onClick={() => onNavigate('/sign-up')}>
              Create Account
            </Button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
