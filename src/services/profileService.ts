import { supabase } from '@/lib/supabase';
import type { UserProfile, UserRole } from '@/types/database';
import type { User } from '@supabase/supabase-js';

export type ProfileInput = {
  legal_first_name: string;
  middle_name?: string;
  legal_last_name: string;
  preferred_name?: string;
  phone?: string;
  country: string;
  province_state: string;
  language: string;
  timezone: string;
};

export async function getCurrentProfile(user: User): Promise<UserProfile | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertCurrentProfile(user: User, input: ProfileInput): Promise<UserProfile> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email ?? '',
      legal_first_name: input.legal_first_name,
      middle_name: input.middle_name || null,
      legal_last_name: input.legal_last_name,
      preferred_name: input.preferred_name || null,
      phone: input.phone || null,
      country: input.country,
      province_state: input.province_state,
      language: input.language,
      timezone: input.timezone,
      account_status: user.email_confirmed_at ? 'active' : 'pending_email_verification',
      verification_status: user.email_confirmed_at ? 'email_verified' : 'unverified',
      email_verified: Boolean(user.email_confirmed_at),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCurrentRoles(userId: string): Promise<UserRole[]> {
  if (!supabase) return [];

  const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId);

  if (error) throw error;
  return data.map((item) => item.role as UserRole);
}
