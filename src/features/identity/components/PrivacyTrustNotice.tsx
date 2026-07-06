import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function PrivacyTrustNotice() {
  return (
    <Card className="p-6">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-black">Private by default</h2>
          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
            <p>Your ID is reviewed securely and is not shared with landlords by default.</p>
            <p>Landlords see that your identity was verified, not your full ID document.</p>
            <p className="flex items-center gap-2 font-semibold text-navy"><LockKeyhole className="h-4 w-4 text-blue-700" />Your documents remain protected inside Rental Passport.</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
