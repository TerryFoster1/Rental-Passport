-- Phase 10 API platform, integrations, and partner ecosystem foundation.
-- Scope: data model for API clients, keys, OAuth architecture, partner integrations,
-- webhooks, API logging, rate limiting, developer accounts, and integration settings.

do $$
begin
  create type public.api_client_type as enum ('developer', 'partner', 'enterprise', 'internal');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.api_client_status as enum ('sandbox', 'active', 'suspended', 'revoked');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.oauth_token_status as enum ('active', 'revoked', 'expired');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.integration_provider_key as enum ('rental_district', 'singlekey', 'frontlobby', 'openroom', 'stripe', 'resend', 'twilio', 'google', 'docusign', 'future_identity_provider', 'future_payment_provider', 'future_escrow_provider');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.webhook_event_name as enum (
    'passport.created',
    'passport.updated',
    'passport.verified',
    'passport.shared',
    'application.submitted',
    'application.viewed',
    'application.accepted',
    'application.rejected',
    'verification.requested',
    'verification.completed',
    'verification.expired',
    'document.uploaded',
    'document.deleted',
    'user.deleted',
    'consent.updated'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.developer_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  organization_name text not null,
  contact_email text not null,
  status public.api_client_status not null default 'sandbox',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint developer_accounts_contact_email_format check (position('@' in contact_email) > 1)
);

create table if not exists public.api_clients (
  id uuid primary key default gen_random_uuid(),
  developer_account_id uuid references public.developer_accounts(id) on delete cascade,
  client_name text not null,
  client_type public.api_client_type not null default 'developer',
  status public.api_client_status not null default 'sandbox',
  allowed_origins text[] not null default '{}',
  redirect_uris text[] not null default '{}',
  scopes text[] not null default '{}',
  rate_limit_tier text not null default 'partner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  api_client_id uuid not null references public.api_clients(id) on delete cascade,
  key_prefix text not null,
  key_hash text not null unique,
  scopes text[] not null default '{}',
  status public.api_client_status not null default 'sandbox',
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.oauth_clients (
  id uuid primary key default gen_random_uuid(),
  api_client_id uuid not null references public.api_clients(id) on delete cascade,
  client_id text not null unique,
  client_secret_hash text,
  redirect_uris text[] not null default '{}',
  allowed_scopes text[] not null default '{}',
  status public.api_client_status not null default 'sandbox',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  oauth_client_id uuid not null references public.oauth_clients(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  access_token_hash text not null unique,
  refresh_token_hash text unique,
  scopes text[] not null default '{}',
  status public.oauth_token_status not null default 'active',
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_integrations (
  id uuid primary key default gen_random_uuid(),
  api_client_id uuid references public.api_clients(id) on delete cascade,
  provider_key public.integration_provider_key not null,
  display_name text not null,
  status public.api_client_status not null default 'sandbox',
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.webhook_subscriptions (
  id uuid primary key default gen_random_uuid(),
  api_client_id uuid not null references public.api_clients(id) on delete cascade,
  event_name public.webhook_event_name not null,
  endpoint_url text not null,
  signing_secret_hash text,
  status public.api_client_status not null default 'sandbox',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint webhook_endpoint_url_http check (endpoint_url ~ '^https://')
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  webhook_subscription_id uuid references public.webhook_subscriptions(id) on delete set null,
  event_name public.webhook_event_name not null,
  resource_type text not null,
  resource_id uuid,
  payload jsonb not null default '{}'::jsonb,
  delivery_status text not null default 'pending',
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  constraint webhook_events_delivery_status_check check (delivery_status in ('pending', 'not_implemented', 'delivered', 'failed', 'cancelled'))
);

create table if not exists public.api_logs (
  id uuid primary key default gen_random_uuid(),
  request_id text not null,
  api_client_id uuid references public.api_clients(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  method text,
  path text,
  status_code integer,
  error_code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.rate_limit_records (
  id uuid primary key default gen_random_uuid(),
  api_client_id uuid references public.api_clients(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete cascade,
  rate_limit_key text not null,
  window_start timestamptz not null,
  window_seconds integer not null,
  request_count integer not null default 0,
  limit_count integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rate_limit_key, window_start)
);

create table if not exists public.integration_settings (
  id uuid primary key default gen_random_uuid(),
  provider_key public.integration_provider_key not null,
  api_client_id uuid references public.api_clients(id) on delete cascade,
  setting_key text not null,
  setting_value jsonb not null default '{}'::jsonb,
  secret_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_key, api_client_id, setting_key)
);

insert into public.partner_integrations (provider_key, display_name, status, configuration) values
  ('rental_district', 'Rental District', 'sandbox', '{"handoff":"prepared_not_sent"}'::jsonb),
  ('singlekey', 'SingleKey', 'sandbox', '{}'::jsonb),
  ('frontlobby', 'FrontLobby', 'sandbox', '{}'::jsonb),
  ('openroom', 'OpenRoom', 'sandbox', '{}'::jsonb),
  ('stripe', 'Stripe', 'sandbox', '{}'::jsonb),
  ('resend', 'Resend', 'sandbox', '{}'::jsonb),
  ('twilio', 'Twilio', 'sandbox', '{}'::jsonb),
  ('google', 'Google', 'sandbox', '{}'::jsonb),
  ('docusign', 'DocuSign', 'sandbox', '{}'::jsonb),
  ('future_identity_provider', 'Future Identity Provider', 'sandbox', '{}'::jsonb),
  ('future_payment_provider', 'Future Payment Provider', 'sandbox', '{}'::jsonb),
  ('future_escrow_provider', 'Future Escrow Provider', 'sandbox', '{}'::jsonb)
on conflict do nothing;

create index if not exists developer_accounts_owner_user_id_idx on public.developer_accounts (owner_user_id);
create index if not exists api_clients_developer_account_id_idx on public.api_clients (developer_account_id);
create index if not exists api_keys_api_client_id_idx on public.api_keys (api_client_id);
create index if not exists oauth_clients_api_client_id_idx on public.oauth_clients (api_client_id);
create index if not exists oauth_tokens_oauth_client_id_idx on public.oauth_tokens (oauth_client_id);
create index if not exists partner_integrations_provider_key_idx on public.partner_integrations (provider_key);
create index if not exists webhook_subscriptions_api_client_id_idx on public.webhook_subscriptions (api_client_id);
create index if not exists webhook_events_event_name_idx on public.webhook_events (event_name, created_at desc);
create index if not exists api_logs_request_id_idx on public.api_logs (request_id);
create index if not exists api_logs_api_client_id_idx on public.api_logs (api_client_id, created_at desc);
create index if not exists rate_limit_records_key_idx on public.rate_limit_records (rate_limit_key, window_start desc);

drop trigger if exists update_developer_accounts_updated_at on public.developer_accounts;
create trigger update_developer_accounts_updated_at before update on public.developer_accounts for each row execute function public.set_updated_at();

drop trigger if exists update_api_clients_updated_at on public.api_clients;
create trigger update_api_clients_updated_at before update on public.api_clients for each row execute function public.set_updated_at();

drop trigger if exists update_oauth_clients_updated_at on public.oauth_clients;
create trigger update_oauth_clients_updated_at before update on public.oauth_clients for each row execute function public.set_updated_at();

drop trigger if exists update_partner_integrations_updated_at on public.partner_integrations;
create trigger update_partner_integrations_updated_at before update on public.partner_integrations for each row execute function public.set_updated_at();

drop trigger if exists update_webhook_subscriptions_updated_at on public.webhook_subscriptions;
create trigger update_webhook_subscriptions_updated_at before update on public.webhook_subscriptions for each row execute function public.set_updated_at();

drop trigger if exists update_rate_limit_records_updated_at on public.rate_limit_records;
create trigger update_rate_limit_records_updated_at before update on public.rate_limit_records for each row execute function public.set_updated_at();

drop trigger if exists update_integration_settings_updated_at on public.integration_settings;
create trigger update_integration_settings_updated_at before update on public.integration_settings for each row execute function public.set_updated_at();

alter table public.developer_accounts enable row level security;
alter table public.api_clients enable row level security;
alter table public.api_keys enable row level security;
alter table public.oauth_clients enable row level security;
alter table public.oauth_tokens enable row level security;
alter table public.partner_integrations enable row level security;
alter table public.webhook_subscriptions enable row level security;
alter table public.webhook_events enable row level security;
alter table public.api_logs enable row level security;
alter table public.rate_limit_records enable row level security;
alter table public.integration_settings enable row level security;

drop policy if exists "Developers can manage own developer account" on public.developer_accounts;
create policy "Developers can manage own developer account" on public.developer_accounts for all
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "Developers can manage own API clients" on public.api_clients;
create policy "Developers can manage own API clients" on public.api_clients for all
  using (exists (select 1 from public.developer_accounts account where account.id = developer_account_id and account.owner_user_id = auth.uid()))
  with check (exists (select 1 from public.developer_accounts account where account.id = developer_account_id and account.owner_user_id = auth.uid()));

drop policy if exists "Developers can manage own API keys" on public.api_keys;
create policy "Developers can manage own API keys" on public.api_keys for all
  using (exists (select 1 from public.api_clients client join public.developer_accounts account on account.id = client.developer_account_id where client.id = api_client_id and account.owner_user_id = auth.uid()))
  with check (exists (select 1 from public.api_clients client join public.developer_accounts account on account.id = client.developer_account_id where client.id = api_client_id and account.owner_user_id = auth.uid()));

drop policy if exists "Developers can manage own OAuth clients" on public.oauth_clients;
create policy "Developers can manage own OAuth clients" on public.oauth_clients for all
  using (exists (select 1 from public.api_clients client join public.developer_accounts account on account.id = client.developer_account_id where client.id = api_client_id and account.owner_user_id = auth.uid()))
  with check (exists (select 1 from public.api_clients client join public.developer_accounts account on account.id = client.developer_account_id where client.id = api_client_id and account.owner_user_id = auth.uid()));

drop policy if exists "Users can read own OAuth tokens" on public.oauth_tokens;
create policy "Users can read own OAuth tokens" on public.oauth_tokens for select
  using (user_id = auth.uid());

drop policy if exists "Developers can manage own webhook subscriptions" on public.webhook_subscriptions;
create policy "Developers can manage own webhook subscriptions" on public.webhook_subscriptions for all
  using (exists (select 1 from public.api_clients client join public.developer_accounts account on account.id = client.developer_account_id where client.id = api_client_id and account.owner_user_id = auth.uid()))
  with check (exists (select 1 from public.api_clients client join public.developer_accounts account on account.id = client.developer_account_id where client.id = api_client_id and account.owner_user_id = auth.uid()));

drop policy if exists "Developers can read own webhook events" on public.webhook_events;
create policy "Developers can read own webhook events" on public.webhook_events for select
  using (exists (select 1 from public.webhook_subscriptions subscription join public.api_clients client on client.id = subscription.api_client_id join public.developer_accounts account on account.id = client.developer_account_id where subscription.id = webhook_subscription_id and account.owner_user_id = auth.uid()));

drop policy if exists "Developers can read own API logs" on public.api_logs;
create policy "Developers can read own API logs" on public.api_logs for select
  using (exists (select 1 from public.api_clients client join public.developer_accounts account on account.id = client.developer_account_id where client.id = api_client_id and account.owner_user_id = auth.uid()));

drop policy if exists "Developers can read own rate limits" on public.rate_limit_records;
create policy "Developers can read own rate limits" on public.rate_limit_records for select
  using (exists (select 1 from public.api_clients client join public.developer_accounts account on account.id = client.developer_account_id where client.id = api_client_id and account.owner_user_id = auth.uid()));

drop policy if exists "Developers can manage own integration settings" on public.integration_settings;
create policy "Developers can manage own integration settings" on public.integration_settings for all
  using (exists (select 1 from public.api_clients client join public.developer_accounts account on account.id = client.developer_account_id where client.id = api_client_id and account.owner_user_id = auth.uid()))
  with check (exists (select 1 from public.api_clients client join public.developer_accounts account on account.id = client.developer_account_id where client.id = api_client_id and account.owner_user_id = auth.uid()));

drop policy if exists "Authenticated users can read integration registry" on public.partner_integrations;
create policy "Authenticated users can read integration registry" on public.partner_integrations for select
  using (auth.uid() is not null);
