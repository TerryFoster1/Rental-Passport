import { ShieldCheck } from 'lucide-react';

export function TrustBanner() {
  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-black">You control your Rental Passport</h2>
          <p className="mt-1 text-sm leading-6 text-slate-700">This dashboard tracks completion and verification readiness. Sharing, review, and deep verification workflows are intentionally reserved for future phases.</p>
        </div>
      </div>
    </section>
  );
}
