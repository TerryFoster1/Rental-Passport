import type { MonitoringSignal } from '@/types/launchReadiness';

export const monitoringSignals: MonitoringSignal[] = [
  { key: 'application_errors', label: 'Application errors', source: 'application', status: 'documented' },
  { key: 'performance_metrics', label: 'Performance metrics', source: 'application', status: 'documented' },
  { key: 'api_metrics', label: 'API request metrics', source: 'api', status: 'documented' },
  { key: 'auth_failures', label: 'Authentication failures', source: 'auth', status: 'documented' },
  { key: 'audit_events', label: 'Audit events', source: 'database', status: 'implemented' },
  { key: 'background_jobs', label: 'Background job monitoring', source: 'background_job', status: 'future' },
  { key: 'webhook_delivery', label: 'Webhook delivery monitoring', source: 'webhook', status: 'future' },
];

export function createMonitoringEvent(signalKey: string, description: string) {
  return {
    id: crypto.randomUUID(),
    signalKey,
    description,
    createdAt: new Date().toISOString(),
    status: 'not_sent',
  };
}
