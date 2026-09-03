export interface VDOMResponse {
  id: string;
  device_id: string;
  client_id: string;
  name: string;
  is_root: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeviceResponse {
  id: string;
  name: string;
  host: string;
  port: number;
  fortios_version: string;
  serial_number: string | null;
  has_vdom_enabled: boolean;
  is_active: boolean;
  client_id?: string | null; // <-- Añadido: ID del cliente al que pertenece el chasis
  vdoms: VDOMResponse[];
  created_at: string;
  updated_at: string;
}

export interface DeviceCreateRequest {
  name: string;
  host: string;
  port?: number;
  fortios_version?: string;
  api_token: string;
  has_vdom_enabled?: boolean;
  client_id?: string | null; // <-- Cambiado de default_client_id a client_id si así quedó en backend
  is_active?: boolean;
}

export interface DeviceUpdateRequest {
  name?: string;
  host?: string;
  port?: number;
  fortios_version?: string;
  api_token?: string;
  has_vdom_enabled?: boolean;
  client_id?: string | null; // <-- Útil si deseas reasignar de cliente en un update
  is_active?: boolean;
}

export interface TestConnectionRequest {
  host: string;
  port: number;
  api_token: string;
}

export interface ConnectivityCheckResult {
  is_reachable: boolean;
  status_code?: number | null;
  serial_number?: string | null;
  detected_version?: string | null;
  vdom_mode?: string | null;
  latency_ms?: number | null;
  error_message?: string | null;
}

export interface FortiOSVersionOption {
  label: string;
  value: string;
}