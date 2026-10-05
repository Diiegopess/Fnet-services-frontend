import apiClient from '../../core/api/apiClient';
import type {
  ConnectivityCheckResult,
  DeviceCreateRequest,
  DeviceResponse,
  DeviceUpdateRequest,
  FortiOSVersionOption,
  TestConnectionRequest,
  VDOMResponse,
} from './device.types';

export const deviceService = {
  async getDevices(skip = 0, limit = 50, clientId?: string): Promise<DeviceResponse[]> {
    const params: Record<string, unknown> = { skip, limit };
    if (clientId) {
      params.client_id = clientId;
    }
    const response = await apiClient.get<DeviceResponse[]>('/devices', { params });
    return response.data;
  },

  async getDeviceById(id: string): Promise<DeviceResponse> {
    const response = await apiClient.get<DeviceResponse>(`/devices/${id}`);
    return response.data;
  },

  async getSupportedVersions(): Promise<FortiOSVersionOption[]> {
    const response = await apiClient.get<FortiOSVersionOption[]>('/devices/supported-versions');
    return response.data;
  },

  async createDevice(payload: DeviceCreateRequest): Promise<DeviceResponse> {
    const response = await apiClient.post<DeviceResponse>('/devices', payload);
    return response.data;
  },

  async updateDevice(id: string, payload: DeviceUpdateRequest): Promise<DeviceResponse> {
    const response = await apiClient.patch<DeviceResponse>(`/devices/${id}`, payload);
    return response.data;
  },

  async deleteDevice(id: string): Promise<void> {
    await apiClient.delete(`/devices/${id}`);
  },

  async testConnection(payload: TestConnectionRequest): Promise<ConnectivityCheckResult> {
    const response = await apiClient.post<ConnectivityCheckResult>(
      '/devices/test-connection',
      payload
    );
    return response.data;
  },

  async testExistingDeviceConnection(id: string): Promise<ConnectivityCheckResult> {
    const response = await apiClient.post<ConnectivityCheckResult>(
      `/devices/${id}/test-connection`
    );
    return response.data;
  },

  // --- Operaciones de VDOMs mapeadas a vdoms.router.py ---
  async getDeviceVDOMs(deviceId: string): Promise<VDOMResponse[]> {
    const response = await apiClient.get<VDOMResponse[]>(`/vdoms/device/${deviceId}`);
    return response.data;
  },

  async syncDeviceVDOMs(deviceId: string): Promise<unknown> {
    const response = await apiClient.post(`/vdoms/device/${deviceId}/sync`);
    return response.data;
  },

  async updateVDOMClient(vdomId: string, clientId: string | null): Promise<VDOMResponse> {
    const response = await apiClient.patch<VDOMResponse>(`/vdoms/${vdomId}`, {
      client_id: clientId,
    });
    return response.data;
  },
};