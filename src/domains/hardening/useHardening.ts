// useHardening.ts

import { useCallback, useState, useEffect } from 'react';
import { hardeningService } from './hardeningService';
import type {
  AuditExecutionPayload,
  AuditReport,
  HardeningProfile,
  RuleCatalogItem,
} from './hardening.types';
import { parseApiError } from '../../shared/utils/errorHandler';

export const useHardening = () => {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [profiles, setProfiles] = useState<HardeningProfile[]>([]);
  const [catalogRules, setCatalogRules] = useState<RuleCatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (standardVersion?: string) => {
    setLoading(true);
    setError(null);
    try {
      const profilesData = await hardeningService.getProfiles(standardVersion);
      setProfiles(profilesData);

      const extractedRules = profilesData.flatMap((p) => p.rules || []);
      const uniqueRules = Array.from(
        new Map(extractedRules.map((r) => [r.id, r])).values()
      );

      setCatalogRules(uniqueRules);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      setError(parsed.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const executeAudit = async (payload: AuditExecutionPayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await hardeningService.runAudit(payload);

      // Normalización para garantizar la lista de hallazgos
      const normalizedReport: AuditReport = {
        ...data,
        findings: data.findings || data.findings_data || [],
      };

      setReport(normalizedReport);
      return normalizedReport;
    } catch (err: unknown) {
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
    catalogRules,
    loading,
    error,
    executeAudit,
    refetch: fetchData,
  };
};