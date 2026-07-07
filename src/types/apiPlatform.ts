import type { UserRole } from '@/types/database';

export type ApiVersion = 'v1';

export type ApiAuthMode = 'anonymous' | 'jwt' | 'api_key' | 'oauth_client' | 'internal';

export type ApiRateLimitTier = 'anonymous' | 'authenticated' | 'partner' | 'enterprise' | 'internal';

export type ApiScope =
  | 'auth:read'
  | 'users:read'
  | 'passports:read'
  | 'passports:write'
  | 'verification:read'
  | 'shares:read'
  | 'shares:write'
  | 'applications:read'
  | 'applications:write'
  | 'documents:read'
  | 'notifications:write'
  | 'consent:read'
  | 'activity:read'
  | 'audit:read'
  | 'admin:read'
  | 'developer:manage'
  | 'partner:read'
  | 'partner:write'
  | 'webhooks:manage';

export type ApiEndpointDefinition = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  resource: string;
  purpose: string;
  auth: ApiAuthMode;
  requiredScopes: ApiScope[];
  allowedRoles: UserRole[];
  rateLimitTier: ApiRateLimitTier;
  inputs: string[];
  outputs: string[];
  errors: string[];
  futureExpansion: string;
};

export type ApiRequestContext = {
  requestId: string;
  version: ApiVersion;
  authMode: ApiAuthMode;
  actorUserId: string | null;
  clientId: string | null;
  scopes: ApiScope[];
  roles: UserRole[];
  rateLimitTier: ApiRateLimitTier;
};

export type ApiResponseEnvelope<T> = {
  data: T | null;
  error: {
    code: string;
    message: string;
    requestId: string;
  } | null;
  meta: {
    version: ApiVersion;
    requestId: string;
  };
};

export type WebhookEventName =
  | 'passport.created'
  | 'passport.updated'
  | 'passport.verified'
  | 'passport.shared'
  | 'application.submitted'
  | 'application.viewed'
  | 'application.accepted'
  | 'application.rejected'
  | 'verification.requested'
  | 'verification.completed'
  | 'verification.expired'
  | 'document.uploaded'
  | 'document.deleted'
  | 'user.deleted'
  | 'consent.updated';

export type IntegrationProviderKey =
  | 'rental_district'
  | 'singlekey'
  | 'frontlobby'
  | 'openroom'
  | 'stripe'
  | 'resend'
  | 'twilio'
  | 'google'
  | 'docusign'
  | 'future_identity_provider'
  | 'future_payment_provider'
  | 'future_escrow_provider';

export type IntegrationProviderDefinition = {
  key: IntegrationProviderKey;
  displayName: string;
  category: 'internal_platform' | 'verification' | 'payments' | 'email' | 'messaging' | 'identity' | 'documents' | 'future';
  status: 'planned' | 'foundation_ready' | 'future';
  supportedEvents: WebhookEventName[];
  notes: string;
};
