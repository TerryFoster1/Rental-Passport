# Database Blueprint

This is an implementation-ready database blueprint. It defines entities, relationships, constraints, indexes, audit strategy, storage, and permissions.

Phase 1 now includes an initial SQL migration for the account foundation only:

- `profiles`
- `roles`
- `user_roles`
- `permissions`
- `role_permissions`
- `consent_records`
- `audit_logs`

Phase 2 adds the passport framework:

- `passports`
- `passport_versions`
- `passport_section_statuses`
- `passport_activity_logs`

Phase 3 adds the employment module foundation:

- `employment_records`
- `employment_contacts`
- `employment_documents`
- `employment_verification_requests`
- `employment_verification_signals`

Deep rental history, references, credit, identity, sharing tables, application tables, and integration tables remain future-phase work.

## Data Philosophy

Rental Passport stores sensitive identity, document, verification, and application data. The data model must be privacy-first, auditable, versioned, consent-aware, jurisdiction-aware, and protected by Row Level Security.

The database must never encode tenant desirability scores, applicant rankings, or approval recommendations.

## Core Entities

### users

Represents authenticated people and service identities.

Key fields: id, email, phone, display_name, user_type, status, created_at, updated_at.

Relationships: one user may have tenant profile, landlord profile, reviewer profile, support profile, or administrator role assignments.

Indexes: email unique, phone, status.

### tenant_profiles

Represents renter-owned identity profile.

Key fields: id, user_id, legal_name, preferred_name, date_of_birth, primary_region_id, created_at, updated_at.

Relationships: belongs to user; owns passports.

### landlord_profiles

Represents landlord or property manager access identity.

Key fields: id, user_id, organization_name, verified_email_domain, status.

Relationships: belongs to user; may belong to organizations; receives applications.

### organizations

Represents property management companies, brokerages, enterprise partners, or reviewer operations groups.

Key fields: id, name, type, region_id, status.

### passports

Represents renter-owned reusable rental identity.

Key fields: id, tenant_profile_id, current_version_id, status, created_at, updated_at.

Relationships: has many passport_versions, share_tokens, applications, activity_events.

### passport_versions

Represents immutable version snapshots.

Key fields: id, passport_id, version_number, completeness_state, completed_at, verified_at, expires_at, created_at.

Completeness states: 100% Complete and Verified, Partially Verified, In Progress.

### passport_sections

Represents section state per passport version.

Key fields: id, passport_version_id, section_type, status, confidence_level, expires_at, needs_reverification_reason.

Section types: identity, employment, income, rental_history, references, credit_report, documents.

Statuses: Verified, Self Reported, Needs Review, Needs Verification, Expired, Needs Reverification, Missing.

### documents

Represents metadata for uploaded documents. Raw files live in secure storage.

Key fields: id, owner_user_id, passport_id, document_type, storage_bucket, storage_path, checksum, encrypted, status, created_at.

Document types include ID front, ID back, selfie, pay stub, employment letter, credit report, lease, payment proof, bank proof, reference response, supporting document.

### document_versions

Represents immutable document revisions.

Key fields: id, document_id, version_number, storage_path, checksum, uploaded_at, superseded_at.

### verification_cases

Represents internal manual review work.

Key fields: id, passport_version_id, section_type, queue, assigned_reviewer_id, status, priority, sla_due_at, created_at, updated_at.

### verification_records

Represents final verification outcomes.

Key fields: id, verification_case_id, passport_section_id, method, status, confidence_level, verified_by, verified_at, expires_at, reverification_required_at.

### evidence_records

Represents evidence reviewed for a verification.

Key fields: id, verification_record_id, evidence_type, document_id, source, strength, landlord_visible_summary, internal_summary.

### reviewer_notes

Internal-only notes.

Key fields: id, verification_case_id, author_user_id, visibility, note, created_at.

Visibility: internal_only, compliance_only, tenant_visible_summary, landlord_visible_summary.

### fraud_flags

Evidence integrity flags.

Key fields: id, passport_id, verification_case_id, flag_type, severity, status, created_by, created_at, resolved_at.

### document_integrity_assessments

AI or manual evidence integrity outputs.

Key fields: id, document_id, assessment_type, confidence, findings, reviewer_confirmed, created_at.

### share_tokens

Recipient-specific sharing grants.

Key fields: id, passport_id, intended_recipient_email, token_hash, status, expires_at, revoked_at, created_by, created_at.

Constraints: token hashes unique; active token must include intended recipient and expiry.

### document_viewer_grants

View-only access to specific supporting documents.

Key fields: id, document_id, share_token_id, recipient_user_id, expires_at, revoked_at, watermark_enabled, view_only.

### access_logs

Records access attempts and successful views.

Key fields: id, actor_user_id, share_token_id, resource_type, resource_id, action, ip_hash, user_agent_hash, device_session_id, created_at.

### consent_records

Records tenant consent.

Key fields: id, user_id, passport_id, consent_type, consent_text_version, granted_at, revoked_at, ip_hash.

### applications

Represents a passport shared for a specific rental opportunity.

Key fields: id, passport_id, landlord_profile_id, property_id, advertised_rent, status, applied_at, accepted_at, withdrawn_at, archived_at.

### application_status_events

Append-only status history.

Key fields: id, application_id, from_status, to_status, actor_user_id, reason, created_at.

### activity_events

Tenant-visible and internal audit activity.

Key fields: id, passport_id, actor_user_id, event_type, resource_type, resource_id, visibility, created_at.

### regions

Jurisdiction model.

Key fields: id, country, province_state, territory, municipality, legal_config_version.

### compliance_rules

Legal question, filter, lease, and workflow controls.

Key fields: id, region_id, rule_type, rule_key, allowed, config, legal_review_required, effective_at.

### integration_clients

Partner and enterprise API clients.

Key fields: id, organization_id, client_name, client_type, status, scopes, redirect_uris.

### webhook_subscriptions

Partner event delivery.

Key fields: id, integration_client_id, event_type, endpoint_url, signing_secret_ref, status.

### lease_templates

Jurisdiction-specific lease templates.

Key fields: id, region_id, template_name, version, status, legal_reviewed_at.

### executed_leases

Signed lease records.

Key fields: id, application_id, lease_template_id, storage_path, executed_at, status.

### verified_deposits

Future legal-review-required escrow feature.

Key fields: id, tenant_profile_id, provider, amount, currency, status, legal_region_id.

## Relationship Summary

- User -> Tenant Profile -> Passports -> Passport Versions -> Passport Sections
- Passport Version -> Verification Cases -> Verification Records -> Evidence Records
- Documents -> Document Versions -> Evidence Records
- Passport -> Share Tokens -> Access Logs
- Share Token -> Document Viewer Grants
- Passport -> Applications -> Application Status Events
- Regions -> Compliance Rules -> Application/Lease behavior
- Organizations -> Integration Clients -> Webhook Subscriptions

## Index Strategy

Required indexes:

- users.email unique
- passports.tenant_profile_id
- passport_versions.passport_id, version_number
- passport_sections.passport_version_id, section_type
- documents.owner_user_id, passport_id, document_type
- verification_cases.queue, status, assigned_reviewer_id, sla_due_at
- verification_records.passport_section_id, status, expires_at
- share_tokens.token_hash unique, intended_recipient_email, expires_at, status
- access_logs.share_token_id, actor_user_id, created_at
- applications.landlord_profile_id, status, applied_at
- activity_events.passport_id, created_at
- compliance_rules.region_id, rule_type, rule_key

## Constraint Strategy

- Passport versions are immutable after publication.
- Verification records reference a passport version.
- Share tokens require expiry.
- Document viewer grants cannot outlive their share token.
- Raw documents cannot be attached to landlord downloads by default.
- Reviewer notes marked internal_only must never appear in landlord API responses.
- Application sorting cannot use desirability scoring fields because those fields must not exist.

## Audit Strategy

Audit every authentication, consent, upload, verification decision, share, document view, revocation, application status change, reviewer note, AI assessment, and administrative action.

Audit logs should be append-only or tamper-evident.

## Storage Strategy

Store raw documents in private Supabase Storage buckets. Database records store metadata only. Access must use short-lived signed URLs or controlled document viewer grants.

Buckets:

- identity-documents
- employment-documents
- income-documents
- rental-history-documents
- credit-documents
- reference-documents
- lease-documents
- generated-application-packages

## Permission Strategy

RLS must enforce tenant ownership, intended recipient access, reviewer queue access, support boundaries, compliance visibility, administrator controls, and enterprise API scopes.

## Current Scope

No migrations, database tables, policies, triggers, functions, or seed data are implemented yet.
