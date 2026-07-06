-- Phase 7 credit report module.
-- Scope: tenant credit report intake, manual provider request foundation, private document metadata, consent, and summary fields.

alter type public.passport_activity_event add value if not exists 'credit_report_draft_saved';
alter type public.passport_activity_event add value if not exists 'credit_report_document_uploaded';
alter type public.passport_activity_event add value if not exists 'credit_report_ready_for_review';
alter type public.passport_activity_event add value if not exists 'credit_report_needs_reverification';

do $$
begin
  create type public.credit_report_workflow as enum ('provider_request', 'tenant_upload');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.credit_provider_key as enum ('singlekey', 'frontlobby', 'equifax', 'transunion', 'manual_review');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.credit_verification_request_status as enum ('draft', 'ready_for_review', 'under_review', 'verified', 'needs_more_information', 'needs_reverification', 'expired');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.credit_providers (
  provider_key public.credit_provider_key primary key,
  display_name text not null,
  is_active boolean not null default false,
  integration_status text not null default 'future',
  created_at timestamptz not null default now()
);

insert into public.credit_providers (provider_key, display_name, is_active, integration_status) values
  ('manual_review', 'Manual Review', true, 'mvp_manual'),
  ('singlekey', 'SingleKey', false, 'future'),
  ('frontlobby', 'FrontLobby', false, 'future'),
  ('equifax', 'Equifax', false, 'future'),
  ('transunion', 'TransUnion', false, 'future')
on conflict (provider_key) do update set display_name = excluded.display_name, is_active = excluded.is_active, integration_status = excluded.integration_status;

create table if not exists public.credit_reports (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  workflow public.credit_report_workflow not null default 'provider_request',
  provider_key public.credit_provider_key not null default 'manual_review' references public.credit_providers(provider_key),
  report_date date,
  report_expires_at date,
  credit_score integer,
  credit_score_range text,
  payment_history text,
  collections text,
  public_records text,
  credit_utilization text,
  bankruptcy text,
  consumer_proposal text,
  hard_inquiries integer,
  notes text,
  consent_credit_authorization boolean not null default false,
  consent_storage boolean not null default false,
  consent_review boolean not null default false,
  consent_landlord_sharing boolean not null default false,
  consent_expiration boolean not null default false,
  verification_request_status public.credit_verification_request_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (passport_version_id, user_id),
  constraint credit_score_nonnegative check (credit_score is null or credit_score >= 0),
  constraint hard_inquiries_nonnegative check (hard_inquiries is null or hard_inquiries >= 0)
);

create table if not exists public.credit_report_documents (
  id uuid primary key default gen_random_uuid(),
  credit_report_id uuid not null references public.credit_reports(id) on delete cascade,
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text,
  file_size bigint,
  created_at timestamptz not null default now(),
  unique (storage_bucket, storage_path),
  constraint credit_report_documents_private_bucket check (storage_bucket = 'credit-report-documents'),
  constraint credit_report_documents_file_size check (file_size is null or file_size <= 10485760)
);

create table if not exists public.credit_verification_requests (
  id uuid primary key default gen_random_uuid(),
  credit_report_id uuid not null references public.credit_reports(id) on delete cascade,
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  workflow public.credit_report_workflow not null,
  status public.credit_verification_request_status not null default 'ready_for_review',
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.credit_verification_signals (
  id uuid primary key default gen_random_uuid(),
  credit_report_id uuid not null references public.credit_reports(id) on delete cascade,
  signal_key text not null,
  signal_label text not null,
  is_present boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (credit_report_id, signal_key),
  constraint credit_signal_key_format check (signal_key ~ '^[a-z0-9_:.]+$')
);

create table if not exists public.credit_consents (
  id uuid primary key default gen_random_uuid(),
  credit_report_id uuid not null references public.credit_reports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  consent_version text not null,
  granted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint credit_consents_type_format check (consent_type ~ '^[a-z0-9_:.]+$')
);

create index if not exists credit_reports_user_id_idx on public.credit_reports (user_id);
create index if not exists credit_reports_passport_version_idx on public.credit_reports (passport_id, passport_version_id);
create index if not exists credit_report_documents_user_id_idx on public.credit_report_documents (user_id);
create index if not exists credit_verification_requests_user_id_idx on public.credit_verification_requests (user_id);
create index if not exists credit_verification_signals_report_id_idx on public.credit_verification_signals (credit_report_id);
create index if not exists credit_consents_user_id_idx on public.credit_consents (user_id);

drop trigger if exists set_credit_reports_updated_at on public.credit_reports;
create trigger set_credit_reports_updated_at
before update on public.credit_reports
for each row execute function public.set_updated_at();

drop trigger if exists set_credit_verification_signals_updated_at on public.credit_verification_signals;
create trigger set_credit_verification_signals_updated_at
before update on public.credit_verification_signals
for each row execute function public.set_updated_at();

alter table public.credit_providers enable row level security;
alter table public.credit_reports enable row level security;
alter table public.credit_report_documents enable row level security;
alter table public.credit_verification_requests enable row level security;
alter table public.credit_verification_signals enable row level security;
alter table public.credit_consents enable row level security;

drop policy if exists "Authenticated users can read credit providers" on public.credit_providers;
create policy "Authenticated users can read credit providers"
on public.credit_providers for select
to authenticated
using (true);

drop policy if exists "Users can manage own credit reports" on public.credit_reports;
create policy "Users can manage own credit reports"
on public.credit_reports for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own credit report documents" on public.credit_report_documents;
create policy "Users can manage own credit report documents"
on public.credit_report_documents for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own credit verification requests" on public.credit_verification_requests;
create policy "Users can manage own credit verification requests"
on public.credit_verification_requests for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own credit verification signals" on public.credit_verification_signals;
create policy "Users can manage own credit verification signals"
on public.credit_verification_signals for all
to authenticated
using (exists (select 1 from public.credit_reports where credit_reports.id = credit_verification_signals.credit_report_id and credit_reports.user_id = auth.uid()))
with check (exists (select 1 from public.credit_reports where credit_reports.id = credit_verification_signals.credit_report_id and credit_reports.user_id = auth.uid()));

drop policy if exists "Users can manage own credit consents" on public.credit_consents;
create policy "Users can manage own credit consents"
on public.credit_consents for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('credit-report-documents', 'credit-report-documents', false)
on conflict (id) do update set public = false;

drop policy if exists "Users can upload own credit report documents" on storage.objects;
create policy "Users can upload own credit report documents"
on storage.objects for insert
to authenticated
with check (bucket_id = 'credit-report-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can read own credit report documents" on storage.objects;
create policy "Users can read own credit report documents"
on storage.objects for select
to authenticated
using (bucket_id = 'credit-report-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update own credit report documents" on storage.objects;
create policy "Users can update own credit report documents"
on storage.objects for update
to authenticated
using (bucket_id = 'credit-report-documents' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'credit-report-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete own credit report documents" on storage.objects;
create policy "Users can delete own credit report documents"
on storage.objects for delete
to authenticated
using (bucket_id = 'credit-report-documents' and (storage.foldername(name))[1] = auth.uid()::text);
