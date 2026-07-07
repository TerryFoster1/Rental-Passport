import type { ApiEndpointDefinition, ApiRequestContext, ApiResponseEnvelope, ApiScope } from '@/types/apiPlatform';

export function createApiRequestContext(partial: Partial<ApiRequestContext> = {}): ApiRequestContext {
  return {
    requestId: partial.requestId ?? crypto.randomUUID(),
    version: partial.version ?? 'v1',
    authMode: partial.authMode ?? 'anonymous',
    actorUserId: partial.actorUserId ?? null,
    clientId: partial.clientId ?? null,
    scopes: partial.scopes ?? [],
    roles: partial.roles ?? [],
    rateLimitTier: partial.rateLimitTier ?? 'anonymous',
  };
}

export function hasRequiredScopes(context: ApiRequestContext, requiredScopes: ApiScope[]) {
  return requiredScopes.every((scope) => context.scopes.includes(scope));
}

export function hasAllowedRole(context: ApiRequestContext, endpoint: ApiEndpointDefinition) {
  return endpoint.allowedRoles.length === 0 || endpoint.allowedRoles.some((role) => context.roles.includes(role));
}

export function authorizeApiRequest(context: ApiRequestContext, endpoint: ApiEndpointDefinition): ApiResponseEnvelope<{ authorized: true }> {
  if (endpoint.auth !== 'anonymous' && context.authMode === 'anonymous') {
    return apiError(context, 'unauthorized', 'Authentication is required for this endpoint.');
  }

  if (!hasRequiredScopes(context, endpoint.requiredScopes)) {
    return apiError(context, 'forbidden_scope', 'The API client does not have the required scope.');
  }

  if (!hasAllowedRole(context, endpoint)) {
    return apiError(context, 'forbidden_role', 'The authenticated actor does not have permission for this endpoint.');
  }

  return apiOk(context, { authorized: true });
}

export function apiOk<T>(context: ApiRequestContext, data: T): ApiResponseEnvelope<T> {
  return {
    data,
    error: null,
    meta: {
      version: context.version,
      requestId: context.requestId,
    },
  };
}

export function apiError<T = never>(context: ApiRequestContext, code: string, message: string): ApiResponseEnvelope<T> {
  return {
    data: null,
    error: {
      code,
      message,
      requestId: context.requestId,
    },
    meta: {
      version: context.version,
      requestId: context.requestId,
    },
  };
}

export function rateLimitKey(context: ApiRequestContext) {
  return `${context.rateLimitTier}:${context.clientId ?? context.actorUserId ?? 'anonymous'}`;
}
