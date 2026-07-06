-- Phase 6 identity verification module.
-- Scope: tenant identity profile, private ID/selfie uploads, consent hooks, manual review foundation, and phone placeholder state.

alter type public.passport_activity_event add value if not exists 'identity_draft_saved';
alter type public.passport_activity_event add value if not exists 'identity_document_uploaded';
alter type public.passport_activity_event add value if not exists 'identity_ready_for_review';
alter type public.passport_activity_event add value if not exists 'identity_needs_reverification';

do $$
begin
  create type public.identity_document_type as enum ('drivers_licence', 'passport', 'state_id', 'permanent_resident_card', 'other_government_id');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.identity_upload_kind as enum ('government_id_front', 'government_id_back', 'selfie');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.identity_verification_request_status as enum ('draft', 'ready_for_review', 'under_review', 'verified', 'needs_more_information', 'needs_reverification', 'expired');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.phone_verification_state as enum ('not_started', 'manual_pending', 'manually_confirmed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.identity_profiles (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  legal_first_name text not null default '',
  middle_name text,
  legal_last_name text not null default '',
  preferred_name text,
  date_of_birth date,
  country text not null default 'Canada',
  province_state text not null default '',
  current_address text not null default '',
  email text not null default '',
  phone_number text,
  id_document_type public.identity_document_type not null default 'drivers_licence',
  email_verified boolean not null default false,
  phone_verification_status public.phone_verification_state not null default 'manual_pending',
  consent_review_government_id boolean not null default false,
  consent_review_selfie boolean not null default false,
  consent_confirm_legal_identity boolean not null default false,
  consent_store_verification_result boolean not null default false,
  consent_share_identity_status boolean not null default false,
  verification_request_status public.identity_verification_request_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (passport_version_id, user_id),
  constraint identity_profiles_email_format check (email = '' or position('@' in email) > 1)
);

create table if not exists public.identity_documents (
  id uuid primary key default gen_random_uuid(),
  identity_profile_id uuid not null references public.identity_profiles(id) on delete cascade,
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  upload_kind public.identity_upload_kind not null,
  document_type public.identity_document_type not null,
  file_name text not null,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  file_size bigint,
  created_at timestamptz not null default now(),
  unique (storage_bucket, storage_path),
  constraint identity_documents_private_bucket check (storage_bucket = 'identity-documents'),
  constraint identity_documents_file_size check (file_size is null or file_size <= 10485760)
);

create table if not exists public.identity_selfies (
  id uuid primary key default gen_random_uuid(),
  identity_profile_id uuid not null references public.identity_profiles(id) on delete cascade,
  identity_document_id uuid references public.identity_documents(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.identity_verification_requests (
  id uuid primary key default gen_random_uuid(),
  identity_profile_id uuid not null references public.identity_profiles(id) on delete cascade,
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.identity_verification_request_status not null default 'ready_for_review',
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.identity_verification_signals (
  id uuid primary key default gen_random_uuid(),
  identity_profile_id uuid not null references public.identity_profiles(id) on delete cascade,
  signal_key text not null,
  signal_label text not null,
  is_present boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (identity_profile_id, signal_key),
  constraint identity_signal_key_format check (signal_key ~ '^[a-z0-9_:.]+$')
);

create table if not exists public.phone_verification_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  identity_profile_id uuid references public.identity_profiles(id) on delete cascade,
  phone_number text,
  status public.phone_verification_state not null default 'manual_pending',
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, identity_profile_id)
);

create table if not exists public.identity_review_notes (
  id uuid primary key default gen_random_uuid(),
  identity_profile_id uuid not null references public.identity_profiles(id) on delete cascade,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  note text not null,
  visibility text not null default 'internal',
  created_at timestamptz not null default now(),
  constraint identity_review_notes_visibility_check check (visibility in ('internal', 'tenant'))
);

create index if not exists identity_profiles_user_id_idx on public.identity_profiles (user_id);
create index if not exists identity_profiles_passport_version_idx on public.identity_profiles (passport_id, passport_version_id);
create index if not exists identity_documents_user_id_idx on public.identity_documents (user_id);
create index if not exists identity_documents_profile_id_idx on public.identity_documents (identity_profile_id);
create index if not exists identity_verification_requests_user_id_idx on public.identity_verification_requests (user_id);
create index if not exists identity_verification_signals_profile_id_idx on public.identity_verification_signals (identity_profile_id);

drop trigger if exists set_identity_profiles_updated_at on public.identity_profiles;
create trigger set_identity_profiles_updated_at
before update on public.identity_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_identity_verification_signals_updated_at on public.identity_verification_signals;
create trigger set_identity_verification_signals_updated_at
before update on public.identity_verification_signals
for each row execute function public.set_updated_at();

drop trigger if exists set_phone_verification_status_updated_at on public.phone_verification_status;
create trigger set_phone_verification_status_updated_at
before update on public.phone_verification_status
for each row execute function public.set_updated_at();

alter table public.identity_profiles enable row level security;
alter table public.identity_documents enable row level security;
alter table public.identity_selfies enable row level security;
alter table public.identity_verification_requests enable row level security;
alter table public.identity_verification_signals enable row level security;
alter table public.phone_verification_status enable row level security;
alter table public.identity_review_notes enable row level security;

drop policy if exists "Users can manage own identity profiles" on public.identity_profiles;
create policy "Users can manage own identity profiles"
on public.identity_profiles for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own identity documents" on public.identity_documents;
create policy "Users can manage own identity documents"
on public.identity_documents for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own identity selfies" on public.identity_selfies;
create policy "Users can manage own identity selfies"
on public.identity_selfies for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own identity verification requests" on public.identity_verification_requests;
create policy "Users can manage own identity verification requests"
on public.identity_verification_requests for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own identity verification signals" on public.identity_verification_signals;
create policy "Users can manage own identity verification signals"
on public.identity_verification_signals for all
to authenticated
using (exists (select 1 from public.identity_profiles where identity_profiles.id = identity_verification_signals.identity_profile_id and identity_profiles.user_id = auth.uid()))
with check (exists (select 1 from public.identity_profiles where identity_profiles.id = identity_verification_signals.identity_profile_id and identity_profiles.user_id = auth.uid()));

drop policy if exists "Users can read own phone verification status" on public.phone_verification_status;
create policy "Users can read own phone verification status"
on public.phone_verification_status for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can create own phone verification placeholder" on public.phone_verification_status;
create policy "Users can create own phone verification placeholder"
on public.phone_verification_status for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can read own identity review notes" on public.identity_review_notes;
create policy "Users can read own identity review notes"
on public.identity_review_notes for select
to authenticated
using (exists (select 1 from public.identity_profiles where identity_profiles.id = identity_review_notes.identity_profile_id and identity_profiles.user_id = auth.uid() and identity_review_notes.visibility = 'tenant'));

insert into storage.buckets (id, name, public)
values ('identity-documents', 'identity-documents', false)
on conflict (id) do update set public = false;

drop policy if exists "Users can upload own identity documents" on storage.objects;
create policy "Users can upload own identity documents"
on storage.objects for insert
to authenticated
with check (bucket_id = 'identity-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can read own identity documents" on storage.objects;
create policy "Users can read own identity documents"
on storage.objects for select
to authenticated
using (bucket_id = 'identity-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update own identity documents" on storage.objects;
create policy "Users can update own identity documents"
on storage.objects for update
to authenticated
using (bucket_id = 'identity-documents' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'identity-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete own identity documents" on storage.objects;
create policy "Users can delete own identity documents"
on storage.objects for delete
to authenticated
using (bucket_id = 'identity-documents' and (storage.foldername(name))[1] = auth.uid()::text);
