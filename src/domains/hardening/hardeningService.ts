// hardeningService.ts

import apiClient from '../../core/api/apiClient';
import type {
  AuditExecutionPayload,
  AuditReport,
  HardeningProfile,
} from './hardening.types';

export const hardeningService = {
  async runAudit(payload: AuditExecutionPayload): Promise<AuditReport> {
    const { data } = await apiClient.post<AuditReport>('/hardening/audit', payload);
    return data;
  },

  async getProfiles(): Promise<HardeningProfile[]> {
    const { data } = await apiClient.get<HardeningProfile[]>('/hardening/profiles');
    return data;
  },
};