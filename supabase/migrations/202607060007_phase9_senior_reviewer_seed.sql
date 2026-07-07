-- Phase 9 senior reviewer role seed.
-- This is intentionally separate from the enum migration so PostgreSQL can commit
-- the new user_role enum value before it is used in role and permission rows.

insert into public.roles (name, description) values
  ('senior_reviewer', 'Senior internal reviewer for escalations and quality review.')
on conflict (name) do update set description = excluded.description;

insert into public.role_permissions (role, permission_key) values
  ('senior_reviewer', 'verification:queue:read'),
  ('senior_reviewer', 'verification:case:read'),
  ('senior_reviewer', 'verification:case:update'),
  ('senior_reviewer', 'verification:decision:create'),
  ('senior_reviewer', 'verification:fraud:create')
on conflict do nothing;
