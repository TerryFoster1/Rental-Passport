-- Rental Passport Phase A.3 staging validation.
-- Run against the Supabase staging database after Phase A and Phase A.2 migrations.
-- This script reads metadata only and does not modify data.

with expected_tables(table_name) as (
  values
    ('onboarding_stage_progress'),
    ('evidence_documents'),
    ('evidence_access_logs'),
    ('verification_outreach'),
    ('verification_outreach_responses'),
    ('manual_credit_operations'),
    ('landlord_information_requests'),
    ('verification_email_events'),
    ('tenant_notifications'),
    ('phone_confirmation_records')
)
select
  'table_exists' as check_name,
  expected_tables.table_name,
  case when information_schema.tables.table_name is null then 'fail' else 'pass' end as result
from expected_tables
left join information_schema.tables
  on information_schema.tables.table_schema = 'public'
  and information_schema.tables.table_name = expected_tables.table_name
order by expected_tables.table_name;

with expected_tables(table_name) as (
  values
    ('onboarding_stage_progress'),
    ('evidence_documents'),
    ('evidence_access_logs'),
    ('verification_outreach'),
    ('verification_outreach_responses'),
    ('manual_credit_operations'),
    ('landlord_information_requests'),
    ('verification_email_events'),
    ('tenant_notifications'),
    ('phone_confirmation_records')
)
select
  'rls_enabled' as check_name,
  expected_tables.table_name,
  case when pg_class.relrowsecurity then 'pass' else 'fail' end as result
from expected_tables
join pg_class on pg_class.relname = expected_tables.table_name
join pg_namespace on pg_namespace.oid = pg_class.relnamespace
where pg_namespace.nspname = 'public'
order by expected_tables.table_name;

select
  'policy_count' as check_name,
  tablename as table_name,
  count(*)::text as result
from pg_policies
where schemaname = 'public'
  and tablename in (
    'onboarding_stage_progress',
    'evidence_documents',
    'evidence_access_logs',
    'verification_outreach',
    'verification_outreach_responses',
    'manual_credit_operations',
    'landlord_information_requests',
    'verification_email_events',
    'tenant_notifications',
    'phone_confirmation_records'
  )
group by tablename
order by tablename;

select
  'storage_bucket_private' as check_name,
  id as bucket_id,
  case when public = false then 'pass' else 'fail' end as result,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id in ('identity-documents', 'credit-report-documents', 'passport-evidence')
order by id;

select
  'storage_policy_count' as check_name,
  tablename as table_name,
  count(*)::text as result
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname in (
    'Tenants can upload private identity evidence',
    'Tenants can read own private evidence objects',
    'Internal staff can read private evidence objects'
  )
group by tablename;

with expected_enums(type_name, enum_label) as (
  values
    ('onboarding_stage_key', 'phone_verification'),
    ('onboarding_stage_key', 'manual_credit'),
    ('evidence_document_status', 'uploaded'),
    ('evidence_document_status', 'accepted'),
    ('outreach_status', 'sent'),
    ('outreach_status', 'responded'),
    ('credit_workflow_status', 'verified'),
    ('notification_type', 'external_response_received'),
    ('email_delivery_status', 'skipped_test_mode'),
    ('phone_confirmation_status', 'confirmed')
)
select
  'enum_label_exists' as check_name,
  expected_enums.type_name || '.' || expected_enums.enum_label as enum_value,
  case when pg_enum.enumlabel is null then 'fail' else 'pass' end as result
from expected_enums
left join pg_type on pg_type.typname = expected_enums.type_name
left join pg_enum on pg_enum.enumtypid = pg_type.oid
  and pg_enum.enumlabel = expected_enums.enum_label
order by expected_enums.type_name, expected_enums.enum_label;

select
  'data_api_exposure_review' as check_name,
  schemaname || '.' || tablename as table_name,
  'review grants in Supabase dashboard and confirm RLS-tested access only' as result
from pg_tables
where schemaname = 'public'
  and tablename in (
    'onboarding_stage_progress',
    'evidence_documents',
    'evidence_access_logs',
    'verification_outreach',
    'verification_outreach_responses',
    'manual_credit_operations',
    'landlord_information_requests',
    'verification_email_events',
    'tenant_notifications',
    'phone_confirmation_records'
  )
order by table_name;
