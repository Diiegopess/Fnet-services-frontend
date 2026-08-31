import React, { useState } from 'react';
import type { DeviceCreateRequest, TestConnectionRequest, ConnectivityCheckResult } from '../device.types';
import type { Client } from '../../clients/client.types';

export interface CreateDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: DeviceCreateRequest) => Promise<void>;
  onTestConnection: (payload: TestConnectionRequest) => Promise<ConnectivityCheckResult>;
  clients: Client[];
  loading?: boolean;
  testingConnection?: boolean;
}

export const CreateDeviceModal: React.FC<CreateDeviceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onTestConnection,
  clients,
  loading = false,
  testingConnection = false,
}) => {
  const [formData, setFormData] = useState<DeviceCreateRequest>({
    name: '',
    host: '',
    port: 443,
    fortios_version: '7.2',
    api_token: '',
    has_vdom_enabled: false,
    default_client_id: null,
    is_active: true,
  });

  const [testResult, setTestResult] = useState<ConnectivityCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!formData.host.trim() || !formData.api_token.trim()) {
      setError('Host y API Token son requeridos para probar la conexión.');
      return;
    }
    setError(null);
    const result = await onTestConnection({
      host: formData.host.trim(),
      port: Number(formData.port) || 443,
      api_token: formData.api_token.trim(),
    });
    setTestResult(result);
    if (result.detected_version) {
      setFormData((prev) => ({ ...prev, fortios_version: result.detected_version || prev.fortios_version }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.host.trim() || !formData.api_token.trim()) {
      setError('Nombre, Host y API Token son campos obligatorios.');
      return;
    }
    if (!formData.has_vdom_enabled && !formData.default_client_id) {
      setError('En modo Standalone (sin VDOMs) debes seleccionar el Cliente propietario.');
      return;
    }

    try {
      setError(null);
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        host: formData.host.trim(),
        api_token: formData.api_token.trim(),
        port: Number(formData.port) || 443,
        default_client_id: formData.has_vdom_enabled ? null : formData.default_client_id,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el dispositivo FortiGate.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Registrar Firewall FortiGate</h3>
            <p className="text-xs text-gray-500">Conecta un dispositivo físico o virtual mediante REST API</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  ? `Conexión exitosa. Versión: ${testResult.detected_version || 'Detectada'} | Latencia: ${testResult.latency_ms || 0}ms`
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Descriptivo *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: FW-Core-Bogota"
                className="w-full text-sm px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Versión FortiOS</label>
              <input
                type="text"
                value={formData.fortios_version}
                onChange={(e) => setFormData({ ...formData, fortios_version: e.target.value })}
                placeholder="7.2"
                className="w-full text-sm px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Host / IP / FQDN *</label>
              <input
                type="text"
                required
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                placeholder="192.168.1.1 o firewall.empresa.com"
                className="w-full text-sm px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Puerto HTTPS *</label>
              <input
                type="number"
                required
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: Number(e.target.value) })}
                className="w-full text-sm px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">REST API Token *</label>
            <div className="flex gap-2">
              <input
                type="password"
                required
                value={formData.api_token}
                onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                placeholder="Pegar token generado en FortiOS Admin"
                className="w-full text-sm px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testingConnection}
                className="px-3 py-2 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg border border-gray-300 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {testingConnection ? 'Probando...' : 'Test'}
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-800">Modo Multi-VDOM</span>
                <p className="text-[11px] text-gray-500">Habilitar si el equipo particiona tráfico por VDOMs</p>
              </div>
              <input
                type="checkbox"
                checked={formData.has_vdom_enabled}
                onChange={(e) => setFormData({ ...formData, has_vdom_enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {!formData.has_vdom_enabled && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Cliente Asignado (Modo Standalone) *
                </label>
                <select
                  value={formData.default_client_id || ''}
                  onChange={(e) => setFormData({ ...formData, default_client_id: e.target.value || null })}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                >
                  <option value="">Seleccionar cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.tax_id ? `(${c.tax_id})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Guardando...' : 'Registrar Dispositivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDeviceModal;