import { apiClient } from '../../core/api/apiClient';
import type {
  ConnectivityCheckResult,
  DeviceCreateRequest,
  DeviceResponse,
  DeviceUpdateRequest,
  TestConnectionRequest,
} from './device.types';

export const deviceService = {
  async getDevices(skip = 0, limit = 50): Promise<DeviceResponse[]> {
    const response = await apiClient.get<DeviceResponse[]>('/devices', {
      params: { skip, limit },
    });
    return response.data;
  },

  async getDeviceById(id: string): Promise<DeviceResponse> {
    const response = await apiClient.get<DeviceResponse>(`/devices/${id}`);
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
};