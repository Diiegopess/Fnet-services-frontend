/**
 * Tipos e Interfaces para el Dominio de Actividad (Activity Logs).
 */

export interface ActivityLogResponse {
  id: string;
  event_id: string;
  event_type: string;
  user_id: string | null;
  ip_address: string;
  user_agent: string;
  payload: Record<string, unknown>;
  created_at: string;
  correlation_id: string | null;
}

export interface ActivityLogQueryParams {
  skip?: number;
  limit?: number;
  event_type?: string;
  user_id?: string;
  from_date?: string;
  to_date?: string;
}