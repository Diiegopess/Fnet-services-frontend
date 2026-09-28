/**
 * Servicio HTTP para el Dominio de Actividad.
 */

import apiClient from '../../core/api/apiClient';
import type { ActivityLogQueryParams, ActivityLogResponse } from './activity.types';

export const activityService = {
  /**
   * Consulta el historial de logs de actividad del sistema con filtros opcionales.
   */
  async getActivityLogs(params?: ActivityLogQueryParams): Promise<ActivityLogResponse[]> {
    const response = await apiClient.get<ActivityLogResponse[]>('/activities/logs', { params });
    return response.data;
  },

  /**
   * Exporta los logs de actividad en formato descargable (Blob/CSV).
   */
  async exportActivityLogs(params?: ActivityLogQueryParams): Promise<Blob> {
    const response = await apiClient.get<Blob>('/activities/logs/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

// Aliases para mantener retrocompatibilidad de importaciones
export const fetchLogs = activityService.getActivityLogs;
export const exportLogs = activityService.exportActivityLogs;