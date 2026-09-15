// useHardening.ts

import { useCallback, useState } from 'react';
import { hardeningService } from './hardeningService';
import type {
  AuditExecutionPayload,
  AuditReport,
  HardeningProfile,
} from './hardening.types';
import { parseApiError } from '../../shared/utils/errorHandler';

export const useHardening = () => {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [profiles, setProfiles] = useState<HardeningProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profilesData = await hardeningService.getProfiles();
      setProfiles(profilesData);
    } catch (err: any) {
      const parsed = parseApiError(err);
      setError(parsed.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const executeAudit = async (payload: AuditExecutionPayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await hardeningService.runAudit(payload);
      setReport(data);
      return data;
    } catch (err: any) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    report,
    profiles,
    loading,
    error,
    executeAudit,
    fetchProfiles,
  };
};