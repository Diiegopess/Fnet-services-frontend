import { useState, useCallback, useEffect } from 'react';
import { deviceService } from './deviceService';
import type {
  ConnectivityCheckResult,
  DeviceCreateRequest,
  DeviceResponse,
  DeviceUpdateRequest,
  FortiOSVersionOption,
  TestConnectionRequest,
  VDOMResponse,
} from './device.types';
import { parseApiError } from '../../shared/utils/errorHandler';

export function useDevices(initialClientId?: string) {
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const [supportedVersions, setSupportedVersions] = useState<FortiOSVersionOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<ConnectivityCheckResult | null>(null);

  // Estado dedicado para particiones VDOM en foco
  const [activeVDOMs, setActiveVDOMs] = useState<VDOMResponse[]>([]);
  const [isSyncingVDOMs, setIsSyncingVDOMs] = useState<boolean>(false);

  const fetchDevices = useCallback(async (skip = 0, limit = 50, clientId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const targetClient = clientId !== undefined ? clientId : initialClientId;
      const data = await deviceService.getDevices(skip, limit, targetClient);
      setDevices(data);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  }, [initialClientId]);

  const fetchSupportedVersions = useCallback(async () => {
    try {
      const versions = await deviceService.getSupportedVersions();
      setSupportedVersions(versions);
    } catch {
      setSupportedVersions([
        { label: 'FortiOS v7.4.x', value: '7.4' },
        { label: 'FortiOS v7.2.x', value: '7.2' },
        { label: 'FortiOS v7.0.x', value: '7.0' },
        { label: 'FortiOS v6.4.x', value: '6.4' },
        { label: 'Entorno Mock / Pruebas', value: 'mock' },
      ]);
    }
  }, []);

  const createDevice = async (payload: DeviceCreateRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const newDevice = await deviceService.createDevice(payload);
      setDevices((prev) => [newDevice, ...prev]);
      return newDevice;
    } catch (err) {
      const msg = parseApiError(err).message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDevice = async (id: string, payload: DeviceUpdateRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await deviceService.updateDevice(id, payload);
      setDevices((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return updated;
    } catch (err) {
      const msg = parseApiError(err).message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDevice = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deviceService.deleteDevice(id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      const msg = parseApiError(err).message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (payload: TestConnectionRequest) => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await deviceService.testConnection(payload);
      setTestResult(result);
      return result;
    } catch (err) {
      const fallbackResult: ConnectivityCheckResult = {
        is_reachable: false,
        error_message: parseApiError(err).message,
      };
      setTestResult(fallbackResult);
      return fallbackResult;
    } finally {
      setIsTesting(false);
    }
  };

  // --- Métodos de VDOMs expuestos en el Hook ---
  const fetchDeviceVDOMs = async (deviceId: string): Promise<VDOMResponse[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await deviceService.getDeviceVDOMs(deviceId);
      setActiveVDOMs(list);
      return list;
    } catch (err) {
      const msg = parseApiError(err).message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const syncDeviceVDOMs = async (deviceId: string): Promise<VDOMResponse[]> => {
    setIsSyncingVDOMs(true);
    setError(null);
    try {
      // 1. Ejecutar el sync en el backend (POST /vdoms/device/{deviceId}/sync)
      await deviceService.syncDeviceVDOMs(deviceId);
      
      // 2. Traer la lista actualizada desde la base de datos (GET /vdoms/device/{deviceId})
      const list = await deviceService.getDeviceVDOMs(deviceId);
      setActiveVDOMs(list);
      return list;
    } catch (err) {
      const msg = parseApiError(err).message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsSyncingVDOMs(false);
    }
  };

  const assignVDOMClient = async (
    vdomId: string,
    clientId: string | null
  ): Promise<VDOMResponse> => {
    try {
      const updated = await deviceService.updateVDOMClient(vdomId, clientId);
      setActiveVDOMs((prev) => prev.map((v) => (v.id === vdomId ? updated : v)));
      return updated;
    } catch (err) {
      const msg = parseApiError(err).message;
      setError(msg);
      throw new Error(msg);
    }
  };

  useEffect(() => {
    fetchDevices();
    fetchSupportedVersions();
  }, [fetchDevices, fetchSupportedVersions]);

  return {
    devices,
    supportedVersions,
    isLoading,
    error,
    isTesting,
    testResult,
    activeVDOMs,
    isSyncingVDOMs,
    setTestResult,
    fetchDevices,
    fetchSupportedVersions,
    createDevice,
    updateDevice,
    deleteDevice,
    testConnection,
    fetchDeviceVDOMs,
    syncDeviceVDOMs,
    assignVDOMClient,
  };
}