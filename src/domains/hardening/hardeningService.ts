// src/domains/hardening/hardeningService.ts

import apiClient from '../../core/api/apiClient';
import type {
  AuditExecutionPayload,
  AuditReport,
  AuditReportListItem,
  ExportFormat,
  FetchReportsParams,
  HardeningProfile,
  RuleGroupResponse,
} from './hardening.types';

export const hardeningService = {
  // Ejecuta la auditoría
  async runAudit(payload: AuditExecutionPayload): Promise<AuditReport> {
    const { data } = await apiClient.post<AuditReport>('/hardening/audit', payload);
    return data;
  },

  // Obtiene los perfiles
  async getProfiles(standardVersion?: string): Promise<HardeningProfile[]> {
    const { data } = await apiClient.get<HardeningProfile[]>('/hardening/profiles', {
      params: standardVersion ? { standard_version: standardVersion } : undefined,
    });
    return data;
  },

  // Obtiene el catálogo de reglas que el motor realmente tiene registradas
  async getRulesCatalog(): Promise<RuleGroupResponse[]> {
    const { data } = await apiClient.get<RuleGroupResponse[]>('/hardening/rules');
    return data;
  },

  // Obtiene el historial de reportes de auditoría
  async getAuditReports(params?: FetchReportsParams): Promise<AuditReportListItem[]> {
    const { data } = await apiClient.get<AuditReportListItem[]>('/hardening/reports', {
      params: {
        device_id: params?.device_id,
        limit: params?.limit ?? 50,
        offset: params?.offset ?? 0,
      },
    });
    return data;
  },

  // Obtiene el detalle de un reporte específico
  async getAuditReportById(reportId: string): Promise<AuditReport> {
    const { data } = await apiClient.get<AuditReport>(`/hardening/reports/${reportId}`);
    return data;
  },

  // Exporta el reporte en formato binario (PDF o DOCX)
  async exportReport(reportId: string, format: ExportFormat = 'pdf'): Promise<Blob> {
    const { data } = await apiClient.get<Blob>(`/hardening/reports/${reportId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return data;
  },

  // Crea un nuevo perfil personalizado AdHoc
  async createProfile(payload: { name: string; rule_ids: string[] }): Promise<HardeningProfile> {
    const { data } = await apiClient.post<HardeningProfile>('/hardening/profiles', payload);
    return data;
  },
};