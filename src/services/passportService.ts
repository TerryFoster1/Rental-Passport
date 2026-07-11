import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type {
  Passport,
  PassportActivity,
  PassportSection,
  PassportSectionKey,
  PassportSectionStatus,
  PassportSummary,
  PassportVersion,
  PassportVerificationState,
} from '@/types/passport';

export const passportSectionDefinitions: Array<Pick<PassportSection, 'key' | 'name' | 'description' | 'route'>> = [
  {
    key: 'rental_history',
    name: 'Rental History',
    description: 'Show your rental track record in a clear, reusable format.',
    route: '/passport/rental-history',
  },
  {
    key: 'employment',
    name: 'Employment',
    description: 'Prepare employment and income readiness for future verification.',
    route: '/passport/employment',
  },
  {
    key: 'references',
    name: 'References',
    description: 'Organize people who can support your rental application.',
    route: '/passport/references',
  },
  {
    key: 'credit_report',
    name: 'Credit Report',
    description: 'Track credit report readiness without exposing full report details.',
    route: '/passport/credit-report',
  },
  {
    key: 'identity_confirmation',
    name: 'Identity Confirmation',
    description: 'Prepare identity confirmation status for a future verification phase.',
    route: '/passport/identity',
  },
];

export const initialSectionState: Record<PassportSectionKey, { status: PassportSectionStatus; verification_state: PassportVerificationState; progress: number }> = {
  rental_history: { status: 'not_started', verification_state: 'unverified', progress: 0 },
  employment: { status: 'in_progress', verification_state: 'pending_review', progress: 50 },
  references: { status: 'not_started', verification_state: 'unverified', progress: 0 },
  credit_report: { status: 'not_started', verification_state: 'unverified', progress: 0 },
  identity_confirmation: { status: 'not_started', verification_state: 'unverified', progress: 0 },
};

type PassportRow = {
  id: string;
  owner_user_id: string;
  passport_number: string;
  status: Passport['status'];
  current_version_id: string | null;
  draft_version_id: string | null;
  created_at: string;
  updated_at: string;
};

type VersionRow = {
  id: string;
  passport_id: string;
  version_number: number;
  status: PassportVersion['status'];
  created_at: string;
  updated_at: string;
};

type SectionRow = {
  section_key: PassportSectionKey;
  status: PassportSectionStatus;
  verification_state: PassportVerificationState;
  progress: number;
  last_updated_at: string | null;
  needs_reverification_at: string | null;
};

type ActivityRow = PassportActivity;

export function calculatePassportProgress(sections: PassportSection[]): PassportSummary['progress'] {
  const completeSections = sections.filter((section) => section.status === 'ready_for_review' || section.status === 'verified').length;
  const verifiedSections = sections.filter((section) => section.status === 'verified' && section.verification_state === 'verified').length;
  const missingSections = sections.filter((section) => section.status === 'not_started').length;
  const needsReverificationSections = sections.filter((section) => section.status === 'needs_reverification' || section.verification_state === 'needs_reverification').length;
  const overall = Math.round(sections.reduce((total, section) => total + section.progress, 0) / sections.length);

  return {
    overall,
    completeSections,
    verifiedSections,
    missingSections,
    needsReverificationSections,
  };
}

export async function getOrCreatePassportSummary(user: User): Promise<PassportSummary> {
  if (!supabase) return createDemoPassportSummary(user.id);

  const passport = await getOrCreatePassport(user);
  const draftVersion = await getOrCreateDraftVersion(passport);
  const sections = await getOrCreateSectionStatuses(passport, draftVersion);
  const activity = await getPassportActivity(passport.id);

  return {
    passport: { ...passport, draft_version_id: draftVersion.id },
    currentVersion: draftVersion,
    draftVersion,
    sections,
    activity,
    progress: calculatePassportProgress(sections),
  };
}

export async function updatePassportSectionStatus(user: User, sectionKey: PassportSectionKey, status: PassportSectionStatus): Promise<PassportSummary> {
  if (!supabase) {
    const demo = createDemoPassportSummary(user.id);
    return {
      ...demo,
      sections: demo.sections.map((section) => (section.key === sectionKey ? { ...section, status, progress: statusToProgress(status), last_updated_at: new Date().toISOString() } : section)),
    };
  }

  const passport = await getOrCreatePassport(user);
  const draftVersion = await getOrCreateDraftVersion(passport);

  const { error } = await supabase
    .from('passport_section_statuses')
    .update({
      status,
      progress: statusToProgress(status),
      verification_state: statusToVerificationState(status),
      last_updated_at: new Date().toISOString(),
      needs_reverification_at: status === 'needs_reverification' ? new Date().toISOString() : null,
    })
    .eq('passport_id', passport.id)
    .eq('passport_version_id', draftVersion.id)
    .eq('section_key', sectionKey);

  if (error) throw error;

  await recordPassportActivity(passport.id, user.id, status === 'in_progress' ? 'section_started' : 'section_updated', `${sectionLabel(sectionKey)} status changed.`);
  return getOrCreatePassportSummary(user);
}

async function getOrCreatePassport(user: User): Promise<PassportRow> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const existing = await supabase.from('passports').select('*').eq('owner_user_id', user.id).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data as PassportRow;

  const created = await supabase
    .from('passports')
    .insert({
      owner_user_id: user.id,
      passport_number: createPassportNumber(user.id),
      status: 'draft',
    })
    .select()
    .single();

  if (created.error) throw created.error;

  const passport = created.data as PassportRow;
  await recordPassportActivity(passport.id, user.id, 'passport_created', 'Passport framework created.');
  return passport;
}

async function getOrCreateDraftVersion(passport: PassportRow): Promise<VersionRow> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const existing = await supabase.from('passport_versions').select('*').eq('passport_id', passport.id).eq('status', 'draft').maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data as VersionRow;

  const latest = await supabase.from('passport_versions').select('version_number').eq('passport_id', passport.id).order('version_number', { ascending: false }).limit(1);
  if (latest.error) throw latest.error;

  const nextVersion = ((latest.data?.[0]?.version_number as number | undefined) ?? 0) + 1;
  const created = await supabase
    .from('passport_versions')
    .insert({
      passport_id: passport.id,
      version_number: nextVersion,
      status: 'draft',
    })
    .select()
    .single();

  if (created.error) throw created.error;

  const version = created.data as VersionRow;
  await supabase.from('passports').update({ draft_version_id: version.id, current_version_id: passport.current_version_id ?? version.id }).eq('id', passport.id);
  await recordPassportActivity(passport.id, passport.owner_user_id, 'passport_version_created', `Draft version ${nextVersion} created.`);
  return version;
}

async function getOrCreateSectionStatuses(passport: PassportRow, version: VersionRow): Promise<PassportSection[]> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const existing = await supabase.from('passport_section_statuses').select('*').eq('passport_id', passport.id).eq('passport_version_id', version.id);
  if (existing.error) throw existing.error;

  const existingKeys = new Set((existing.data ?? []).map((section) => section.section_key as PassportSectionKey));
  const missingRows = passportSectionDefinitions
    .filter((definition) => !existingKeys.has(definition.key))
    .map((definition) => ({
      passport_id: passport.id,
      passport_version_id: version.id,
      section_key: definition.key,
      status: initialSectionState[definition.key].status,
      verification_state: initialSectionState[definition.key].verification_state,
      progress: initialSectionState[definition.key].progress,
    }));

  if (missingRows.length > 0) {
    const inserted = await supabase.from('passport_section_statuses').insert(missingRows);
    if (inserted.error) throw inserted.error;
  }

  const refreshed = await supabase.from('passport_section_statuses').select('*').eq('passport_id', passport.id).eq('passport_version_id', version.id);
  if (refreshed.error) throw refreshed.error;

  return mergeSectionRows((refreshed.data ?? []) as SectionRow[]);
}

async function getPassportActivity(passportId: string): Promise<PassportActivity[]> {
  if (!supabase) return [];

  const { data, error } = await supabase.from('passport_activity_logs').select('*').eq('passport_id', passportId).order('created_at', { ascending: false }).limit(12);
  if (error) throw error;
  return (data ?? []) as ActivityRow[];
}

async function recordPassportActivity(passportId: string, actorUserId: string | null, eventType: PassportActivity['event_type'], description: string) {
  if (!supabase) return;

  await supabase.from('passport_activity_logs').insert({
    passport_id: passportId,
    actor_user_id: actorUserId,
    event_type: eventType,
    description,
    visibility: 'internal',
  });
}

function mergeSectionRows(rows: SectionRow[]): PassportSection[] {
  return passportSectionDefinitions.map((definition) => {
    const row = rows.find((section) => section.section_key === definition.key);
    const fallback = initialSectionState[definition.key];

    return {
      ...definition,
      status: row?.status ?? fallback.status,
      verification_state: row?.verification_state ?? fallback.verification_state,
      progress: row?.progress ?? fallback.progress,
      last_updated_at: row?.last_updated_at ?? null,
      needs_reverification_at: row?.needs_reverification_at ?? null,
    };
  });
}

function createDemoPassportSummary(userId: string): PassportSummary {
  const now = new Date().toISOString();
  const sections = mergeSectionRows(
    passportSectionDefinitions.map((definition) => ({
      section_key: definition.key,
      status: 'verified',
      verification_state: 'verified',
      progress: 100,
      last_updated_at: now,
      needs_reverification_at: null,
    })),
  );

  return {
    passport: {
      id: 'demo-passport',
      owner_user_id: userId,
      passport_number: 'RP-7F8A-C3D2',
      status: 'verified',
      current_version_id: 'demo-version-1',
      draft_version_id: 'demo-version-1',
      created_at: now,
      updated_at: now,
    },
    currentVersion: {
      id: 'demo-version-1',
      passport_id: 'demo-passport',
      version_number: 1,
      status: 'current',
      created_at: now,
      updated_at: now,
    },
    draftVersion: {
      id: 'demo-version-1',
      passport_id: 'demo-passport',
      version_number: 1,
      status: 'current',
      created_at: now,
      updated_at: now,
    },
    sections,
    activity: [
      {
        id: 'demo-activity-1',
        passport_id: 'demo-passport',
        actor_user_id: userId,
        event_type: 'passport_progress_changed',
        description: 'Demo passport fully verified for investor workflow.',
        visibility: 'tenant',
        created_at: now,
      },
      {
        id: 'demo-activity-2',
        passport_id: 'demo-passport',
        actor_user_id: userId,
        event_type: 'passport_shared',
        description: 'Ready to share with a selected Rental District landlord.',
        visibility: 'tenant',
        created_at: now,
      },
    ],
    progress: calculatePassportProgress(sections),
  };
}

function statusToProgress(status: PassportSectionStatus) {
  const map: Record<PassportSectionStatus, number> = {
    not_started: 0,
    in_progress: 50,
    ready_for_review: 80,
    under_review: 85,
    verified: 100,
    needs_more_information: 65,
    needs_reverification: 75,
    expired: 50,
  };
  return map[status];
}

function statusToVerificationState(status: PassportSectionStatus): PassportVerificationState {
  if (status === 'verified') return 'verified';
  if (status === 'ready_for_review' || status === 'under_review' || status === 'in_progress') return 'pending_review';
  if (status === 'needs_reverification' || status === 'expired') return 'needs_reverification';
  return 'unverified';
}

function sectionLabel(sectionKey: PassportSectionKey) {
  return passportSectionDefinitions.find((section) => section.key === sectionKey)?.name ?? 'Passport section';
}

function createPassportNumber(userId: string) {
  const compact = userId.replace(/[^a-z0-9]/gi, '').toUpperCase().padEnd(8, '0');
  return `RP-${compact.slice(0, 4)}-${compact.slice(4, 8)}`;
}
