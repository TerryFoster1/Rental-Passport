export type LandlordReviewUpsell = {
  key: string;
  eyebrow: string;
  title: string;
  provider?: string;
  pricingLabel: string;
  cta: string;
};

export const landlordReviewUpsells: LandlordReviewUpsell[] = [
  {
    key: 'ontario-ltb-records',
    eyebrow: 'Need more confidence?',
    title: 'Search Ontario LTB Records',
    provider: 'Powered by OpenRoom',
    pricingLabel: 'One-time fee',
    cta: 'View Results',
  },
  {
    key: 'ai-fraud-review',
    eyebrow: 'Need deeper document verification?',
    title: 'AI Fraud Review',
    pricingLabel: 'One-time fee',
    cta: 'Run Analysis',
  },
];
