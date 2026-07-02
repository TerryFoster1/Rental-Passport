-- Phase 1 identity foundation.
-- Scope: auth-adjacent profile data, roles, permissions, consent, and audit logging only.

create extension if not exists "pgcrypto";

do $$
begin
  create type public.account_status as enum ('pending_email_verification', 'active', 'suspended', 'closed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.verification_status as enum ('unverified', 'email_verified', 'phone_pending', 'manually_verified');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.user_role as enum ('tenant', 'landlord', 'property_manager', 'verification_reviewer', 'support', 'compliance', 'administrator');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  legal_first_name text,
  middle_name text,
  legal_last_name text,
  preferred_name text,
  email text not null,
  phone text,
  country text,
  province_state text,
  language text not null default 'en',
  timezone text not null default 'America/Toronto',
  account_status public.account_status not null default 'pending_email_verification',
  verification_status public.verification_status not null default 'unverified',
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_format check (position('@' in email) > 1)
);

create table if not exists public.roles (
  name public.user_role primary key,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null references public.roles(name),
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.permissions (
  key text primary key,
  description text not null,
  created_at timestamptz not null default now(),
  constraint permissions_key_format check (key ~ '^[a-z0-9_:.]+$')
);

create table if not exists public.role_permissions (
  role public.user_role not null references public.roles(name) on delete cascade,
  permission_key text not null references public.permissions(key) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role, permission_key)
);

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  consent_version text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  ip_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint consent_type_format check (consent_type ~ '^[a-z0-9_:.]+$'),
  constraint consent_revocation_after_grant check (revoked_at is null or revoked_at >= granted_at)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  resource_type text not null,
  resource_id uuid,
  visibility text not null default 'user',
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now(),
  constraint audit_event_type_format check (event_type ~ '^[a-z0-9_:.]+$'),
  constraint audit_resource_type_format check (resource_type ~ '^[a-z0-9_:.]+$'),
  constraint audit_visibility_check check (visibility in ('user', 'internal', 'security'))
);

create index if not exists profiles_email_idx on public.profiles (lower(email));
create index if not exists user_roles_role_idx on public.user_roles (role);
create index if not exists consent_records_user_id_idx on public.consent_records (user_id);
create index if not exists consent_records_type_idx on public.consent_records (consent_type);
create index if not exists audit_logs_actor_user_id_idx on public.audit_logs (actor_user_id);
create index if not exists audit_logs_target_user_id_idx on public.audit_logs (target_user_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

insert into public.roles (name, description) values
  ('tenant', 'Residential renter account owner.'),
  ('landlord', 'Landlord account for future shared-passport review workflows.'),
  ('property_manager', 'Property manager account for future organization workflows.'),
  ('verification_reviewer', 'Internal reviewer for future manual verification workflows.'),
  ('support', 'Internal support role.'),
  ('compliance', 'Internal compliance role.'),
  ('administrator', 'Administrative role for platform operations.')
on conflict (name) do update set description = excluded.description;

insert into public.permissions (key, description) values
  ('profile:read_own', 'Read own account profile.'),
  ('profile:update_own', 'Update own account profile.'),
  ('roles:read_own', 'Read own assigned roles.'),
  ('consent:read_own', 'Read own consent records.'),
  ('consent:create_own', 'Create own consent records.'),
  ('audit:read_own', 'Read audit records visible to the user.')
on conflict (key) do update set description = excluded.description;

insert into public.role_permissions (role, permission_key) values
  ('tenant', 'profile:read_own'),
  ('tenant', 'profile:update_own'),
  ('tenant', 'roles:read_own'),
  ('tenant', 'consent:read_own'),
  ('tenant', 'consent:create_own'),
  ('tenant', 'audit:read_own'),
  ('landlord', 'profile:read_own'),
  ('landlord', 'profile:update_own'),
  ('landlord', 'roles:read_own'),
  ('property_manager', 'profile:read_own'),
  ('property_manager', 'profile:update_own'),
  ('property_manager', 'roles:read_own')
on conflict do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.has_role(required_role public.user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = required_role
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    legal_first_name,
    legal_last_name,
    preferred_name,
    account_status,
    verification_status,
    email_verified
  )
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'legal_first_name', ''),
    nullif(new.raw_user_meta_data ->> 'legal_last_name', ''),
    nullif(new.raw_user_meta_data ->> 'preferred_name', ''),
    case when new.email_confirmed_at is null then 'pending_email_verification'::public.account_status else 'active'::public.account_status end,
    case when new.email_confirmed_at is null then 'unverified'::public.verification_status else 'email_verified'::public.verification_status end,
    new.email_confirmed_at is not null
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'tenant')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.sync_auth_user_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    email = coalesce(new.email, public.profiles.email),
    account_status = case when new.email_confirmed_at is null then 'pending_email_verification'::public.account_status else 'active'::public.account_status end,
    verification_status = case when new.email_confirmed_at is null then 'unverified'::public.verification_status else 'email_verified'::public.verification_status end,
    email_verified = new.email_confirmed_at is not null,
    updated_at = now()
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_verification_updated on auth.users;
create trigger on_auth_user_verification_updated
after update of email, email_confirmed_at on auth.users
for each row execute function public.sync_auth_user_verification();

create or replace function public.protect_profile_verification_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('request.jwt.claim.role', true) = 'authenticated' then
    if tg_op = 'INSERT' then
      new.account_status := 'pending_email_verification';
      new.verification_status := 'unverified';
      new.email_verified := false;
      new.phone_verified := false;
    else
      new.email := old.email;
      new.account_status := old.account_status;
      new.verification_status := old.verification_status;
      new.email_verified := old.email_verified;
      new.phone_verified := old.phone_verified;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_verification_fields on public.profiles;
create trigger protect_profile_verification_fields
before insert or update on public.profiles
for each row execute function public.protect_profile_verification_fields();

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.consent_records enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Authenticated users can read role definitions" on public.roles;
create policy "Authenticated users can read role definitions"
on public.roles for select
to authenticated
using (true);

drop policy if exists "Users can read own roles" on public.user_roles;
create policy "Users can read own roles"
on public.user_roles for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Administrators can manage user roles" on public.user_roles;
create policy "Administrators can manage user roles"
on public.user_roles for all
to authenticated
using (public.has_role('administrator'))
with check (public.has_role('administrator'));

drop policy if exists "Authenticated users can read permission definitions" on public.permissions;
create policy "Authenticated users can read permission definitions"
on public.permissions for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read role permissions" on public.role_permissions;
create policy "Authenticated users can read role permissions"
on public.role_permissions for select
to authenticated
using (true);

drop policy if exists "Users can read own consent records" on public.consent_records;
create policy "Users can read own consent records"
on public.consent_records for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can create own consent records" on public.consent_records;
create policy "Users can create own consent records"
on public.consent_records for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can revoke own consent records" on public.consent_records;
create policy "Users can revoke own consent records"
on public.consent_records for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can read visible own audit logs" on public.audit_logs;
create policy "Users can read visible own audit logs"
on public.audit_logs for select
to authenticated
using (
  visibility = 'user'
  and (actor_user_id = auth.uid() or target_user_id = auth.uid())
);
