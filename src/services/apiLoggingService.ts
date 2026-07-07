import type { ApiRequestContext } from '@/types/apiPlatform';

export type ApiLogEventType =
  | 'authentication'
  | 'error'
  | 'partner_call'
  | 'failed_authorization'
  | 'token_created'
  | 'token_refreshed'
  | 'token_revoked'
  | 'webhook_event'
  | 'rate_limited'
  | 'audit';

export function createApiLogRecord(context: ApiRequestContext, eventType: ApiLogEventType, description: string) {
  return {
    id: crypto.randomUUID(),
    requestId: context.requestId,
    actorUserId: context.actorUserId,
    clientId: context.clientId,
    eventType,
    description,
    createdAt: new Date().toISOString(),
  };
}
