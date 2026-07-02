import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { getOrCreatePassportSummary, updatePassportSectionStatus } from '@/services/passportService';
import type { PassportSectionKey, PassportSectionStatus, PassportSummary } from '@/types/passport';

export function usePassportSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PassportSummary | null>(null);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user) {
      setSummary(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const nextSummary = await getOrCreatePassportSummary(user);
      setSummary(nextSummary);
    } catch (summaryError) {
      setError(summaryError instanceof Error ? summaryError.message : 'Unable to load passport.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    Promise.resolve().then(() => {
      refresh();
    });
  }, [refresh]);

  const updateSectionStatus = async (sectionKey: PassportSectionKey, status: PassportSectionStatus) => {
    if (!user) return;
    const nextSummary = await updatePassportSectionStatus(user, sectionKey, status);
    setSummary(nextSummary);
  };

  return {
    summary,
    loading,
    error,
    refresh,
    updateSectionStatus,
  };
}
