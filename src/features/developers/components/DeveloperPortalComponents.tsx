import { Code2, KeyRound, RadioTower, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { ApiEndpointDefinition, IntegrationProviderDefinition, WebhookEventName } from '@/types/apiPlatform';

export function DeveloperNavigation({ sections }: { sections: string[] }) {
  return (
    <nav className="sticky top-6 rounded-lg border border-slate-200 bg-white p-3">
      <p className="px-2 text-xs font-black uppercase text-slate-500">Docs</p>
      <div className="mt-2 space-y-1">
        {sections.map((section) => (
          <a key={section} className="block rounded-md px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700" href={`#${section.toLowerCase().replace(/\s+/g, '-')}`}>
            {section}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function EndpointCard({ endpoint }: { endpoint: ApiEndpointDefinition }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={endpoint.method === 'GET' ? 'blue' : endpoint.method === 'POST' ? 'green' : 'orange'}>{endpoint.method}</Badge>
        <code className="rounded-md bg-slate-100 px-2 py-1 text-sm font-bold">{endpoint.path}</code>
        <Badge tone="slate">{endpoint.auth}</Badge>
      </div>
      <h3 className="mt-4 text-lg font-black">{endpoint.resource}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">{endpoint.purpose}</p>
      <p className="mt-3 text-xs font-semibold text-slate-500">Scopes: {endpoint.requiredScopes.join(', ') || 'none'} · Rate limit: {endpoint.rateLimitTier}</p>
    </Card>
  );
}

export function CodeExample({ title, code }: { title: string; code: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <Code2 className="h-4 w-4 text-blue-700" />
        <strong>{title}</strong>
      </div>
      <pre className="overflow-auto p-4 text-sm"><code>{code}</code></pre>
    </Card>
  );
}

export function WebhookCard({ event }: { event: { name: WebhookEventName; description: string } }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <RadioTower className="h-5 w-5 text-blue-700" />
        <strong>{event.name}</strong>
      </div>
      <p className="mt-2 text-sm text-slate-600">{event.description}</p>
    </Card>
  );
}

export function ApiKeyCard() {
  return (
    <Card className="p-5">
      <KeyRound className="h-7 w-7 text-blue-700" />
      <h3 className="mt-3 text-lg font-black">API key foundation</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">Developer, partner, and enterprise keys will support scoped access, rate limits, rotation, revocation, and audit logging. Production key issuance is not implemented in Phase 10.</p>
    </Card>
  );
}

export function IntegrationCard({ provider }: { provider: IntegrationProviderDefinition }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">{provider.displayName}</h3>
          <p className="mt-1 text-xs font-black uppercase text-slate-500">{provider.category.replaceAll('_', ' ')}</p>
        </div>
        <Badge tone={provider.status === 'foundation_ready' ? 'green' : 'slate'}>{provider.status.replaceAll('_', ' ')}</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{provider.notes}</p>
    </Card>
  );
}

export function DeveloperStatusBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-800">
      <ShieldCheck className="h-3 w-3" />
      Foundation Ready
    </span>
  );
}
