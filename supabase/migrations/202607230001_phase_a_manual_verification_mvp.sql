-- Phase A manual verification MVP.
-- Scope: guided onboarding, versioned consent metadata, private evidence registry,
-- manual outreach workflows, manual credit operations, landlord information requests,
-- and audit-ready operational records. This migration does not implement provider APIs.

alter type public.passport_section_status add value if not exists 'in_progress';
alter type public.passport_section_status add value if not exists 'under_review';
alter type public.passport_section_status add value if not exists 'needs_more_information';
alter type public.passport_section_status add value if not exists 'expired';

alter type public.passport_verification_state add value if not exists 'under_review';
alter type public.passport_verification_state add value if not exists 'needs_more_information';
alter type public.passport_verification_state add value if not exists 'expired';
alter type public.passport_verification_state add value if not exists 'unable_to_verify';

alter type public.passport_activity_event add value if not exists 'consent_recorded';
alter type public.passport_activity_event add value if not exists 'consent_withdrawn';
alter type public.passport_activity_event add value if not exists 'document_uploaded';
alter type public.passport_activity_event add value if not exists 'document_viewed';
alter type public.passport_activity_event add value if not exists 'outreach_invitation_sent';
alter type public.passport_activity_event add value if not exists 'outreach_response_received';
alter type public.passport_activity_event add value if not exists 'outreach_reminder_sent';
alter type public.passport_activity_event add value if not exists 'credit_authorized';
alter type public.passport_activity_event add value if not exists 'credit_provider_work_item_created';
alter type public.passport_activity_event add value if not exists 'landlord_information_requested';
alter type public.passport_activity_event add value if not exists 'reverification_required';

do $$
begin
  alter type public.verification_type add value if not exists 'missing_information';
  alter type public.verification_type add value if not exists 'reverification';
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.onboarding_stage_key as enum (
    'account_contact',
    'applicant_household',
    'identity',
    'employment_income',
    'rental_history',
    'references',
    'credit',
    'supporting_documents',
    'consent_declarations',
    'review_verification_choice'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.onboarding_stage_status as enum ('missing', 'incomplete', 'complete');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.evidence_document_status as enum ('uploaded', 'needs_review', 'accepted', 'rejected', 'superseded', 'soft_deleted');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.evidence_sensitivity as enum ('low', 'medium', 'high', 'restricted');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.outreach_type as enum ('employer', 'previous_landlord', 'property_manager', 'reference');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.outreach_status as enum ('draft', 'sent', 'responded', 'reminder_due', 'expired', 'escalated', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.credit_workflow_status as enum (
    'not_requested',
    'authorization_required',
    'payment_required',
    'authorized',
    'pending_provider_check',
    'report_received',
    'under_review',
    'verified',
    'needs_more_information',
    'expired',
    'refresh_requested',
    'unable_to_complete'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.landlord_request_status as enum ('requested', 'tenant_viewed', 'tenant_completed', 'resolved', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.onboarding_stage_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  stage_key public.onboarding_stage_key not null,
  section_key public.passport_section_key,
  status public.onboarding_stage_status not null default 'missing',
  required boolean not null default true,
  progress integer not null default 0,
  missing_items text[] not null default '{}'::text[],
  draft jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  last_autosaved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (passport_version_id, stage_key),
  constraint onboarding_stage_progress_range check (progress between 0 and 100)
);

alter table public.consent_records
  add column if not exists passport_id uuid references public.passports(id) on delete set null,
  add column if not exists passport_version_id uuid references public.passport_versions(id) on delete set null,
  add column if not exists purpose text,
  add column if not exists consent_text_snapshot text,
  add column if not exists ip_address inet,
  add column if not exists user_agent text,
  add column if not exists device_metadata jsonb not null default '{}'::jsonb,
  add column if not exists withdrawn_at timestamptz,
  add column if not exists withdrawal_reason text;

create table if not exists public.evidence_documents (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  section_key public.passport_section_key not null,
  document_type text not null,
  storage_bucket text not null,
  storage_path text not null,
  original_filename text not null,
  content_type text,
  size_bytes bigint,
  sensitivity public.evidence_sensitivity not null default 'high',
  status public.evidence_document_status not null default 'uploaded',
  landlord_visible boolean not null default false,
  download_allowed boolean not null default false,
  soft_deleted_at timestamptz,
  retention_until timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint evidence_documents_private_by_default check (
    not landlord_visible or download_allowed = false
  )
);

create table if not exists public.evidence_access_logs (
  id uuid primary key default gen_random_uuid(),
  evidence_document_id uuid not null references public.evidence_documents(id) on delete cascade,
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  access_reason text not null,
  access_mode text not null default 'internal_signed_view',
  signed_url_expires_at timestamptz,
  landlord_application_id uuid references public.landlord_applications(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint evidence_access_mode_check check (access_mode in ('internal_signed_view', 'tenant_view', 'landlord_view_only'))
);

create table if not exists public.verification_outreach (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  verification_case_id uuid references public.verification_cases(id) on delete set null,
  applicant_user_id uuid not null references auth.users(id) on delete cascade,
  section_key public.passport_section_key not null,
  outreach_type public.outreach_type not null,
  recipient_name text not null,
  recipient_email text not null,
  recipient_organization text,
  response_token_hash text not null unique,
  status public.outreach_status not null default 'draft',
  sent_at timestamptz,
  reminder_count integer not null default 0,
  last_reminder_at timestamptz,
  expires_at timestamptz not null,
  responded_at timestamptz,
  reviewer_flags jsonb not null default '{}'::jsonb,
  company_domain text,
  company_website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verification_outreach_email_lower check (recipient_email = lower(recipient_email)),
  constraint verification_outreach_reminder_count_range check (reminder_count between 0 and 10)
);

create table if not exists public.verification_outreach_responses (
  id uuid primary key default gen_random_uuid(),
  outreach_id uuid not null references public.verification_outreach(id) on delete cascade,
  respondent_name text not null,
  respondent_title text,
  respondent_email text,
  structured_response jsonb not null default '{}'::jsonb,
  reviewer_notes text,
  ip_address inet,
  user_agent text,
  received_at timestamptz not null default now()
);

create table if not exists public.manual_credit_operations (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  applicant_user_id uuid not null references auth.users(id) on delete cascade,
  credit_report_id uuid references public.credit_reports(id) on delete set null,
  verification_case_id uuid references public.verification_cases(id) on delete set null,
  status public.credit_workflow_status not null default 'authorization_required',
  authorization_consent_id uuid references public.consent_records(id) on delete set null,
  payment_reference text,
  provider_name text,
  provider_summary jsonb not null default '{}'::jsonb,
  evidence_document_id uuid references public.evidence_documents(id) on delete set null,
  assigned_reviewer_id uuid references auth.users(id) on delete set null,
  verification_date date,
  expires_at timestamptz,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.landlord_information_requests (
  id uuid primary key default gen_random_uuid(),
  landlord_application_id uuid not null references public.landlord_applications(id) on delete cascade,
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  tenant_user_id uuid not null references auth.users(id) on delete cascade,
  landlord_user_id uuid references auth.users(id) on delete set null,
  section_key public.passport_section_key not null,
  request_type text not null,
  message text not null,
  status public.landlord_request_status not null default 'requested',
  tenant_route text not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists onboarding_stage_user_idx on public.onboarding_stage_progress (user_id, passport_version_id);
create index if not exists onboarding_stage_passport_idx on public.onboarding_stage_progress (passport_id, stage_key);
create index if not exists evidence_documents_owner_idx on public.evidence_documents (owner_user_id, passport_version_id);
create index if not exists evidence_documents_section_idx on public.evidence_documents (passport_id, section_key, status);
create index if not exists evidence_access_document_idx on public.evidence_access_logs (evidence_document_id, created_at desc);
create index if not exists verification_outreach_case_idx on public.verification_outreach (verification_case_id, status);
create index if not exists verification_outreach_applicant_idx on public.verification_outreach (applicant_user_id, section_key);
create index if not exists manual_credit_operations_applicant_idx on public.manual_credit_operations (applicant_user_id, status);
create index if not exists landlord_information_requests_application_idx on public.landlord_information_requests (landlord_application_id, status);
create index if not exists landlord_information_requests_tenant_idx on public.landlord_information_requests (tenant_user_id, status);

drop trigger if exists update_onboarding_stage_progress_updated_at on public.onboarding_stage_progress;
create trigger update_onboarding_stage_progress_updated_at before update on public.onboarding_stage_progress for each row execute function public.set_updated_at();

drop trigger if exists update_evidence_documents_updated_at on public.evidence_documents;
create trigger update_evidence_documents_updated_at before update on public.evidence_documents for each row execute function public.set_updated_at();

drop trigger if exists update_verification_outreach_updated_at on public.verification_outreach;
create trigger update_verification_outreach_updated_at before update on public.verification_outreach for each row execute function public.set_updated_at();

drop trigger if exists update_manual_credit_operations_updated_at on public.manual_credit_operations;
create trigger update_manual_credit_operations_updated_at before update on public.manual_credit_operations for each row execute function public.set_updated_at();

drop trigger if exists update_landlord_information_requests_updated_at on public.landlord_information_requests;
create trigger update_landlord_information_requests_updated_at before update on public.landlord_information_requests for each row execute function public.set_updated_at();

alter table public.onboarding_stage_progress enable row level security;
alter table public.evidence_documents enable row level security;
alter table public.evidence_access_logs enable row level security;
alter table public.verification_outreach enable row level security;
alter table public.verification_outreach_responses enable row level security;
alter table public.manual_credit_operations enable row level security;
alter table public.landlord_information_requests enable row level security;

drop policy if exists "Users can manage own onboarding progress" on public.onboarding_stage_progress;
create policy "Users can manage own onboarding progress" on public.onboarding_stage_progress
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Internal staff can read onboarding progress" on public.onboarding_stage_progress;
create policy "Internal staff can read onboarding progress" on public.onboarding_stage_progress
  for select to authenticated
  using (public.is_internal_verification_user());

drop policy if exists "Users can manage own evidence registry" on public.evidence_documents;
create policy "Users can manage own evidence registry" on public.evidence_documents
  for all to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "Internal staff can read evidence registry" on public.evidence_documents;
create policy "Internal staff can read evidence registry" on public.evidence_documents
  for select to authenticated
  using (public.is_internal_verification_user());

drop policy if exists "Landlords can read permitted evidence metadata" on public.evidence_documents;
create policy "Landlords can read permitted evidence metadata" on public.evidence_documents
  for select to authenticated
  using (
    landlord_visible = true
    and exists (
      select 1 from public.landlord_applications app
      where app.passport_id = evidence_documents.passport_id
        and app.passport_version_id = evidence_documents.passport_version_id
        and app.landlord_email = lower(auth.jwt() ->> 'email')
    )
  );

drop policy if exists "Evidence access logs visible to owner or internal staff" on public.evidence_access_logs;
create policy "Evidence access logs visible to owner or internal staff" on public.evidence_access_logs
  for select to authenticated
  using (
    public.is_internal_verification_user()
    or exists (
      select 1 from public.passports p
      where p.id = evidence_access_logs.passport_id
        and p.owner_user_id = auth.uid()
    )
  );

drop policy if exists "Authenticated actors can create evidence access logs" on public.evidence_access_logs;
create policy "Authenticated actors can create evidence access logs" on public.evidence_access_logs
  for insert to authenticated
  with check (actor_user_id = auth.uid() or public.is_internal_verification_user());

drop policy if exists "Users can read own outreach" on public.verification_outreach;
create policy "Users can read own outreach" on public.verification_outreach
  for select to authenticated
  using (applicant_user_id = auth.uid() or public.is_internal_verification_user());

drop policy if exists "Internal staff can manage outreach" on public.verification_outreach;
create policy "Internal staff can manage outreach" on public.verification_outreach
  for all to authenticated
  using (public.is_internal_verification_user())
  with check (public.is_internal_verification_user());

drop policy if exists "Internal staff can read outreach responses" on public.verification_outreach_responses;
create policy "Internal staff can read outreach responses" on public.verification_outreach_responses
  for select to authenticated
  using (public.is_internal_verification_user());

drop policy if exists "Internal staff can manage manual credit operations" on public.manual_credit_operations;
create policy "Internal staff can manage manual credit operations" on public.manual_credit_operations
  for all to authenticated
  using (public.is_internal_verification_user())
  with check (public.is_internal_verification_user());

drop policy if exists "Users can read own manual credit operations" on public.manual_credit_operations;
create policy "Users can read own manual credit operations" on public.manual_credit_operations
  for select to authenticated
  using (applicant_user_id = auth.uid());

drop policy if exists "Landlord requests visible to involved parties" on public.landlord_information_requests;
create policy "Landlord requests visible to involved parties" on public.landlord_information_requests
  for select to authenticated
  using (
    tenant_user_id = auth.uid()
    or landlord_user_id = auth.uid()
    or public.is_internal_verification_user()
  );

drop policy if exists "Landlords can create requests for their applications" on public.landlord_information_requests;
create policy "Landlords can create requests for their applications" on public.landlord_information_requests
  for insert to authenticated
  with check (
    landlord_user_id = auth.uid()
    and exists (
      select 1 from public.landlord_applications app
      where app.id = landlord_application_id
        and app.landlord_email = lower(auth.jwt() ->> 'email')
    )
  );

drop policy if exists "Tenants can resolve their landlord requests" on public.landlord_information_requests;
create policy "Tenants can resolve their landlord requests" on public.landlord_information_requests
  for update to authenticated
  using (tenant_user_id = auth.uid())
  with check (tenant_user_id = auth.uid());
