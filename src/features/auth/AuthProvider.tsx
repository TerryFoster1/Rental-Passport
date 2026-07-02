/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import { getCurrentProfile, getCurrentRoles } from '@/services/profileService';
import type { UserProfile, UserRole } from '@/types/database';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  roles: UserRole[];
  loading: boolean;
  isConfigured: boolean;
  isEmailVerified: boolean;
  refreshProfile: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  sendPasswordReset: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase));

  const user = session?.user ?? null;

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setRoles([]);
      return;
    }

    const [nextProfile, nextRoles] = await Promise.all([getCurrentProfile(user), getCurrentRoles(user.id)]);
    setProfile(nextProfile);
    setRoles(nextRoles.length > 0 ? nextRoles : ['tenant']);
  }, [user]);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!user) {
        return { nextProfile: null, nextRoles: [] as UserRole[] };
      }

      try {
        const [nextProfile, nextRoles] = await Promise.all([getCurrentProfile(user), getCurrentRoles(user.id)]);
        return { nextProfile, nextRoles: nextRoles.length > 0 ? nextRoles : (['tenant'] as UserRole[]) };
      } catch {
        return { nextProfile: null, nextRoles: ['tenant'] as UserRole[] };
      }
    }

    loadProfile().then(({ nextProfile, nextRoles }) => {
      if (cancelled) return;
      setProfile(nextProfile);
      setRoles(nextRoles);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      roles,
      loading,
      isConfigured: isSupabaseConfigured,
      isEmailVerified: Boolean(user?.email_confirmed_at),
      refreshProfile,
      signInWithPassword: async (email, password) => {
        if (!supabase) return { error: new Error('Supabase is not configured.') as AuthError };
        return supabase.auth.signInWithPassword({ email, password });
      },
      signUpWithPassword: async (email, password) => {
        if (!supabase) return { error: new Error('Supabase is not configured.') as AuthError };
        return supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${env.appUrl}/verify-email`,
          },
        });
      },
      signInWithGoogle: async () => {
        if (!supabase) return { error: new Error('Supabase is not configured.') as AuthError };
        return supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${env.appUrl}/auth/callback`,
          },
        });
      },
      sendPasswordReset: async (email) => {
        if (!supabase) return { error: new Error('Supabase is not configured.') as AuthError };
        return supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${env.appUrl}/reset-password`,
        });
      },
      updatePassword: async (password) => {
        if (!supabase) return { error: new Error('Supabase is not configured.') as AuthError };
        return supabase.auth.updateUser({ password });
      },
      signOut: async () => {
        if (supabase) await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
        setRoles([]);
      },
    }),
    [loading, profile, refreshProfile, roles, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
