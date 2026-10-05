import React, { useEffect, useState, useCallback } from 'react';
import type { DeviceResponse, VDOMResponse } from '../device.types';
import type { Client } from '../../clients/client.types';
import { deviceService } from '../deviceService';
import { parseApiError } from '../../../shared/utils/errorHandler';
import { Layers, X, Shield, RefreshCw, AlertCircle } from 'lucide-react';

interface ManageVDOMsModalProps {
  isOpen: boolean;
  device: DeviceResponse | null;
  onClose: () => void;
  clients: Client[];
}

export const ManageVDOMsModal: React.FC<ManageVDOMsModalProps> = ({
  isOpen,
  device,
  onClose,
  clients,
}) => {
  const [vdoms, setVdoms] = useState<VDOMResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadVDOMs = useCallback(async () => {
    if (!device) return;
    setLoading(true);
    setError(null);
    try {
      const data = await deviceService.getDeviceVDOMs(device.id);
      setVdoms(data);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [device]);

  useEffect(() => {
    if (isOpen && device) {
      loadVDOMs();
    } else {
      setVdoms([]);
      setError(null);
    }
  }, [isOpen, device, loadVDOMs]);

  if (!isOpen || !device) return null;

  const handleClientChange = async (vdomId: string, clientId: string | null) => {
    setSavingId(vdomId);
    setError(null);
    try {
      const updated = await deviceService.updateVDOMClient(vdomId, clientId);
      setVdoms((prev) => prev.map((v) => (v.id === vdomId ? updated : v)));
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-semibold text-gray-900">
                Asignación de Particiones: {device.name}
              </h3>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5 pl-7">
              {device.host}:{device.port} • FortiOS v{device.fortios_version}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabla de Asignación */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
              <span>Cargando particiones...</span>
            </div>
          ) : vdoms.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              No hay particiones registradas. Usa el botón <strong>Sync</strong> en la tabla de dispositivos para descubrirlas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
                  <tr>
                    <th className="px-3.5 py-2.5 rounded-l-lg">Nombre VDOM</th>
                    <th className="px-3.5 py-2.5">Tipo</th>
                    <th className="px-3.5 py-2.5">Cliente Asignado</th>
                    <th className="px-3.5 py-2.5 text-center rounded-r-lg">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vdoms.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-3.5 py-3 font-semibold text-gray-900 font-mono">
                        {v.name}
                      </td>
                      <td className="px-3.5 py-3">
                        {v.is_root ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <Shield className="w-3 h-3" /> Root (Admin)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            Tráfico
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={v.client_id || ''}
                            disabled={savingId === v.id}
                            onChange={(e) =>
                              handleClientChange(v.id, e.target.value || null)
                            }
                            className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-md bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 min-w-[200px]"
                          >
                            <option value="">Sin asignar / Infraestructura</option>
                            {clients.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} {c.tax_id ? `(${c.tax_id})` : ''}
                              </option>
                            ))}
                          </select>
                          {savingId === v.id && (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600 shrink-0" />
                          )}
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            v.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                          title={v.is_active ? 'Activa' : 'Inactiva'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shadow-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageVDOMsModal;