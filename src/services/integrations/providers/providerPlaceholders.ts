import type { IntegrationProviderKey } from '@/types/apiPlatform';

export function createProviderPlaceholder(provider: IntegrationProviderKey) {
  return {
    provider,
    status: 'not_implemented',
    message: `${provider} integration is registered in the Phase 10 architecture but not connected to a live provider.`,
  };
}
