import type { IntegrationProviderDefinition } from '@/types/apiPlatform';

export const integrationProviders: IntegrationProviderDefinition[] = [
  {
    key: 'rental_district',
    displayName: 'Rental District',
    category: 'internal_platform',
    status: 'foundation_ready',
    supportedEvents: ['application.accepted', 'passport.shared'],
    notes: 'Future handoff from accepted Rental Passport application into lease and tenant onboarding workflows.',
  },
  { key: 'singlekey', displayName: 'SingleKey', category: 'verification', status: 'planned', supportedEvents: ['verification.requested', 'verification.completed'], notes: 'Future screening and credit verification provider.' },
  { key: 'frontlobby', displayName: 'FrontLobby', category: 'verification', status: 'planned', supportedEvents: ['verification.requested', 'verification.completed'], notes: 'Future credit and rental reporting provider.' },
  { key: 'openroom', displayName: 'OpenRoom', category: 'verification', status: 'future', supportedEvents: [], notes: 'Future checks are not part of MVP verification.' },
  { key: 'stripe', displayName: 'Stripe', category: 'payments', status: 'planned', supportedEvents: [], notes: 'Future verification fees, subscriptions, and billing.' },
  { key: 'resend', displayName: 'Resend', category: 'email', status: 'planned', supportedEvents: ['passport.shared', 'verification.requested'], notes: 'Transactional email infrastructure.' },
  { key: 'twilio', displayName: 'Twilio', category: 'messaging', status: 'future', supportedEvents: [], notes: 'Future phone verification and messaging workflows.' },
  { key: 'google', displayName: 'Google', category: 'identity', status: 'planned', supportedEvents: [], notes: 'OAuth sign-in and future Maps integrations.' },
  { key: 'docusign', displayName: 'DocuSign', category: 'documents', status: 'future', supportedEvents: [], notes: 'Future signed lease document integrations.' },
  { key: 'future_identity_provider', displayName: 'Future Identity Provider', category: 'identity', status: 'future', supportedEvents: ['verification.requested', 'verification.completed'], notes: 'Provider abstraction for future identity verification.' },
  { key: 'future_payment_provider', displayName: 'Future Payment Provider', category: 'payments', status: 'future', supportedEvents: [], notes: 'Provider abstraction for future payment rails.' },
  { key: 'future_escrow_provider', displayName: 'Future Escrow Provider', category: 'future', status: 'future', supportedEvents: [], notes: 'Legal-review-required escrow architecture placeholder.' },
];

export function getIntegrationProvider(key: IntegrationProviderDefinition['key']) {
  return integrationProviders.find((provider) => provider.key === key) ?? null;
}
