import type { SecurityControl } from '@/types/launchReadiness';

export const securityControls: SecurityControl[] = [
  { key: 'encrypted_storage', label: 'Encrypted storage', status: 'documented', notes: 'Supabase private buckets and database metadata are used; provider-managed encryption must be verified before launch.' },
  { key: 'signed_urls', label: 'Signed URLs', status: 'implemented', notes: 'Document access services use private buckets and are prepared for short-lived signed URL/viewer sessions.' },
  { key: 'role_validation', label: 'Role validation', status: 'implemented', notes: 'Tenant, landlord, and internal reviewer routes use role-aware route gates and RLS policies.' },
  { key: 'least_privilege', label: 'Least privilege', status: 'configured', notes: 'RLS policies restrict access by ownership, invited email, or internal role.' },
  { key: 'session_management', label: 'Session management', status: 'implemented', notes: 'Supabase auth session persistence and secure logout are implemented.' },
  { key: 'csrf', label: 'CSRF protection', status: 'documented', notes: 'API mutation endpoints remain placeholders; future cookie-based APIs require explicit CSRF tokens.' },
  { key: 'cors', label: 'CORS review', status: 'documented', notes: 'Vercel headers document origin policy; future API function must enforce allowlists per client.' },
  { key: 'content_security_policy', label: 'Content Security Policy', status: 'configured', notes: 'Vercel security headers include a CSP baseline for app, Supabase, Google OAuth, and inline Vite style requirements.' },
  { key: 'rate_limiting', label: 'Rate limiting', status: 'documented', notes: 'API rate-limit records and middleware keys exist; production enforcement remains future backend work.' },
  { key: 'audit_logging', label: 'Audit logging', status: 'implemented', notes: 'Verification, sharing, API, and admin workflows have audit/activity foundations.' },
  { key: 'penetration_testing', label: 'Penetration testing', status: 'future_review_required', notes: 'External penetration test is required before broad public launch.' },
];

export function getSecurityLaunchBlockers() {
  return securityControls.filter((control) => control.status === 'future_review_required');
}
