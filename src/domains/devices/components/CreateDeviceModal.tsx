import React, { useState } from 'react';
import type {
  DeviceCreateRequest,
  TestConnectionRequest,
  ConnectivityCheckResult,
  FortiOSVersionOption,
} from '../device.types';
import type { Client } from '../../clients/client.types';
import { Layers, HardDrive, ShieldCheck, AlertCircle } from 'lucide-react';

export interface CreateDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: DeviceCreateRequest) => Promise<void>;
  onTestConnection: (payload: TestConnectionRequest) => Promise<ConnectivityCheckResult>;
  clients: Client[];
  supportedVersions?: FortiOSVersionOption[];
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
    port: 12443,
    fortios_version: '7.2',
    api_token: '',
    has_vdom_enabled: false,
    client_id: null,
    is_active: true,
  });

  const [testResult, setTestResult] = useState<ConnectivityCheckResult | null>(null);
  const [detectedVersionLabel, setDetectedVersionLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const parseFortiOSVersion = (rawVersion: string): string => {
    if (rawVersion.includes('mock')) return 'mock';
    const match = rawVersion.match(/\d+\.\d+/);
    return match ? match[0] : '7.2';
  };

  const handleTest = async () => {
    if (!formData.host.trim() || !formData.api_token.trim()) {
      setError('Host y API Token son requeridos para probar la conexión.');
      return;
    }
    setError(null);
    try {
      const result = await onTestConnection({
        host: formData.host.trim(),
        port: Number(formData.port) || 12443,
        api_token: formData.api_token.trim(),
      });
      setTestResult(result);

      if (result.is_reachable) {
        // Auto-detección de Versión
        if (result.detected_version) {
          const cleanVersion = parseFortiOSVersion(result.detected_version);
          setFormData((prev) => ({ ...prev, fortios_version: cleanVersion }));
          setDetectedVersionLabel(result.detected_version);
        }

        // Auto-detección estricta de Topología / VDOM
        const isMultiVdom = result.vdom_mode === 'multi-vdom';
        setFormData((prev) => ({
          ...prev,
          has_vdom_enabled: isMultiVdom,
        }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al probar conexión';
      setError(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.host.trim() || !formData.api_token.trim()) {
      setError('Nombre, Host y API Token son campos obligatorios.');
      return;
    }

    if (!formData.has_vdom_enabled && !formData.client_id) {
      setError('En modo Standalone debes seleccionar el Cliente propietario.');
      return;
    }

    try {
      setError(null);
      const cleanPayload: DeviceCreateRequest = {
        ...formData,
        name: formData.name.trim(),
        host: formData.host.trim(),
        api_token: formData.api_token.trim(),
        port: Number(formData.port) || 12443,
        fortios_version: parseFortiOSVersion(formData.fortios_version ?? '7.2'),
        client_id: formData.client_id || null,
      };

      await onSubmit(cleanPayload);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al registrar el dispositivo FortiGate.';
      setError(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Registrar Firewall FortiGate</h3>
            <p className="text-xs text-gray-500">
              Conecta un dispositivo físico o virtual mediante REST API
            </p>
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
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {testResult && (
            <div
              className={`p-3.5 border text-xs rounded-xl font-medium flex items-center justify-between ${
                testResult.is_reachable
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {testResult.is_reachable
                      ? `Conexión exitosa. Versión: ${testResult.detected_version}`
                      : `Fallo de conexión: ${testResult.error_message}`}
                  </span>
                </div>
                {testResult.is_reachable && (
                  <div className="flex items-center gap-2 text-[11px] text-emerald-700">
                    {formData.has_vdom_enabled ? (
                      <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-semibold">
                        <Layers className="w-3 h-3" /> Multi-VDOM Autodetectado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-800 px-2 py-0.5 rounded-md font-semibold">
                        <HardDrive className="w-3 h-3" /> Standalone / Simple Autodetectado
                      </span>
                    )}
                    <span>• Latencia: {testResult.latency_ms || 0}ms</span>
                  </div>
                )}
              </div>
              {testResult.serial_number && testResult.serial_number !== 'Unknown' && (
                <span className="font-mono text-[11px] bg-white/80 px-2 py-1 rounded-md border border-emerald-300">
                  SN: {testResult.serial_number}
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nombre Descriptivo *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: FW-Local-Bifrost"
                className="w-full text-sm px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
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
                    : 'Auto-detectar (Test)'
                }
                className={`w-full text-xs px-3 py-2 border rounded-lg font-medium transition-all ${
                  detectedVersionLabel
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Host / IP / FQDN *
              </label>
              <input
                type="text"
                required
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                placeholder="172.20.69.249"
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
            <label className="block text-xs font-medium text-gray-700 mb-1">
              REST API Token *
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                required
                value={formData.api_token}
                onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                placeholder="Pegar token global generado en FortiOS Admin"
                className="w-full text-sm px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testingConnection}
                className="px-4 py-2 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg border border-gray-300 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {testingConnection ? 'Probando...' : 'Test'}
              </button>
            </div>
          </div>

          {/* ASIGNACIÓN DE CLIENTE DEPENDIENDO DE LA TOPOLOGÍA AUTODETECTADA */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              {formData.has_vdom_enabled
                ? 'Cliente Asignado a VDOM "root" (Opcional - Infraestructura / Operador)'
                : 'Cliente Propietario (Equipo Standalone) *'}
            </label>
            <select
              value={formData.client_id || ''}
              onChange={(e) =>
                setFormData({ ...formData, client_id: e.target.value || null })
              }
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
            >
              <option value="">
                {formData.has_vdom_enabled
                  ? 'Sin asignar / Uso interno de administración'
                  : 'Seleccionar cliente...'}
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.tax_id ? `(${c.tax_id})` : ''}
                </option>
              ))}
            </select>
            {formData.has_vdom_enabled && (
              <p className="text-[11px] text-gray-500 italic">
                Las particiones de clientes (ej. CONTABLE, LEGALES) se sincronizan y asignan en el menú de VDOMs tras registrar el equipo.
              </p>
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