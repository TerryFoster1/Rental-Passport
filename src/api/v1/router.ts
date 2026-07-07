import { apiV1Endpoints } from '@/api/v1/endpoints';
import { apiError, apiOk, authorizeApiRequest, createApiRequestContext } from '@/api/middleware/apiSecurity';
import type { ApiEndpointDefinition, ApiResponseEnvelope } from '@/types/apiPlatform';

export function listApiV1Routes() {
  return apiV1Endpoints;
}

export function findApiV1Endpoint(method: string, path: string): ApiEndpointDefinition | null {
  return apiV1Endpoints.find((endpoint) => endpoint.method === method.toUpperCase() && matchPath(endpoint.path, path)) ?? null;
}

export function handleApiV1Request(method: string, path: string): ApiResponseEnvelope<{ endpoint: ApiEndpointDefinition; status: 'documented_placeholder' }> {
  const context = createApiRequestContext();
  const endpoint = findApiV1Endpoint(method, path);

  if (!endpoint) return apiError(context, 'not_found', 'No API v1 endpoint is registered for this method and path.');

  const authorization = authorizeApiRequest(context, endpoint);
  if (authorization.error && endpoint.auth !== 'anonymous') {
    return apiError(context, 'documented_placeholder', 'Endpoint is registered but production authentication is not implemented in Phase 10.');
  }

  return apiOk(context, { endpoint, status: 'documented_placeholder' });
}

function matchPath(template: string, path: string) {
  const templateParts = template.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  if (templateParts.length !== pathParts.length) return false;
  return templateParts.every((part, index) => part.startsWith(':') || part === pathParts[index]);
}
