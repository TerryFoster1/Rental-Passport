-- Phase 9 internal verification portal.
-- Scope: internal staff case review, structured checklists, notes, decisions, fraud flags,
-- customer information requests, assignment history, and reviewer activity.

alter type public.user_role add value if not exists 'senior_reviewer';

alter type public.passport_activity_event add value if not exists 'verification_case_created';
alter type public.passport_activity_event add value if not exists 'verification_case_opened';
alter type public.passport_activity_event add value if not exists 'verification_checklist_updated';
alter type public.passport_activity_event add value if not exists 'verification_note_added';
alter type public.passport_activity_event add value if not exists 'verification_information_requested';
alter type public.passport_activity_event add value if not exists 'verification_section_approved';
alter type public.passport_activity_event add value if not exists 'verification_section_rejected';
alter type public.passport_activity_event add value if not exists 'verification_section_escalated';
alter type public.passport_activity_event add value if not exists 'verification_fraud_review';

do $$
begin
  create type public.verification_case_status as enum ('awaiting_review', 'in_review', 'awaiting_customer_response', 'approved', 'rejected', 'escalated', 'fraud_review');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.verification_priority as enum ('low', 'normal', 'high', 'urgent');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.verification_type as enum ('identity', 'employment', 'rental_history', 'references', 'credit', 'fraud');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.verification_decision_type as enum ('approve', 'reject', 'needs_more_information', 'escalate', 'fraud_review');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.fraud_flag_type as enum ('possible_fake_id', 'possible_fake_employer', 'possible_fake_landlord', 'possible_altered_document', 'possible_duplicate_account', 'identity_mismatch', 'other');
exception
  when duplicate_object then null;
end $$;

insert into public.permissions (key, description) values
  ('verification:queue:read', 'Read internal verification queues.'),
  ('verification:case:read', 'Read internal verification cases.'),
  ('verification:case:update', 'Update internal verification cases.'),
  ('verification:decision:create', 'Create verification decisions.'),
  ('verification:fraud:create', 'Create internal fraud flags.')
on conflict (key) do update set description = excluded.description;

insert into public.role_permissions (role, permission_key) values
  ('verification_reviewer', 'verification:queue:read'),
  ('verification_reviewer', 'verification:case:read'),
  ('verification_reviewer', 'verification:case:update'),
  ('verification_reviewer', 'verification:decision:create'),
  ('compliance', 'verification:queue:read'),
  ('compliance', 'verification:case:read'),
  ('compliance', 'verification:fraud:create'),
  ('support', 'verification:queue:read'),
  ('support', 'verification:case:read'),
  ('administrator', 'verification:queue:read'),
  ('administrator', 'verification:case:read'),
  ('administrator', 'verification:case:update'),
  ('administrator', 'verification:decision:create'),
  ('administrator', 'verification:fraud:create')
on conflict do nothing;

create or replace function public.is_internal_verification_user()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles role
    where role.user_id = auth.uid()
      and role.role::text in ('verification_reviewer', 'senior_reviewer', 'compliance', 'support', 'administrator')
  );
$$;

create table if not exists public.verification_cases (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.passports(id) on delete cascade,
  passport_version_id uuid not null references public.passport_versions(id) on delete cascade,
  applicant_user_id uuid not null references auth.users(id) on delete cascade,
  applicant_name text not null,
  passport_number text not null,
  section_key public.passport_section_key not null,
  verification_type public.verification_type not null,
  status public.verification_case_status not null default 'awaiting_review',
  priority public.verification_priority not null default 'normal',
  assigned_reviewer_id uuid references auth.users(id) on delete set null,
  assigned_reviewer_name text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verification_assignments (
  id uuid primary key default gen_random_uuid(),
  verification_case_id uuid not null references public.verification_cases(id) on delete cascade,
  assigned_to_user_id uuid references auth.users(id) on delete set null,
  assigned_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.verification_notes (
  id uuid primary key default gen_random_uuid(),
  verification_case_id uuid not null references public.verification_cases(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  body text not null,
  visibility text not null default 'internal_only',
  created_at timestamptz not null default now(),
  constraint verification_notes_visibility_check check (visibility = 'internal_only')
);

create table if not exists public.verification_checklists (
  id uuid primary key default gen_random_uuid(),
  verification_case_id uuid not null references public.verification_cases(id) on delete cascade,
  label text not null,
  checked boolean not null default false,
  required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verification_decisions (
  id uuid primary key default gen_random_uuid(),
  verification_case_id uuid not null references public.verification_cases(id) on delete cascade,
  reviewer_user_id uuid not null references auth.users(id) on delete cascade,
  decision public.verification_decision_type not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.fraud_flags (
  id uuid primary key default gen_random_uuid(),
  verification_case_id uuid not null references public.verification_cases(id) on delete cascade,
  flag_type public.fraud_flag_type not null,
  description text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fraud_flags_status_check check (status in ('open', 'reviewing', 'resolved', 'dismissed'))
);

create table if not exists public.customer_information_requests (
  id uuid primary key default gen_random_uuid(),
  verification_case_id uuid not null references public.verification_cases(id) on delete cascade,
  requested_item text not null,
  message text not null,
  status text not null default 'open',
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_information_requests_status_check check (status in ('open', 'fulfilled', 'cancelled'))
);

create table if not exists public.reviewer_activity (
  id uuid primary key default gen_random_uuid(),
  verification_case_id uuid not null references public.verification_cases(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  description text not null,
  created_at timestamptz not null default now(),
  constraint reviewer_activity_event_type_format check (event_type ~ '^[a-z0-9_:.]+$')
);

create table if not exists public.reviewer_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  reviewer_role text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (user_id, reviewer_role),
  constraint reviewer_roles_internal_only check (reviewer_role in ('verification_reviewer', 'senior_reviewer', 'compliance', 'support', 'administrator'))
);

create table if not exists public.case_history (
  id uuid primary key default gen_random_uuid(),
  verification_case_id uuid not null references public.verification_cases(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  from_status public.verification_case_status,
  to_status public.verification_case_status,
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists verification_cases_status_idx on public.verification_cases (status);
create index if not exists verification_cases_priority_idx on public.verification_cases (priority);
create index if not exists verification_cases_section_key_idx on public.verification_cases (section_key);
create index if not exists verification_cases_assigned_reviewer_idx on public.verification_cases (assigned_reviewer_id);
create index if not exists verification_cases_submitted_at_idx on public.verification_cases (submitted_at desc);
create index if not exists verification_notes_case_idx on public.verification_notes (verification_case_id, created_at desc);
create index if not exists verification_checklists_case_idx on public.verification_checklists (verification_case_id);
create index if not exists reviewer_activity_case_idx on public.reviewer_activity (verification_case_id, created_at desc);
create index if not exists fraud_flags_case_idx on public.fraud_flags (verification_case_id);
create index if not exists customer_information_requests_case_idx on public.customer_information_requests (verification_case_id);
create index if not exists case_history_case_idx on public.case_history (verification_case_id, created_at desc);

drop trigger if exists update_verification_cases_updated_at on public.verification_cases;
create trigger update_verification_cases_updated_at before update on public.verification_cases for each row execute function public.set_updated_at();

drop trigger if exists update_verification_checklists_updated_at on public.verification_checklists;
create trigger update_verification_checklists_updated_at before update on public.verification_checklists for each row execute function public.set_updated_at();

drop trigger if exists update_fraud_flags_updated_at on public.fraud_flags;
create trigger update_fraud_flags_updated_at before update on public.fraud_flags for each row execute function public.set_updated_at();

drop trigger if exists update_customer_information_requests_updated_at on public.customer_information_requests;
create trigger update_customer_information_requests_updated_at before update on public.customer_information_requests for each row execute function public.set_updated_at();

alter table public.verification_cases enable row level security;
alter table public.verification_assignments enable row level security;
alter table public.verification_notes enable row level security;
alter table public.verification_checklists enable row level security;
alter table public.verification_decisions enable row level security;
alter table public.fraud_flags enable row level security;
alter table public.customer_information_requests enable row level security;
alter table public.reviewer_activity enable row level security;
alter table public.reviewer_roles enable row level security;
alter table public.case_history enable row level security;

drop policy if exists "Internal verification staff can manage cases" on public.verification_cases;
create policy "Internal verification staff can manage cases" on public.verification_cases for all
  using (public.is_internal_verification_user())
  with check (public.is_internal_verification_user());

drop policy if exists "Internal verification staff can manage assignments" on public.verification_assignments;
create policy "Internal verification staff can manage assignments" on public.verification_assignments for all
  using (public.is_internal_verification_user())
  with check (public.is_internal_verification_user());

drop policy if exists "Internal verification staff can manage notes" on public.verification_notes;
create policy "Internal verification staff can manage notes" on public.verification_notes for all
  using (public.is_internal_verification_user())
  with check (public.is_internal_verification_user());

drop policy if exists "Internal verification staff can manage checklists" on public.verification_checklists;
create policy "Internal verification staff can manage checklists" on public.verification_checklists for all
  using (public.is_internal_verification_user())
  with check (public.is_internal_verification_user());

drop policy if exists "Internal verification staff can manage decisions" on public.verification_decisions;
create policy "Internal verification staff can manage decisions" on public.verification_decisions for all
  using (public.is_internal_verification_user())
  with check (public.is_internal_verification_user());

drop policy if exists "Internal verification staff can manage fraud flags" on public.fraud_flags;
create policy "Internal verification staff can manage fraud flags" on public.fraud_flags for all
  using (public.is_internal_verification_user())
  with check (public.is_internal_verification_user());

drop policy if exists "Internal verification staff can manage customer requests" on public.customer_information_requests;
create policy "Internal verification staff can manage customer requests" on public.customer_information_requests for all
  using (public.is_internal_verification_user())
  with check (public.is_internal_verification_user());

drop policy if exists "Internal verification staff can manage reviewer activity" on public.reviewer_activity;
create policy "Internal verification staff can manage reviewer activity" on public.reviewer_activity for all
  using (public.is_internal_verification_user())
  with check (public.is_internal_verification_user());

drop policy if exists "Internal verification staff can read reviewer roles" on public.reviewer_roles;
create policy "Internal verification staff can read reviewer roles" on public.reviewer_roles for select
  using (public.is_internal_verification_user());

drop policy if exists "Internal verification staff can manage case history" on public.case_history;
create policy "Internal verification staff can manage case history" on public.case_history for all
  using (public.is_internal_verification_user())
  with check (public.is_internal_verification_user());

drop policy if exists "Internal staff can read internal audit logs" on public.audit_logs;
create policy "Internal staff can read internal audit logs" on public.audit_logs for select
  using (visibility in ('internal', 'security') and public.is_internal_verification_user());
