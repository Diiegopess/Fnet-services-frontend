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

export const useHardening = (initialStandardVersion?: string) => {
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
      const activeVersion = standardVersion || initialStandardVersion;
      
      const [profilesData, ruleGroups] = await Promise.all([
        hardeningService.getProfiles(activeVersion),
        hardeningService.getRulesCatalog(activeVersion),
      ]);
      
      setProfiles(profilesData || []);

      const extractedRules = (ruleGroups || []).flatMap((group) => group.rules || []);

      const rulesMap = new Map<string, RuleCatalogItem>();
      extractedRules.forEach((rule) => {
        const key = rule.standard_version 
          ? `${rule.id}_${rule.standard_version}` 
          : rule.id;
        if (!rulesMap.has(key)) {
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
  }, [initialStandardVersion]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const executeAudit = async (payload: AuditExecutionPayload) => {
    setLoading(true);
    setError(null);
    try {
      const normalizedPayload: AuditExecutionPayload = {
        ...payload,
        standard_version: payload.standard_version || initialStandardVersion,
      };

      const data = await hardeningService.runAudit(normalizedPayload);
      const rawFindings = data.findings?.length ? data.findings : data.findings_data || [];

      const enrichedFindings = rawFindings.map((finding) => {
        const matchedRule = catalogRules.find(
          (r) =>
            r.id === finding.rule_id &&
            (!normalizedPayload.standard_version ||
              r.standard_version === normalizedPayload.standard_version)
        );

        const fallbackScore =
          finding.status === 'PASSED'
            ? 100
            : finding.status === 'PARTIAL' || finding.status === 'PARCIAL'
              ? 50
              : 0;

        return {
          ...finding,
          compliance_score: finding.compliance_score ?? fallbackScore,
          rule_name: finding.rule_name || matchedRule?.name || finding.rule_id,
          expected_value: finding.expected_value || 'Conformidad con política CIS',
          remediation_cmd: finding.remediation_cmd || matchedRule?.description,
          severity:
            finding.severity ||
            (matchedRule?.default_severity as RuleSeverity) ||
            RuleSeverity.MEDIUM,
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
      const blobUrl = window.URL.createObjectURL(blobData);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `reporte_hardening_${reportId}.${format}`);
      document.body.appendChild(link);
      link.click();
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