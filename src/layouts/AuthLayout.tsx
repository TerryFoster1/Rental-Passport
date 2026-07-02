import { ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function AuthLayout({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-1px)] max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[1fr_460px] lg:items-center lg:px-8">
      <section>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-soft">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <span className="text-2xl font-black tracking-tight">
            Rental Passport<span className="text-blue-600">.io</span>
          </span>
        </div>
        <h1 className="mt-10 max-w-xl text-5xl font-black tracking-tight">Fill it out once. Apply anywhere. Protect your information.</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">Your account is the secure foundation for a verified Rental Passport. Phase 1 only creates account, profile, role, consent, and audit infrastructure.</p>
      </section>
      <Card className="p-7 shadow-soft">
        <h2 className="text-3xl font-black tracking-tight">{title}</h2>
        <p className="mt-2 text-slate-700">{description}</p>
        <div className="mt-6">{children}</div>
      </Card>
    </main>
  );
}
