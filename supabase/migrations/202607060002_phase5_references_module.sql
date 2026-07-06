-- Phase 5 references module.
-- Scope: tenant reference records, consent hooks, verification request placeholders, notes, and signals.

alter type public.passport_activity_event add value if not exists 'references_draft_saved';
alter type public.passport_activity_event add value if not exists 'references_ready_for_review';
alter type public.passport_activity_event add value if not exists 'references_needs_reverification';

do $$
begin
  create type public.reference_category as enum ('previous_landlord', 'professional', 'personal', 'property_manager', 'character_reference', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.reference_relationship as enum ('employer', 'manager', 'coworker', 'previous_landlord', 'property_manager', 'friend', 'family', 'teacher', 'client', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.reference_contact_method as enum ('email', 'phone', 'either');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.reference_verification_request_status as enum ('draft', 'ready_for_review', 'under_review', 'verified', 'needs_more_information', 'needs_reverification', 'expired');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.references (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category public.reference_category not null default 'professional',
  reference_name text not null default '',
  relationship public.reference_relationship not null default 'manager',
  company text,
  email text not null default '',
  phone text not null default '',
  preferred_contact_method public.reference_contact_method not null default 'email',
  years_known numeric(5, 2),
  comments text,
  country text not null default 'Canada',
  province_state text not null default '',
  consent_contact_reference boolean not null default false,
  consent_verify_information boolean not null default false,
  consent_store_results boolean not null default false,
  consent_share_summary boolean not null default false,
  verification_request_status public.reference_verification_request_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint references_email_format check (email = '' or position('@' in email) > 1),
  constraint references_years_known_nonnegative check (years_known is null or years_known >= 0)
);

create table if not exists public.reference_relationships (
  id uuid primary key default gen_random_uuid(),
  reference_id uuid not null references public.references(id) on delete cascade,
  relationship public.reference_relationship not null,
  relationship_label text,
  created_at timestamptz not null default now(),
  unique (reference_id)
);

create table if not exists public.reference_verification_requests (
  id uuid primary key default gen_random_uuid(),
  reference_id uuid not null references public.references(id) on delete cascade,
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.reference_verification_request_status not null default 'ready_for_review',
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.reference_verification_signals (
  id uuid primary key default gen_random_uuid(),
  reference_id uuid not null references public.references(id) on delete cascade,
  signal_key text not null,
  signal_label text not null,
  is_present boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reference_id, signal_key),
  constraint reference_signal_key_format check (signal_key ~ '^[a-z0-9_:.]+$')
);

create table if not exists public.reference_notes (
  id uuid primary key default gen_random_uuid(),
  reference_id uuid not null references public.references(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  note_type text not null default 'internal',
  note text not null,
  visibility text not null default 'internal',
  created_at timestamptz not null default now(),
  constraint reference_notes_visibility_check check (visibility in ('internal', 'tenant', 'landlord'))
);

create table if not exists public.reference_documents (
  id uuid primary key default gen_random_uuid(),
  reference_id uuid not null references public.references(id) on delete cascade,
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null,
  file_name text not null,
  storage_bucket text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists references_user_id_idx on public.references (user_id);
create index if not exists references_passport_version_idx on public.references (passport_id, passport_version_id);
create index if not exists reference_verification_requests_user_id_idx on public.reference_verification_requests (user_id);
create index if not exists reference_verification_signals_reference_id_idx on public.reference_verification_signals (reference_id);
create index if not exists reference_notes_reference_id_idx on public.reference_notes (reference_id);

drop trigger if exists set_references_updated_at on public.references;
create trigger set_references_updated_at
before update on public.references
for each row execute function public.set_updated_at();

drop trigger if exists set_reference_verification_signals_updated_at on public.reference_verification_signals;
create trigger set_reference_verification_signals_updated_at
before update on public.reference_verification_signals
for each row execute function public.set_updated_at();

alter table public.references enable row level security;
alter table public.reference_relationships enable row level security;
alter table public.reference_verification_requests enable row level security;
alter table public.reference_verification_signals enable row level security;
alter table public.reference_notes enable row level security;
alter table public.reference_documents enable row level security;

drop policy if exists "Users can manage own references" on public.references;
create policy "Users can manage own references"
on public.references for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own reference relationships" on public.reference_relationships;
create policy "Users can manage own reference relationships"
on public.reference_relationships for all
to authenticated
using (exists (select 1 from public.references where references.id = reference_relationships.reference_id and references.user_id = auth.uid()))
with check (exists (select 1 from public.references where references.id = reference_relationships.reference_id and references.user_id = auth.uid()));

drop policy if exists "Users can manage own reference verification requests" on public.reference_verification_requests;
create policy "Users can manage own reference verification requests"
on public.reference_verification_requests for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own reference verification signals" on public.reference_verification_signals;
create policy "Users can manage own reference verification signals"
on public.reference_verification_signals for all
to authenticated
using (exists (select 1 from public.references where references.id = reference_verification_signals.reference_id and references.user_id = auth.uid()))
with check (exists (select 1 from public.references where references.id = reference_verification_signals.reference_id and references.user_id = auth.uid()));

drop policy if exists "Users can read own reference notes" on public.reference_notes;
create policy "Users can read own reference notes"
on public.reference_notes for select
to authenticated
using (exists (select 1 from public.references where references.id = reference_notes.reference_id and references.user_id = auth.uid()));

drop policy if exists "Users can manage own reference documents" on public.reference_documents;
create policy "Users can manage own reference documents"
on public.reference_documents for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
