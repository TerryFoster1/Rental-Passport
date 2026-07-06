-- Phase 4 rental history module.
-- Scope: tenant rental history records, contacts, private document metadata, consent hooks, and manual review foundation.

alter type public.passport_activity_event add value if not exists 'rental_history_draft_saved';
alter type public.passport_activity_event add value if not exists 'rental_history_document_uploaded';
alter type public.passport_activity_event add value if not exists 'rental_history_ready_for_review';
alter type public.passport_activity_event add value if not exists 'rental_history_needs_reverification';

do $$
begin
  create type public.rental_relationship_type as enum ('landlord', 'property_manager', 'building_manager', 'leasing_office', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.rental_history_document_type as enum ('lease_agreement', 'rent_receipt', 'tenant_ledger', 'move_in_out_document', 'landlord_letter', 'rent_payment_proof', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.rental_history_verification_request_status as enum ('draft', 'ready_for_review', 'under_review', 'verified', 'needs_more_information', 'needs_reverification', 'expired');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.rental_history_records (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  property_address text not null default '',
  unit_number text,
  city text not null default '',
  province_state text not null default '',
  country text not null default 'Canada',
  postal_code text not null default '',
  move_in_date date,
  move_out_date date,
  is_current_residence boolean not null default false,
  monthly_rent numeric(12, 2),
  relationship_type public.rental_relationship_type not null default 'landlord',
  reason_for_leaving text,
  consent_contact_manager boolean not null default false,
  consent_review_documents boolean not null default false,
  consent_use_in_passport boolean not null default false,
  consent_share_summary boolean not null default false,
  verification_request_status public.rental_history_verification_request_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rental_history_monthly_rent_nonnegative check (monthly_rent is null or monthly_rent >= 0),
  constraint rental_history_date_order check (move_out_date is null or move_in_date is null or move_out_date >= move_in_date)
);

create table if not exists public.rental_history_contacts (
  id uuid primary key default gen_random_uuid(),
  rental_history_record_id uuid not null references public.rental_history_records(id) on delete cascade,
  manager_name text not null default '',
  manager_email text not null default '',
  manager_phone text,
  relationship_type public.rental_relationship_type not null default 'landlord',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rental_history_record_id),
  constraint rental_history_contacts_email_format check (manager_email = '' or position('@' in manager_email) > 1)
);

create table if not exists public.rental_history_documents (
  id uuid primary key default gen_random_uuid(),
  rental_history_record_id uuid not null references public.rental_history_records(id) on delete cascade,
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type public.rental_history_document_type not null,
  file_name text not null,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  file_size bigint,
  created_at timestamptz not null default now(),
  unique (storage_bucket, storage_path),
  constraint rental_history_documents_private_bucket check (storage_bucket = 'rental-history-documents'),
  constraint rental_history_documents_file_size check (file_size is null or file_size <= 10485760)
);

create table if not exists public.rental_history_verification_requests (
  id uuid primary key default gen_random_uuid(),
  rental_history_record_id uuid not null references public.rental_history_records(id) on delete cascade,
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.rental_history_verification_request_status not null default 'ready_for_review',
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.rental_history_verification_signals (
  id uuid primary key default gen_random_uuid(),
  rental_history_record_id uuid not null references public.rental_history_records(id) on delete cascade,
  signal_key text not null,
  signal_label text not null,
  is_present boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rental_history_record_id, signal_key),
  constraint rental_history_signal_key_format check (signal_key ~ '^[a-z0-9_:.]+$')
);

create index if not exists rental_history_records_user_id_idx on public.rental_history_records (user_id);
create index if not exists rental_history_records_passport_version_idx on public.rental_history_records (passport_id, passport_version_id);
create index if not exists rental_history_documents_user_id_idx on public.rental_history_documents (user_id);
create index if not exists rental_history_documents_record_id_idx on public.rental_history_documents (rental_history_record_id);
create index if not exists rental_history_verification_requests_user_id_idx on public.rental_history_verification_requests (user_id);
create index if not exists rental_history_verification_signals_record_id_idx on public.rental_history_verification_signals (rental_history_record_id);

drop trigger if exists set_rental_history_records_updated_at on public.rental_history_records;
create trigger set_rental_history_records_updated_at
before update on public.rental_history_records
for each row execute function public.set_updated_at();

drop trigger if exists set_rental_history_contacts_updated_at on public.rental_history_contacts;
create trigger set_rental_history_contacts_updated_at
before update on public.rental_history_contacts
for each row execute function public.set_updated_at();

drop trigger if exists set_rental_history_verification_signals_updated_at on public.rental_history_verification_signals;
create trigger set_rental_history_verification_signals_updated_at
before update on public.rental_history_verification_signals
for each row execute function public.set_updated_at();

alter table public.rental_history_records enable row level security;
alter table public.rental_history_contacts enable row level security;
alter table public.rental_history_documents enable row level security;
alter table public.rental_history_verification_requests enable row level security;
alter table public.rental_history_verification_signals enable row level security;

drop policy if exists "Users can manage own rental history records" on public.rental_history_records;
create policy "Users can manage own rental history records"
on public.rental_history_records for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own rental history contacts" on public.rental_history_contacts;
create policy "Users can manage own rental history contacts"
on public.rental_history_contacts for all
to authenticated
using (exists (select 1 from public.rental_history_records where rental_history_records.id = rental_history_contacts.rental_history_record_id and rental_history_records.user_id = auth.uid()))
with check (exists (select 1 from public.rental_history_records where rental_history_records.id = rental_history_contacts.rental_history_record_id and rental_history_records.user_id = auth.uid()));

drop policy if exists "Users can manage own rental history documents" on public.rental_history_documents;
create policy "Users can manage own rental history documents"
on public.rental_history_documents for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own rental history verification requests" on public.rental_history_verification_requests;
create policy "Users can manage own rental history verification requests"
on public.rental_history_verification_requests for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own rental history verification signals" on public.rental_history_verification_signals;
create policy "Users can manage own rental history verification signals"
on public.rental_history_verification_signals for all
to authenticated
using (exists (select 1 from public.rental_history_records where rental_history_records.id = rental_history_verification_signals.rental_history_record_id and rental_history_records.user_id = auth.uid()))
with check (exists (select 1 from public.rental_history_records where rental_history_records.id = rental_history_verification_signals.rental_history_record_id and rental_history_records.user_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('rental-history-documents', 'rental-history-documents', false)
on conflict (id) do update set public = false;

drop policy if exists "Users can upload own rental history documents" on storage.objects;
create policy "Users can upload own rental history documents"
on storage.objects for insert
to authenticated
with check (bucket_id = 'rental-history-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can read own rental history documents" on storage.objects;
create policy "Users can read own rental history documents"
on storage.objects for select
to authenticated
using (bucket_id = 'rental-history-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update own rental history documents" on storage.objects;
create policy "Users can update own rental history documents"
on storage.objects for update
to authenticated
using (bucket_id = 'rental-history-documents' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'rental-history-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete own rental history documents" on storage.objects;
create policy "Users can delete own rental history documents"
on storage.objects for delete
to authenticated
using (bucket_id = 'rental-history-documents' and (storage.foldername(name))[1] = auth.uid()::text);
