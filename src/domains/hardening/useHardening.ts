// src/domains/hardening/useHardening.ts

import { useCallback, useEffect, useState } from 'react';
import { parseApiError } from '../../shared/utils/errorHandler';
import { RuleSeverity } from './hardening.types';
import type {
  AuditExecutionPayload,
  AuditReport,
  ExportFormat,
  HardeningProfile,
  RuleCatalogItem,
} from './hardening.types';
import { hardeningService } from './hardeningService';

export const useHardening = () => {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [profiles, setProfiles] = useState<HardeningProfile[]>([]);
  const [catalogRules, setCatalogRules] = useState<RuleCatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (standardVersion?: string) => {
    setLoading(true);
    setError(null);
    try {
      const [profilesData, ruleGroups] = await Promise.all([
        hardeningService.getProfiles(standardVersion),
        hardeningService.getRulesCatalog(),
      ]);
      setProfiles(profilesData);

      const extractedRules = ruleGroups.flatMap((group) => group.rules || []);

      // Indexar tanto por rule_id, code o id para evitar fallas en el map
      const rulesMap = new Map<string, RuleCatalogItem>();
      extractedRules.forEach((rule) => {
        const key = rule.rule_id || rule.code || rule.id;
        if (key && !rulesMap.has(key)) {
          rulesMap.set(key, rule);
        }
      });

      setCatalogRules(Array.from(rulesMap.values()));
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
      const rawFindings = data.findings?.length ? data.findings : data.findings_data || [];

      const enrichedFindings = rawFindings.map((finding) => {
        const matchedRule = catalogRules.find(
          (r) =>
            r.rule_id === finding.rule_id ||
            r.code === finding.rule_id ||
            r.id === finding.rule_id
        );

        const fallbackScore =
          finding.status === 'PASSED' ? 100 : finding.status === 'PARTIAL' ? 50 : 0;

        return {
          ...finding,
          compliance_score: finding.compliance_score ?? fallbackScore,
          rule_name: finding.rule_name || matchedRule?.name || 'Sin título asignado',
          reason:
            finding.reason ||
            matchedRule?.description ||
            'No hay descripción detallada disponible para esta regla de evaluación.',
          severity:
            finding.severity ||
            (matchedRule?.default_severity as RuleSeverity) ||
            RuleSeverity.LOW,
        };
      });

      const normalizedReport: AuditReport = {
        ...data,
        findings: enrichedFindings,
        findings_data: enrichedFindings,
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

  const exportAuditReport = async (reportId: string, format: ExportFormat = 'pdf') => {
    setExporting(true);
    setError(null);
    try {
      const blobData = await hardeningService.exportReport(reportId, format);

      // Crear enlace HTML invisible para forzar la descarga en el navegador
      const blobUrl = window.URL.createObjectURL(blobData);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `reporte_hardening_${reportId}.${format}`);
      document.body.appendChild(link);
      link.click();

      // Limpieza de memoria
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      setError(parsed.message);
    } finally {
      setExporting(false);
    }
  };

  return {
    report,
    profiles,
    catalogRules,
    loading,
    exporting,
    error,
    executeAudit,
    exportAuditReport,
    refetch: fetchData,
  };
};