export const auditCoverage = [
  { event: 'Login', status: 'supabase_auth_log_required', notes: 'Confirm Supabase auth log export before production.' },
  { event: 'Logout', status: 'implemented_in_app_state', notes: 'Logout clears app session; central audit export remains provider-level.' },
  { event: 'Password changes', status: 'supabase_auth_log_required', notes: 'Confirm Supabase auth event retention.' },
  { event: 'Consent updates', status: 'implemented', notes: 'Consent records are stored across auth, profile, and verification workflows.' },
  { event: 'Document uploads', status: 'implemented', notes: 'Module services write document metadata and passport activity.' },
  { event: 'Verification actions', status: 'implemented', notes: 'Reviewer decisions write verification decisions, activity, and audit logs.' },
  { event: 'Passport shares', status: 'implemented', notes: 'Secure sharing writes share records and passport activity.' },
  { event: 'Landlord access', status: 'implemented', notes: 'Share access logs track secure access and section views.' },
  { event: 'API access', status: 'foundation_ready', notes: 'API logs table and logging helper exist; production handlers must write on every request.' },
  { event: 'Reviewer actions', status: 'implemented', notes: 'Reviewer activity records assignments, notes, checklists, requests, decisions, and fraud flags.' },
  { event: 'Administration', status: 'foundation_ready', notes: 'Internal portal route and RLS exist; future admin tooling must add audit writes.' },
];
