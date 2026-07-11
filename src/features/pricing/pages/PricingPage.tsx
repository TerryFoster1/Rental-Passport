import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  badge?: string;
  featured?: boolean;
};

const plans: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started.',
    cta: 'Create Free Passport',
    features: [
      'Create your Rental Passport',
      'Upload documents',
      'Store documents securely',
      'Share your passport with landlords',
      'Update your information anytime',
    ],
  },
  {
    name: 'Verified Passport',
    price: '$29 CAD',
    description: 'Everything in Free, plus:',
    cta: 'Get Verified',
    badge: 'Most Popular',
    featured: true,
    features: [
      'Identity verified',
      'Employment verified',
      'Rental history verified',
      'References verified',
      'Verification certificate',
      'Trusted verification badges',
      'Priority passport sharing',
    ],
  },
  {
    name: 'Verified Passport + Credit Report',
    price: '$45 CAD',
    description: 'Everything in Verified, plus:',
    cta: 'Get Verified + Credit',
    badge: 'Best Value',
    features: [
      'Credit report included',
      'Credit report verified',
      'Credit summary shared with landlords',
      'No need to purchase a separate credit report',
      'Best value for active renters',
    ],
  },
];

const comparisonRows = [
  { label: 'Create Passport', values: ['Included', 'Included', 'Included'] },
  { label: 'Secure Document Storage', values: ['Included', 'Included', 'Included'] },
  { label: 'Share Unlimited Applications', values: ['Included', 'Included', 'Included'] },
  { label: 'Identity Verification', values: ['-', 'Included', 'Included'] },
  { label: 'Employment Verification', values: ['-', 'Included', 'Included'] },
  { label: 'Rental History Verification', values: ['-', 'Included', 'Included'] },
  { label: 'Reference Verification', values: ['-', 'Included', 'Included'] },
  { label: 'Verification Certificate', values: ['-', 'Included', 'Included'] },
  { label: 'Credit Report Included', values: ['-', '-', 'Included'] },
  { label: 'Credit Report Verified', values: ['-', '-', 'Included'] },
  { label: 'Recommended For', values: ['Starting your profile', 'Most renters', 'Active renters'] },
];

const faqs = [
  {
    question: 'How long is my passport valid?',
    answer:
      'Verified passport details are valid until their expiry date. Renewal options are available when the passport expires.',
  },
  {
    question: 'Can I update my information later?',
    answer:
      'Yes. You can update your Rental Passport when your details, documents, or rental situation changes.',
  },
  {
    question: 'Can I share it with multiple landlords?',
    answer:
      'Yes. You can share your passport with multiple landlords and keep control over access.',
  },
  {
    question: 'Can landlords download my sensitive documents?',
    answer:
      'No. Landlords review a trusted summary and verification status. Sensitive source documents stay protected.',
  },
  {
    question: 'Do landlords see my full credit report?',
    answer:
      'No. Landlords see a credit summary and verification status, not your full credit report.',
  },
  {
    question: 'What happens when my passport expires?',
    answer:
      'You can keep your information stored and update it. Renewal options are available when the passport expires.',
  },
];

export function PricingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-5 py-16 text-center lg:px-8 lg:py-20">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
          Tenant pricing
        </p>
        <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black tracking-tight text-navy md:text-6xl">
          Fill out your last rental application.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-700">
          Create your Rental Passport once, share it anywhere, and never fill out another rental
          application again.
        </p>
        <div className="mt-8">
          <Button variant="primary" className="px-6 py-3" onClick={() => onNavigate('/sign-up')}>
            Create Free Passport
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-14 lg:grid-cols-3 lg:px-8">
        {plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} onNavigate={onNavigate} />
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-2xl font-black">Compare plans</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Free to start. A simple one-time verification when you need more trust.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-navy">
                  <th className="px-6 py-4 font-black">Feature</th>
                  <th className="px-6 py-4 font-black">Free</th>
                  <th className="px-6 py-4 font-black">Verified</th>
                  <th className="px-6 py-4 font-black">Verified + Credit</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label} className="border-b border-slate-100 last:border-0">
                    <th className="px-6 py-4 font-semibold text-slate-800">{row.label}</th>
                    {row.values.map((value, index) => (
                      <td key={`${row.label}-${index}`} className="px-6 py-4 text-slate-700">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-20 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight">Questions renters ask</h2>
          <p className="mt-3 text-slate-700">Short answers, no fine print maze.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <Card key={item.question} className="p-5">
              <h3 className="font-black">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.answer}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

function PlanCard({ plan, onNavigate }: { plan: Plan; onNavigate: (path: string) => void }) {
  return (
    <Card
      className={`relative flex h-full flex-col p-6 ${plan.featured ? 'border-blue-500 shadow-soft ring-1 ring-blue-200' : ''}`}
    >
      {plan.badge && (
        <span className="absolute right-5 top-5 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
          {plan.badge}
        </span>
      )}
      <div className="pr-28">
        <h2 className="text-2xl font-black">{plan.name}</h2>
        <p className="mt-4 text-4xl font-black tracking-tight text-navy">{plan.price}</p>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-700">{plan.description}</p>
      <div className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <div
            key={feature}
            className="flex items-start gap-3 text-sm font-semibold text-slate-700"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
      <Button
        className="mt-8 w-full"
        variant={plan.featured ? 'primary' : 'secondary'}
        onClick={() => onNavigate('/sign-up')}
      >
        {plan.cta}
      </Button>
    </Card>
  );
}
