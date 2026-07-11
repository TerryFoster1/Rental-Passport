import { Search, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { landlordReviewUpsells } from '@/services/landlordUpsellService';

const icons = {
  'ontario-ltb-records': Search,
  'ai-fraud-review': ShieldAlert,
};

export function LandlordReviewUpsells() {
  return (
    <section className="mt-6">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
        Landlord-only review tools
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {landlordReviewUpsells.map((upsell) => {
          const Icon = icons[upsell.key as keyof typeof icons];
          return (
            <Card key={upsell.key} className="p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-600">{upsell.eyebrow}</p>
                  <h3 className="mt-1 text-xl font-black">{upsell.title}</h3>
                  {upsell.provider && (
                    <p className="mt-1 text-sm font-semibold text-blue-700">{upsell.provider}</p>
                  )}
                  <p className="mt-3 text-sm text-slate-600">{upsell.pricingLabel}</p>
                </div>
              </div>
              <Button className="mt-5 w-full">{upsell.cta}</Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
