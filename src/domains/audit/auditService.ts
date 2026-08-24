import apiClient from '../../core/api/apiClient';
import type { AuditLog, LogFilter } from './audit.types';

export async function fetchLogs(filter?: LogFilter): Promise<AuditLog[]> {
  const resp = await apiClient.get<AuditLog[]>('/audit/logs', { params: filter });
  return resp.data;
}

export async function exportLogs(filter?: LogFilter): Promise<Blob> {
  const resp = await apiClient.get<Blob>('/audit/export', { 
    params: filter, 
    responseType: 'blob' 
  });
  return resp.data;
}