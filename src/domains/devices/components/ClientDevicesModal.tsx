import React, { useEffect, useState } from 'react';
import { deviceService } from '../deviceService';
import type { DeviceResponse } from '../device.types'
import { parseApiError } from '../../../shared/utils/errorHandler';

interface ClientDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string | null;
  clientName?: string;
}

export const ClientDevicesModal: React.FC<ClientDevicesModalProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
}) => {
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && clientId) {
      const loadDevices = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await deviceService.getDevices(0, 50, clientId);
          setDevices(data);
        } catch (err) {
          setError(parseApiError(err).message);
        } finally {
          setLoading(false);
        }
      };

      loadDevices();
    } else {
      setDevices([]);
      setError(null);
    }
  }, [isOpen, clientId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Dispositivos Asignados
            </h3>
            {clientName && (
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                Cliente: <span className="font-medium text-gray-700">{clientName}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="py-8 text-center text-sm text-gray-500">
              Cargando dispositivos asociados...
            </div>
          )}

          {error && (
            <div className="p-3 mb-4 rounded-md bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {error}
            </div>
          )}

          {!loading && !error && devices.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500 italic">
              Este cliente no tiene dispositivos FortiGate asignados.
            </div>
          )}

          {!loading && !error && devices.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
                  <tr>
                    <th className="px-3 py-2 rounded-l">Nombre</th>
                    <th className="px-3 py-2">Host / IP</th>
                    <th className="px-3 py-2">Versión</th>
                    <th className="px-3 py-2">VDOMs</th>
                    <th className="px-3 py-2 text-center rounded-r">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {devices.map((dev) => (
                    <tr key={dev.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium text-gray-900">{dev.name}</td>
                      <td className="px-3 py-2.5 font-mono text-gray-600">{dev.host}:{dev.port}</td>
                      <td className="px-3 py-2.5">FortiOS {dev.fortios_version}</td>
                      <td className="px-3 py-2.5">
                        {dev.has_vdom_enabled ? (
                          <span className="text-indigo-600 font-semibold">{dev.vdoms.length} VDOMs</span>
                        ) : (
                          <span className="text-gray-400">Desactivado</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            dev.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          title={dev.is_active ? 'Activo' : 'Inactivo'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pie de modal */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors shadow-xs cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDevicesModal;