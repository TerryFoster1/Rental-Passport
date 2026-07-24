-- Phase A.2 complete manual verification workflows.
-- Scope: storage bucket defaults, outreach state machine, email/notification audit,
-- external response handling, richer verification decisions, manual phone confirmation,
-- and controlled evidence access metadata. No automated providers or AI decisions.

alter type public.outreach_status add value if not exists 'ready_to_send';
alter type public.outreach_status add value if not exists 'delivered';
alter type public.outreach_status add value if not exists 'delivery_failed';
alter type public.outreach_status add value if not exists 'opened';
alter type public.outreach_status add value if not exists 'started';
alter type public.outreach_status add value if not exists 'completed';
alter type public.outreach_status add value if not exists 'revoked';
alter type public.outreach_status add value if not exists 'reminder_sent';
alter type public.outreach_status add value if not exists 'manual_follow_up_required';

alter type public.verification_decision_type add value if not exists 'unable_to_verify';
alter type public.verification_decision_type add value if not exists 'needs_reverification';
alter type public.verification_decision_type add value if not exists 'expired';

alter type public.verification_case_status add value if not exists 'unable_to_verify';
alter type public.verification_case_status add value if not exists 'needs_reverification';
alter type public.verification_case_status add value if not exists 'expired';

alter type public.passport_activity_event add value if not exists 'verification_status_updated';
alter type public.passport_activity_event add value if not exists 'phone_confirmation_recorded';
alter type public.passport_activity_event add value if not exists 'phone_confirmation_reset';
alter type public.passport_activity_event add value if not exists 'tenant_notification_created';
alter type public.passport_activity_event add value if not exists 'evidence_access_denied';

do $$
begin
  create type public.notification_type as enum (
    'employer_invitation_sent',
    'landlord_invitation_sent',
    'reference_invitation_sent',
    'response_received',
    'verification_under_review',
    'more_information_requested',
    'credit_authorization_needed',
    'credit_pending',
    'section_verified',
    'unable_to_verify',
    'verification_expiring',
    'reverification_required'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.email_delivery_status as enum ('queued', 'sent', 'delivered', 'failed', 'suppressed', 'skipped_test_mode');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.phone_confirmation_status as enum ('unconfirmed', 'confirmed', 'expired', 'reset');
exception
  when duplicate_object then null;
end $$;

alter table public.verification_outreach
  add column if not exists revoked_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists opened_at timestamptz,
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists delivery_failure_reason text,
  add column if not exists idempotency_key text,
  add column if not exists response_editable_until timestamptz;

create unique index if not exists verification_outreach_idempotency_idx
  on public.verification_outreach (idempotency_key)
  where idempotency_key is not null;

alter table public.verification_decisions
  add column if not exists passport_id uuid references public.passports(id) on delete cascade,
  add column if not exists passport_version_id uuid references public.passport_versions(id) on delete cascade,
  add column if not exists section_key public.passport_section_key,
  add column if not exists checklist_snapshot jsonb not null default '[]'::jsonb,
  add column if not exists evidence_used jsonb not null default '[]'::jsonb,
  add column if not exists verification_methods text[] not null default '{}'::text[],
  add column if not exists landlord_safe_summary text,
  add column if not exists internal_notes text,
  add column if not exists expiry_date date,
  add column if not exists override_used boolean not null default false,
  add column if not exists override_reason text;

create table if not exists public.verification_email_events (
  id uuid primary key default gen_random_uuid(),
  outreach_id uuid references public.verification_outreach(id) on delete cascade,
  verification_case_id uuid references public.verification_cases(id) on delete set null,
  passport_id uuid references public.passports(id) on delete cascade,
  passport_version_id uuid references public.passport_versions(id) on delete cascade,
  recipient_email text not null,
  template_key text not null,
  delivery_status public.email_delivery_status not null default 'queued',
  provider_message_id text,
  error_message text,
  idempotency_key text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  constraint verification_email_events_email_lower check (recipient_email = lower(recipient_email))
);

create unique index if not exists verification_email_events_idempotency_idx
  on public.verification_email_events (idempotency_key)
  where idempotency_key is not null;

create table if not exists public.tenant_notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_user_id uuid not null references auth.users(id) on delete cascade,
  passport_id uuid references public.passports(id) on delete cascade,
  passport_version_id uuid references public.passport_versions(id) on delete cascade,
  section_key public.passport_section_key,
  notification_type public.notification_type not null,
  title text not null,
  body text not null,
  action_route text,
  status text not null default 'unread',
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint tenant_notifications_status_check check (status in ('unread', 'read', 'archived'))
);

create table if not exists public.phone_confirmation_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phone_number text not null,
  status public.phone_confirmation_status not null default 'unconfirmed',
  method text,
  confirmed_by_user_id uuid references auth.users(id) on delete set null,
  confirmed_at timestamptz,
  expires_at timestamptz,
  reset_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.evidence_access_logs
  add column if not exists decision text not null default 'granted',
  add column if not exists denial_reason text,
  add column if not exists role_context text,
  add column if not exists request_metadata jsonb not null default '{}'::jsonb;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('identity-documents', 'identity-documents', false, 10485760, array['image/jpeg','image/png','application/pdf']),
  ('credit-report-documents', 'credit-report-documents', false, 10485760, array['application/pdf','image/jpeg','image/png']),
  ('passport-evidence', 'passport-evidence', false, 10485760, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create index if not exists tenant_notifications_tenant_idx on public.tenant_notifications (tenant_user_id, status, created_at desc);
create index if not exists verification_email_events_outreach_idx on public.verification_email_events (outreach_id, created_at desc);
create index if not exists phone_confirmation_records_user_idx on public.phone_confirmation_records (user_id, created_at desc);

drop trigger if exists update_phone_confirmation_records_updated_at on public.phone_confirmation_records;
create trigger update_phone_confirmation_records_updated_at before update on public.phone_confirmation_records for each row execute function public.set_updated_at();

alter table public.verification_email_events enable row level security;
alter table public.tenant_notifications enable row level security;
alter table public.phone_confirmation_records enable row level security;

drop policy if exists "Internal staff can manage verification email events" on public.verification_email_events;
create policy "Internal staff can manage verification email events" on public.verification_email_events
  for all to authenticated
  using (public.is_internal_verification_user())
  with check (public.is_internal_verification_user());

drop policy if exists "Tenants can read own notifications" on public.tenant_notifications;
create policy "Tenants can read own notifications" on public.tenant_notifications
  for select to authenticated
  using (tenant_user_id = (select auth.uid()));

drop policy if exists "Internal staff can create tenant notifications" on public.tenant_notifications;
create policy "Internal staff can create tenant notifications" on public.tenant_notifications
  for insert to authenticated
  with check (public.is_internal_verification_user());

drop policy if exists "Tenants can update own notification read state" on public.tenant_notifications;
create policy "Tenants can update own notification read state" on public.tenant_notifications
  for update to authenticated
  using (tenant_user_id = (select auth.uid()))
  with check (tenant_user_id = (select auth.uid()));

drop policy if exists "Users can read own phone confirmation records" on public.phone_confirmation_records;
create policy "Users can read own phone confirmation records" on public.phone_confirmation_records
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Internal staff can manage phone confirmation records" on public.phone_confirmation_records;
create policy "Internal staff can manage phone confirmation records" on public.phone_confirmation_records
  for all to authenticated
  using (public.is_internal_verification_user())
  with check (public.is_internal_verification_user());

drop policy if exists "Tenants can upload private identity evidence" on storage.objects;
create policy "Tenants can upload private identity evidence" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('identity-documents', 'credit-report-documents', 'passport-evidence')
    and split_part(name, '/', 1) = 'tenant'
    and split_part(name, '/', 2) = (select auth.uid())::text
  );

drop policy if exists "Tenants can read own private evidence objects" on storage.objects;
create policy "Tenants can read own private evidence objects" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('identity-documents', 'credit-report-documents', 'passport-evidence')
    and split_part(name, '/', 1) = 'tenant'
    and split_part(name, '/', 2) = (select auth.uid())::text
  );

drop policy if exists "Internal staff can read private evidence objects" on storage.objects;
create policy "Internal staff can read private evidence objects" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('identity-documents', 'credit-report-documents', 'passport-evidence')
    and public.is_internal_verification_user()
  );
