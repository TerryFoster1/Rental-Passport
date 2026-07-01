# Coding Standards

## Product Guardrails

- Do not introduce Applicant Score or Tenant Score concepts.
- Do not implement approval recommendations or desirability ranking.
- Use Passport Completeness for supplied and independently verified information.
- Use section verification states for Identity, Employment, Income, Rental History, References, Credit Report, and Documents.
- Use Document Integrity Assessment for AI fraud outputs.
- Keep business logic, compliance rules, permissions, and verification workflows behind backend APIs.

## Frontend Standards

- Keep React components presentation-focused.
- Prefer clear, document-style layouts over dashboard complexity.
- Use accessible status labels, not color-only indicators.
- Show verification evidence plainly.
- Keep raw document access out of landlord-facing UI unless an explicit future permission flow exists.

## TypeScript Standards

- Prefer explicit domain types for verification status, passport version, permissions, and jurisdiction.
- Avoid untyped stringly-coded workflow state once backend contracts exist.
- Keep API DTOs separate from UI view models.

## Current Scope

These standards are planning guidance. Backend contracts and implementation-specific rules will be expanded when APIs and schemas are designed.
