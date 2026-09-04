import React, { useState } from 'react';
import type {
  DeviceResponse,
  DeviceUpdateRequest,
  TestConnectionRequest,
  ConnectivityCheckResult,
} from '../device.types';
import { X, Shield } from 'lucide-react';

interface EditDeviceModalProps {
  isOpen: boolean;
  device: DeviceResponse | null;
  onClose: () => void;
  onSubmit: (id: string, payload: DeviceUpdateRequest) => Promise<void>;
  onTestConnection: (payload: TestConnectionRequest) => Promise<ConnectivityCheckResult>;
  // 1. Añadimos la función para probar dispositivos existentes sin enviar token
  onTestExistingConnection: (deviceId: string) => Promise<ConnectivityCheckResult>;
  clients?: Array<{ id: string; name: string }>;
  testingConnection?: boolean;
}

export const EditDeviceModal: React.FC<EditDeviceModalProps> = ({
  isOpen,
  device,
  onClose,
  onSubmit,
  onTestConnection,
  onTestExistingConnection, // 2. Recibimos la prop aquí
  clients = [],
  testingConnection = false,
}) => {
  if (!isOpen || !device) return null;

  const [name, setName] = useState(device.name);
  const [host, setHost] = useState(device.host);
  const [port, setPort] = useState(device.port);
  const [fortiosVersion, setFortiosVersion] = useState(device.fortios_version);
  const [apiToken, setApiToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [testResult, setTestResult] = useState<ConnectivityCheckResult | null>(null);
  const [detectedVersionLabel, setDetectedVersionLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseFortiOSVersion = (rawVersion: string): string => {
    if (rawVersion.includes('mock')) return 'mock';
    const match = rawVersion.match(/\d+\.\d+/);
    return match ? match[0] : '7.2';
  };

  const clientName = device.has_vdom_enabled
    ? 'Múltiples Clientes (Modo Multi-VDOM)'
    : clients.find((c) => c.id === device.client_id)?.name || 'Sin cliente asignado';

  // 3. Lógica limpia para decidir qué endpoint consultar
  const handleTest = async () => {
    if (!host.trim()) {
      setError('El Host / IP es requerido para probar la conexión.');
      return;
    }

    setError(null);
    try {
      let result: ConnectivityCheckResult;

      // Si el usuario ingresó un nuevo token, probamos los datos nuevos
      if (apiToken.trim()) {
        result = await onTestConnection({
          host: host.trim(),
          port: Number(port) || 8443,
          api_token: apiToken.trim(),
        });
      } else {
        // Si no escribió un token, le decimos al backend que use el token guardado en DB
        result = await onTestExistingConnection(device.id);
      }

      setTestResult(result);

      if (result.is_reachable && result.detected_version) {
        const cleanVersion = parseFortiOSVersion(result.detected_version);
        setFortiosVersion(cleanVersion);
        setDetectedVersionLabel(result.detected_version);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al probar conexión';
      setError(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload: DeviceUpdateRequest = {
        name: name.trim(),
        host: host.trim(),
        port: Number(port) || 8443,
        fortios_version: parseFortiOSVersion(fortiosVersion ?? '7.2'),
      };

      if (apiToken.trim()) {
        payload.api_token = apiToken.trim();
      }

      await onSubmit(device.id, payload);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al actualizar el dispositivo.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-start p-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Editar Firewall: {device.name}</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1 pl-7">{clientName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          {testResult && (
            <div
              className={`p-3 border text-xs rounded-lg font-medium flex items-center justify-between ${
                testResult.is_reachable
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <span>
                {testResult.is_reachable
                  ? `Conexión exitosa. Versión: ${
                      testResult.detected_version || 'Detectada'
                    } | Latencia: ${testResult.latency_ms || 0}ms`
                  : `Fallo de conexión: ${testResult.error_message || 'No alcanzable'}`}
              </span>
              {testResult.serial_number && (
                <span className="font-mono text-[11px] bg-white/70 px-2 py-0.5 rounded">
                  SN: {testResult.serial_number}
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Versión FortiOS
              </label>
              <input
                type="text"
                disabled
                readOnly
                value={
                  detectedVersionLabel
                    ? `${detectedVersionLabel} (Auto)`
                    : testingConnection
                    ? 'Detectando...'
                    : `${fortiosVersion} (Actual)`
                }
                className={`w-full text-xs px-3 py-2 border rounded-md font-medium transition-all ${
                  detectedVersionLabel
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Host / IP</label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm border-gray-300 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Puerto</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                className="w-full border rounded-md px-3 py-2 text-sm border-gray-300 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              API Token (Dejar vacío para mantener el actual)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm border-gray-300 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testingConnection}
                className="px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md border border-gray-300 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {testingConnection ? 'Probando...' : 'Test'}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer font-medium"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDeviceModal;