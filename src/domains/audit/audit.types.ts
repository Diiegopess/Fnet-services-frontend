export interface AuditLog {
  id: string;
  event_id: string;
  event_type: string;
  user_id: string;
  ip_address?: string;
  user_agent?: string;
  correlation_id?: string;
  payload?: Record<string, any>;
  occurred_at: string;
  created_at: string;
}

export interface LogFilter {
  skip?: number;
  limit?: number;
  event_type?: string;
  user_id?: string;
  from_date?: string;
  to_date?: string;
}