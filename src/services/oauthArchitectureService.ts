export const oauthFoundation = {
  authorizationEndpoint: '/oauth/authorize',
  tokenEndpoint: '/oauth/token',
  revocationEndpoint: '/oauth/revoke',
  introspectionEndpoint: '/oauth/introspect',
  supportedGrantTypes: ['authorization_code', 'refresh_token'],
  plannedScopes: ['passports:read', 'shares:write', 'applications:write', 'verification:read', 'webhooks:manage'],
  status: 'architecture_only',
};

export function describeApplyWithRentalPassportFlow() {
  return [
    'Partner redirects user to Apply with RentalPassport.io.',
    'User authenticates with Rental Passport.',
    'User selects passport and approves specific fields.',
    'Partner receives a secure authorization code.',
    'Partner exchanges code for scoped access token.',
    'Partner retrieves permitted application data.',
    'Rental Passport logs access and emits future webhook events.',
  ];
}
