import { apiV1Endpoints } from '@/api/v1/endpoints';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { describeApplyWithRentalPassportFlow, oauthFoundation } from '@/services/oauthArchitectureService';
import { integrationProviders } from '@/services/integrations/integrationRegistry';
import { webhookEvents } from '@/services/webhookService';
import { ApiKeyCard, CodeExample, DeveloperNavigation, DeveloperStatusBadge, EndpointCard, IntegrationCard, WebhookCard } from '@/features/developers/components/DeveloperPortalComponents';

const sections = ['Overview', 'Getting Started', 'Authentication', 'OAuth', 'REST API', 'Webhooks', 'SDKs', 'Sandbox', 'Partner Benefits', 'API Status', 'Future Pricing', 'Contact'];

export function DeveloperPortalPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <PageContainer>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <DeveloperNavigation sections={sections} />
        <main className="space-y-10">
          <PageHeader
            eyebrow="Developer Platform"
            title="Build with Rental Passport"
            description="API-first infrastructure for Apply with RentalPassport.io, partner applications, webhooks, and future SDKs."
            actions={<Button onClick={() => onNavigate('/')}>Back to Home</Button>}
          />
          <Section title="Overview">
            <div className="flex flex-wrap items-center gap-3">
              <DeveloperStatusBadge />
              <span className="text-sm font-semibold text-slate-600">Hidden MVP documentation route</span>
            </div>
            <p className="mt-4 max-w-3xl leading-7 text-slate-700">Rental Passport is designed as an API-first rental identity and verification layer. The React application is the first client; external platforms will eventually integrate through OAuth, scoped APIs, and webhooks.</p>
          </Section>

          <Section title="Getting Started">
            <div className="grid gap-4 md:grid-cols-3">
              <Step title="Register client" text="Create a future developer account and API client." />
              <Step title="Request scopes" text="Ask for only the passport fields and workflow actions needed." />
              <Step title="Use tenant consent" text="Retrieve data only after the tenant authorizes sharing." />
            </div>
          </Section>

          <Section title="Authentication">
            <ApiKeyCard />
          </Section>

          <Section title="OAuth">
            <Card className="p-5">
              <h3 className="text-xl font-black">OAuth foundation</h3>
              <p className="mt-2 text-sm text-slate-700">Production OAuth is not implemented yet. Phase 10 defines the route architecture, grants, scopes, and token lifecycle.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Meta label="Authorize" value={oauthFoundation.authorizationEndpoint} />
                <Meta label="Token" value={oauthFoundation.tokenEndpoint} />
                <Meta label="Revoke" value={oauthFoundation.revocationEndpoint} />
                <Meta label="Introspect" value={oauthFoundation.introspectionEndpoint} />
              </div>
            </Card>
            <CodeExample title="Apply with RentalPassport.io flow" code={describeApplyWithRentalPassportFlow().map((item, index) => `${index + 1}. ${item}`).join('\n')} />
          </Section>

          <Section title="REST API">
            <div className="grid gap-4">
              {apiV1Endpoints.map((endpoint) => <EndpointCard key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} />)}
            </div>
          </Section>

          <Section title="Webhooks">
            <div className="grid gap-4 md:grid-cols-2">
              {webhookEvents.map((event) => <WebhookCard key={event.name} event={event} />)}
            </div>
          </Section>

          <Section title="SDKs">
            <CodeExample title="Planned TypeScript SDK" code={`import { RentalPassportClient } from '@rentalpassport/sdk';\n\nconst client = new RentalPassportClient({ apiKey: process.env.RENTAL_PASSPORT_API_KEY });\n\n// Planned future API\nawait client.passports.get(passportId);`} />
          </Section>

          <Section title="Sandbox">
            <p className="leading-7 text-slate-700">Sandbox accounts, test API keys, mock webhooks, and partner test data are planned for future phases. Phase 10 reserves the data model and docs surface.</p>
          </Section>

          <Section title="Partner Benefits">
            <div className="grid gap-4 md:grid-cols-2">
              {integrationProviders.map((provider) => <IntegrationCard key={provider.key} provider={provider} />)}
            </div>
          </Section>

          <Section title="API Status">
            <Card className="p-5">
              <h3 className="text-xl font-black">Current status</h3>
              <p className="mt-2 text-slate-700">API architecture, route manifest, integration registry, webhook event catalog, and data model foundation are ready. Production OAuth, live webhooks, SDK releases, and partner onboarding remain future work.</p>
            </Card>
          </Section>

          <Section title="Future Pricing">
            <p className="leading-7 text-slate-700">Future pricing may include developer, partner, and enterprise tiers with scoped API usage, verification volume, and webhook limits. Billing is not implemented in Phase 10.</p>
          </Section>

          <Section title="Contact">
            <p className="leading-7 text-slate-700">Partner contact and developer onboarding will be introduced when the API moves from architecture foundation to controlled beta.</p>
          </Section>
        </main>
      </div>
    </PageContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section id={title.toLowerCase().replace(/\s+/g, '-')} className="scroll-mt-8">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Step({ title, text }: { title: string; text: string }) {
  return (
    <Card className="p-5">
      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <code className="mt-1 block text-sm font-bold">{value}</code>
    </div>
  );
}
