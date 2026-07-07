-- Phase 8 secure sharing and landlord MVP experience.
-- Scope: recipient-specific passport shares, hashed invitation tokens, landlord applications,
-- access logging, status history, and view-only document access placeholders.

alter type public.passport_activity_event add value if not exists 'passport_shared';
alter type public.passport_activity_event add value if not exists 'invitation_sent';
alter type public.passport_activity_event add value if not exists 'landlord_access_created';
alter type public.passport_activity_event add value if not exists 'passport_viewed';
alter type public.passport_activity_event add value if not exists 'section_viewed';
alter type public.passport_activity_event add value if not exists 'application_saved';
alter type public.passport_activity_event add value if not exists 'application_accepted';
alter type public.passport_activity_event add value if not exists 'application_rejected';
alter type public.passport_activity_event add value if not exists 'application_archived';
alter type public.passport_activity_event add value if not exists 'share_revoked';

do $$
begin
  create type public.passport_share_status as enum ('active', 'revoked', 'expired');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.landlord_application_status as enum ('new', 'saved', 'accepted', 'rejected', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.share_access_event as enum (
    'passport_shared',
    'invitation_sent',
    'landlord_access_created',
    'passport_viewed',
    'section_viewed',
    'application_saved',
    'application_accepted',
    'application_rejected',
    'application_archived',
    'share_revoked'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.passport_shares (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  tenant_user_id uuid not null references auth.users(id) on delete cascade,
  landlord_name text not null,
  landlord_email text not null,
  property_address text,
  message text,
  status public.passport_share_status not null default 'active',
  expires_at timestamptz not null,
  revoked_at timestamptz,
  invitation_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint passport_shares_landlord_email_lower check (landlord_email = lower(landlord_email)),
  constraint passport_shares_future_expiry check (expires_at > created_at)
);

create table if not exists public.share_tokens (
  id uuid primary key default gen_random_uuid(),
  passport_share_id uuid not null references public.passport_shares(id) on delete cascade,
  token_hash text not null unique,
  intended_recipient_email text not null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint share_tokens_email_lower check (intended_recipient_email = lower(intended_recipient_email))
);

create table if not exists public.landlord_applications (
  id uuid primary key default gen_random_uuid(),
  passport_share_id uuid not null unique references public.passport_shares(id) on delete cascade,
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  tenant_user_id uuid not null references auth.users(id) on delete cascade,
  landlord_email text not null,
  landlord_name text not null,
  applicant_name text not null,
  passport_number text not null,
  completeness integer not null default 0,
  verification_status text not null default 'Pending review',
  property_address text,
  status public.landlord_application_status not null default 'new',
  received_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint landlord_applications_email_lower check (landlord_email = lower(landlord_email)),
  constraint landlord_applications_completeness_range check (completeness between 0 and 100)
);

create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  landlord_application_id uuid not null references public.landlord_applications(id) on delete cascade,
  from_status public.landlord_application_status,
  to_status public.landlord_application_status not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.application_messages (
  id uuid primary key default gen_random_uuid(),
  landlord_application_id uuid not null references public.landlord_applications(id) on delete cascade,
  sender_user_id uuid references auth.users(id) on delete set null,
  recipient_user_id uuid references auth.users(id) on delete set null,
  body text not null,
  status text not null default 'placeholder_not_sent',
  created_at timestamptz not null default now()
);

create table if not exists public.share_access_logs (
  id uuid primary key default gen_random_uuid(),
  passport_share_id uuid not null references public.passport_shares(id) on delete cascade,
  landlord_application_id uuid references public.landlord_applications(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type public.share_access_event not null,
  section_key public.passport_section_key,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.document_access_logs (
  id uuid primary key default gen_random_uuid(),
  passport_share_id uuid not null references public.passport_shares(id) on delete cascade,
  landlord_application_id uuid references public.landlord_applications(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  document_type text not null,
  access_mode text not null default 'view_only',
  download_blocked boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.secure_view_sessions (
  id uuid primary key default gen_random_uuid(),
  passport_share_id uuid not null references public.passport_shares(id) on delete cascade,
  landlord_application_id uuid references public.landlord_applications(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'placeholder',
  expires_at timestamptz not null,
  watermark_ready boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists passport_shares_tenant_user_id_idx on public.passport_shares (tenant_user_id);
create index if not exists passport_shares_landlord_email_idx on public.passport_shares (landlord_email);
create index if not exists passport_shares_expires_at_idx on public.passport_shares (expires_at);
create index if not exists share_tokens_token_hash_idx on public.share_tokens (token_hash);
create index if not exists landlord_applications_landlord_email_idx on public.landlord_applications (landlord_email);
create index if not exists landlord_applications_tenant_user_id_idx on public.landlord_applications (tenant_user_id);
create index if not exists share_access_logs_share_id_idx on public.share_access_logs (passport_share_id, created_at desc);
create index if not exists document_access_logs_share_id_idx on public.document_access_logs (passport_share_id, created_at desc);

drop trigger if exists update_passport_shares_updated_at on public.passport_shares;
create trigger update_passport_shares_updated_at before update on public.passport_shares for each row execute function public.set_updated_at();

drop trigger if exists update_landlord_applications_updated_at on public.landlord_applications;
create trigger update_landlord_applications_updated_at before update on public.landlord_applications for each row execute function public.set_updated_at();

alter table public.passport_shares enable row level security;
alter table public.share_tokens enable row level security;
alter table public.landlord_applications enable row level security;
alter table public.application_status_history enable row level security;
alter table public.application_messages enable row level security;
alter table public.share_access_logs enable row level security;
alter table public.document_access_logs enable row level security;
alter table public.secure_view_sessions enable row level security;

drop policy if exists "Tenants can manage their passport shares" on public.passport_shares;
create policy "Tenants can manage their passport shares" on public.passport_shares
  for all using (tenant_user_id = auth.uid())
  with check (tenant_user_id = auth.uid());

drop policy if exists "Landlords can view active shares for their email" on public.passport_shares;
create policy "Landlords can view active shares for their email" on public.passport_shares
  for select using (
    landlord_email = lower(auth.jwt() ->> 'email')
    and status = 'active'
    and revoked_at is null
    and expires_at > now()
  );

drop policy if exists "No direct token access" on public.share_tokens;
create policy "No direct token access" on public.share_tokens
  for select using (false);

drop policy if exists "Tenants can create tokens for their own shares" on public.share_tokens;
create policy "Tenants can create tokens for their own shares" on public.share_tokens
  for insert with check (
    exists (
      select 1 from public.passport_shares share
      where share.id = passport_share_id
      and share.tenant_user_id = auth.uid()
    )
  );

drop policy if exists "Tenants can create landlord applications for their shares" on public.landlord_applications;
create policy "Tenants can create landlord applications for their shares" on public.landlord_applications
  for insert with check (
    tenant_user_id = auth.uid()
    and exists (
      select 1 from public.passport_shares share
      where share.id = passport_share_id
      and share.tenant_user_id = auth.uid()
    )
  );

drop policy if exists "Tenants can view applications for their shares" on public.landlord_applications;
create policy "Tenants can view applications for their shares" on public.landlord_applications
  for select using (tenant_user_id = auth.uid());

drop policy if exists "Landlords can view applications shared to their email" on public.landlord_applications;
create policy "Landlords can view applications shared to their email" on public.landlord_applications
  for select using (
    landlord_email = lower(auth.jwt() ->> 'email')
    and exists (
      select 1 from public.passport_shares share
      where share.id = passport_share_id
      and share.status = 'active'
      and share.revoked_at is null
      and share.expires_at > now()
    )
  );

drop policy if exists "Landlords can update their application status" on public.landlord_applications;
create policy "Landlords can update their application status" on public.landlord_applications
  for update using (landlord_email = lower(auth.jwt() ->> 'email'))
  with check (landlord_email = lower(auth.jwt() ->> 'email'));

drop policy if exists "Application status history visible to involved parties" on public.application_status_history;
create policy "Application status history visible to involved parties" on public.application_status_history
  for select using (
    exists (
      select 1 from public.landlord_applications app
      where app.id = landlord_application_id
      and (app.tenant_user_id = auth.uid() or app.landlord_email = lower(auth.jwt() ->> 'email'))
    )
  );

drop policy if exists "Application status history insert by involved parties" on public.application_status_history;
create policy "Application status history insert by involved parties" on public.application_status_history
  for insert with check (
    actor_user_id = auth.uid()
    and exists (
      select 1 from public.landlord_applications app
      where app.id = landlord_application_id
      and (app.tenant_user_id = auth.uid() or app.landlord_email = lower(auth.jwt() ->> 'email'))
    )
  );

drop policy if exists "Application messages visible to involved parties" on public.application_messages;
create policy "Application messages visible to involved parties" on public.application_messages
  for select using (
    exists (
      select 1 from public.landlord_applications app
      where app.id = landlord_application_id
      and (app.tenant_user_id = auth.uid() or app.landlord_email = lower(auth.jwt() ->> 'email'))
    )
  );

drop policy if exists "Share access logs visible to involved parties" on public.share_access_logs;
create policy "Share access logs visible to involved parties" on public.share_access_logs
  for select using (
    exists (
      select 1 from public.landlord_applications app
      where app.passport_share_id = share_access_logs.passport_share_id
      and (app.tenant_user_id = auth.uid() or app.landlord_email = lower(auth.jwt() ->> 'email'))
    )
  );

drop policy if exists "Share access logs insert by involved parties" on public.share_access_logs;
create policy "Share access logs insert by involved parties" on public.share_access_logs
  for insert with check (
    actor_user_id = auth.uid()
    and exists (
      select 1 from public.landlord_applications app
      where app.passport_share_id = share_access_logs.passport_share_id
      and (app.tenant_user_id = auth.uid() or app.landlord_email = lower(auth.jwt() ->> 'email'))
    )
  );

drop policy if exists "Document access logs visible to involved parties" on public.document_access_logs;
create policy "Document access logs visible to involved parties" on public.document_access_logs
  for select using (
    exists (
      select 1 from public.landlord_applications app
      where app.passport_share_id = document_access_logs.passport_share_id
      and (app.tenant_user_id = auth.uid() or app.landlord_email = lower(auth.jwt() ->> 'email'))
    )
  );

drop policy if exists "Secure view sessions visible to involved parties" on public.secure_view_sessions;
create policy "Secure view sessions visible to involved parties" on public.secure_view_sessions
  for select using (
    expires_at > now()
    and exists (
      select 1 from public.landlord_applications app
      where app.passport_share_id = secure_view_sessions.passport_share_id
      and (app.tenant_user_id = auth.uid() or app.landlord_email = lower(auth.jwt() ->> 'email'))
    )
  );

create or replace function public.get_share_invitation_by_hash(token_hash_input text)
returns table (
  id uuid,
  passport_id uuid,
  passport_version_id uuid,
  tenant_user_id uuid,
  landlord_name text,
  landlord_email text,
  property_address text,
  message text,
  status public.passport_share_status,
  expires_at timestamptz,
  revoked_at timestamptz,
  invitation_sent_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    share.id,
    share.passport_id,
    share.passport_version_id,
    share.tenant_user_id,
    share.landlord_name,
    share.landlord_email,
    share.property_address,
    share.message,
    share.status,
    share.expires_at,
    share.revoked_at,
    share.invitation_sent_at,
    share.created_at
  from public.share_tokens token
  join public.passport_shares share on share.id = token.passport_share_id
  where token.token_hash = token_hash_input
    and token.revoked_at is null
    and token.expires_at > now()
    and share.status = 'active'
    and share.revoked_at is null
    and share.expires_at > now()
  limit 1;
$$;

grant execute on function public.get_share_invitation_by_hash(text) to anon, authenticated;
