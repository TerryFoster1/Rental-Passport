import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PublicLayout({ children, onNavigate }: { children: React.ReactNode; onNavigate: (path: string) => void }) {
  return (
    <div className="min-h-screen bg-[#f8fbff] text-navy">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button className="flex items-center gap-3 text-left" onClick={() => onNavigate('/')}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-soft">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <span className="text-xl font-black tracking-tight">
              Rental Passport<span className="text-blue-600">.io</span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onNavigate('/sign-in')}>Sign In</Button>
            <Button variant="primary" onClick={() => onNavigate('/sign-up')}>Create Account</Button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
