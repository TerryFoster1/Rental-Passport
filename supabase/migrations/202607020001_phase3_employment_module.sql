-- Phase 3 employment module.
-- Scope: tenant employment section data, private document metadata, consent hooks, and manual review foundation.

alter type public.passport_section_status add value if not exists 'under_review';
alter type public.passport_section_status add value if not exists 'needs_more_information';
alter type public.passport_section_status add value if not exists 'expired';

alter type public.passport_activity_event add value if not exists 'employment_draft_saved';
alter type public.passport_activity_event add value if not exists 'employment_document_uploaded';
alter type public.passport_activity_event add value if not exists 'employment_ready_for_review';
alter type public.passport_activity_event add value if not exists 'employment_needs_reverification';

do $$
begin
  create type public.employment_type as enum ('full_time', 'part_time', 'contract', 'self_employed', 'seasonal', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.employment_status as enum ('active', 'probationary', 'leave', 'ended');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.pay_frequency as enum ('weekly', 'biweekly', 'semimonthly', 'monthly', 'annual', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.employment_document_type as enum ('pay_stub', 'employment_letter', 'offer_letter', 'bank_deposit_proof', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.employment_verification_request_status as enum ('draft', 'ready_for_review', 'under_review', 'verified', 'needs_more_information', 'needs_reverification', 'expired');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.employment_records (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  employer_name text not null default '',
  employer_website text,
  employer_email_domain text,
  job_title text not null default '',
  employment_type public.employment_type not null default 'full_time',
  employment_status public.employment_status not null default 'active',
  start_date date,
  annual_income numeric(12, 2),
  pay_frequency public.pay_frequency not null default 'biweekly',
  work_location text,
  consent_contact_employer boolean not null default false,
  consent_review_documents boolean not null default false,
  consent_use_in_passport boolean not null default false,
  consent_share_summary boolean not null default false,
  verification_request_status public.employment_verification_request_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (passport_version_id, user_id),
  constraint employment_records_income_nonnegative check (annual_income is null or annual_income >= 0)
);

create table if not exists public.employment_contacts (
  id uuid primary key default gen_random_uuid(),
  employment_record_id uuid not null references public.employment_records(id) on delete cascade,
  employer_contact_name text not null default '',
  employer_contact_email text not null default '',
  employer_contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employment_record_id),
  constraint employment_contacts_email_format check (employer_contact_email = '' or position('@' in employer_contact_email) > 1)
);

create table if not exists public.employment_documents (
  id uuid primary key default gen_random_uuid(),
  employment_record_id uuid not null references public.employment_records(id) on delete cascade,
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type public.employment_document_type not null,
  file_name text not null,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  file_size bigint,
  created_at timestamptz not null default now(),
  unique (storage_bucket, storage_path),
  constraint employment_documents_private_bucket check (storage_bucket = 'employment-documents'),
  constraint employment_documents_file_size check (file_size is null or file_size <= 10485760)
);

create table if not exists public.employment_verification_requests (
  id uuid primary key default gen_random_uuid(),
  employment_record_id uuid not null references public.employment_records(id) on delete cascade,
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.employment_verification_request_status not null default 'ready_for_review',
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.employment_verification_signals (
  id uuid primary key default gen_random_uuid(),
  employment_record_id uuid not null references public.employment_records(id) on delete cascade,
  signal_key text not null,
  signal_label text not null,
  is_present boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employment_record_id, signal_key),
  constraint employment_signal_key_format check (signal_key ~ '^[a-z0-9_:.]+$')
);

create index if not exists employment_records_user_id_idx on public.employment_records (user_id);
create index if not exists employment_records_passport_version_idx on public.employment_records (passport_id, passport_version_id);
create index if not exists employment_documents_user_id_idx on public.employment_documents (user_id);
create index if not exists employment_documents_record_id_idx on public.employment_documents (employment_record_id);
create index if not exists employment_verification_requests_user_id_idx on public.employment_verification_requests (user_id);
create index if not exists employment_verification_signals_record_id_idx on public.employment_verification_signals (employment_record_id);

drop trigger if exists set_employment_records_updated_at on public.employment_records;
create trigger set_employment_records_updated_at
before update on public.employment_records
for each row execute function public.set_updated_at();

drop trigger if exists set_employment_contacts_updated_at on public.employment_contacts;
create trigger set_employment_contacts_updated_at
before update on public.employment_contacts
for each row execute function public.set_updated_at();

drop trigger if exists set_employment_verification_signals_updated_at on public.employment_verification_signals;
create trigger set_employment_verification_signals_updated_at
before update on public.employment_verification_signals
for each row execute function public.set_updated_at();

alter table public.employment_records enable row level security;
alter table public.employment_contacts enable row level security;
alter table public.employment_documents enable row level security;
alter table public.employment_verification_requests enable row level security;
alter table public.employment_verification_signals enable row level security;

drop policy if exists "Users can manage own employment records" on public.employment_records;
create policy "Users can manage own employment records"
on public.employment_records for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own employment contacts" on public.employment_contacts;
create policy "Users can manage own employment contacts"
on public.employment_contacts for all
to authenticated
using (
  exists (
    select 1 from public.employment_records
    where employment_records.id = employment_contacts.employment_record_id
      and employment_records.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.employment_records
    where employment_records.id = employment_contacts.employment_record_id
      and employment_records.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own employment documents" on public.employment_documents;
create policy "Users can manage own employment documents"
on public.employment_documents for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own employment verification requests" on public.employment_verification_requests;
create policy "Users can manage own employment verification requests"
on public.employment_verification_requests for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own employment verification signals" on public.employment_verification_signals;
create policy "Users can manage own employment verification signals"
on public.employment_verification_signals for all
to authenticated
using (
  exists (
    select 1 from public.employment_records
    where employment_records.id = employment_verification_signals.employment_record_id
      and employment_records.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.employment_records
    where employment_records.id = employment_verification_signals.employment_record_id
      and employment_records.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('employment-documents', 'employment-documents', false)
on conflict (id) do update set public = false;

drop policy if exists "Users can upload own employment documents" on storage.objects;
create policy "Users can upload own employment documents"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'employment-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can read own employment documents" on storage.objects;
create policy "Users can read own employment documents"
on storage.objects for select
to authenticated
using (
  bucket_id = 'employment-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own employment documents" on storage.objects;
create policy "Users can update own employment documents"
on storage.objects for update
to authenticated
using (
  bucket_id = 'employment-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'employment-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete own employment documents" on storage.objects;
create policy "Users can delete own employment documents"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'employment-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);
