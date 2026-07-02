-- Phase 2 passport framework.
-- Scope: passport shell, versioning, section statuses, and activity log only.

do $$
begin
  create type public.passport_status as enum ('draft', 'in_progress', 'ready_for_review', 'verified', 'needs_reverification');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.passport_version_status as enum ('draft', 'current', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.passport_section_key as enum ('rental_history', 'employment', 'references', 'credit_report', 'identity_confirmation');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.passport_section_status as enum ('not_started', 'in_progress', 'ready_for_review', 'verified', 'needs_reverification');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.passport_verification_state as enum ('unverified', 'pending_review', 'verified', 'needs_reverification');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.passport_activity_event as enum ('passport_created', 'passport_version_created', 'section_started', 'section_updated', 'passport_progress_changed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.passports (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  passport_number text not null unique,
  status public.passport_status not null default 'draft',
  current_version_id uuid,
  draft_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint passports_number_format check (passport_number ~ '^RP-[A-Z0-9]{4}-[A-Z0-9]{4}$')
);

create table if not exists public.passport_versions (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.passports(id) on delete cascade,
  version_number integer not null,
  status public.passport_version_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (passport_id, version_number)
);

alter table public.passports
  drop constraint if exists passports_current_version_id_fkey,
  add constraint passports_current_version_id_fkey foreign key (current_version_id) references public.passport_versions(id) on delete set null;

alter table public.passports
  drop constraint if exists passports_draft_version_id_fkey,
  add constraint passports_draft_version_id_fkey foreign key (draft_version_id) references public.passport_versions(id) on delete set null;

create table if not exists public.passport_section_statuses (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  section_key public.passport_section_key not null,
  status public.passport_section_status not null default 'not_started',
  verification_state public.passport_verification_state not null default 'unverified',
  progress integer not null default 0,
  last_updated_at timestamptz,
  needs_reverification_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (passport_version_id, section_key),
  constraint passport_section_progress_range check (progress between 0 and 100)
);

create table if not exists public.passport_activity_logs (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.passports(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type public.passport_activity_event not null,
  description text not null,
  visibility text not null default 'internal',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint passport_activity_visibility_check check (visibility in ('internal', 'tenant', 'landlord'))
);

create index if not exists passports_owner_user_id_idx on public.passports (owner_user_id);
create index if not exists passport_versions_passport_id_idx on public.passport_versions (passport_id);
create index if not exists passport_section_statuses_passport_id_idx on public.passport_section_statuses (passport_id);
create index if not exists passport_section_statuses_version_id_idx on public.passport_section_statuses (passport_version_id);
create index if not exists passport_activity_logs_passport_id_idx on public.passport_activity_logs (passport_id, created_at desc);

drop trigger if exists set_passports_updated_at on public.passports;
create trigger set_passports_updated_at
before update on public.passports
for each row execute function public.set_updated_at();

drop trigger if exists set_passport_versions_updated_at on public.passport_versions;
create trigger set_passport_versions_updated_at
before update on public.passport_versions
for each row execute function public.set_updated_at();

drop trigger if exists set_passport_section_statuses_updated_at on public.passport_section_statuses;
create trigger set_passport_section_statuses_updated_at
before update on public.passport_section_statuses
for each row execute function public.set_updated_at();

alter table public.passports enable row level security;
alter table public.passport_versions enable row level security;
alter table public.passport_section_statuses enable row level security;
alter table public.passport_activity_logs enable row level security;

drop policy if exists "Users can read own passports" on public.passports;
create policy "Users can read own passports"
on public.passports for select
to authenticated
using (owner_user_id = auth.uid());

drop policy if exists "Users can create own passports" on public.passports;
create policy "Users can create own passports"
on public.passports for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists "Users can update own passports" on public.passports;
create policy "Users can update own passports"
on public.passports for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "Users can read own passport versions" on public.passport_versions;
create policy "Users can read own passport versions"
on public.passport_versions for select
to authenticated
using (exists (select 1 from public.passports where passports.id = passport_versions.passport_id and passports.owner_user_id = auth.uid()));

drop policy if exists "Users can create own passport versions" on public.passport_versions;
create policy "Users can create own passport versions"
on public.passport_versions for insert
to authenticated
with check (exists (select 1 from public.passports where passports.id = passport_versions.passport_id and passports.owner_user_id = auth.uid()));

drop policy if exists "Users can read own passport section statuses" on public.passport_section_statuses;
create policy "Users can read own passport section statuses"
on public.passport_section_statuses for select
to authenticated
using (exists (select 1 from public.passports where passports.id = passport_section_statuses.passport_id and passports.owner_user_id = auth.uid()));

drop policy if exists "Users can create own passport section statuses" on public.passport_section_statuses;
create policy "Users can create own passport section statuses"
on public.passport_section_statuses for insert
to authenticated
with check (exists (select 1 from public.passports where passports.id = passport_section_statuses.passport_id and passports.owner_user_id = auth.uid()));

drop policy if exists "Users can update own passport section statuses" on public.passport_section_statuses;
create policy "Users can update own passport section statuses"
on public.passport_section_statuses for update
to authenticated
using (exists (select 1 from public.passports where passports.id = passport_section_statuses.passport_id and passports.owner_user_id = auth.uid()))
with check (exists (select 1 from public.passports where passports.id = passport_section_statuses.passport_id and passports.owner_user_id = auth.uid()));

drop policy if exists "Users can read own passport activity" on public.passport_activity_logs;
create policy "Users can read own passport activity"
on public.passport_activity_logs for select
to authenticated
using (exists (select 1 from public.passports where passports.id = passport_activity_logs.passport_id and passports.owner_user_id = auth.uid()));

drop policy if exists "Users can create own passport activity" on public.passport_activity_logs;
create policy "Users can create own passport activity"
on public.passport_activity_logs for insert
to authenticated
with check (exists (select 1 from public.passports where passports.id = passport_activity_logs.passport_id and passports.owner_user_id = auth.uid()));
