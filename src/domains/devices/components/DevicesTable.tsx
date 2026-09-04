import React, { useState } from 'react';
import type { DeviceResponse } from '../device.types';
import { Shield, Layers, HardDrive, Building2, Activity, Edit, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface ClientItem {
  id: string;
  name: string;
  [key: string]: any;
}

interface DevicesTableProps {
  devices: DeviceResponse[];
  clients?: ClientItem[];
  actionLoadingId?: string | null;
  onToggleStatus?: (device: DeviceResponse) => void;
  onDelete?: (device: DeviceResponse) => void;
  onManageVDOMs?: (device: DeviceResponse) => void;
  onTestConnection?: (device: DeviceResponse) => Promise<boolean>; // Devuelve true/false según el resultado
  onEdit?: (device: DeviceResponse) => void;
}

export const DevicesTable: React.FC<DevicesTableProps> = ({
  devices,
  clients = [],
  actionLoadingId,
  onToggleStatus,
  onDelete,
  onManageVDOMs,
  onTestConnection,
  onEdit,
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);
  // Guardamos el estado del resultado de la prueba: { [deviceId]: 'success' | 'error' }
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error'>>({});

  if (!devices || devices.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No se encontraron dispositivos FortiGate registrados.
      </div>
    );
  }

  const clientMap = new Map<string, string>(clients.map((c) => [c.id, c.name]));

  const handleTestClick = async (device: DeviceResponse) => {
    if (!onTestConnection) return;
    setTestingId(device.id);
    
    // Limpiamos el resultado previo de este dispositivo al reintentar
    setTestResults((prev) => {
      const updated = { ...prev };
      delete updated[device.id];
      return updated;
    });

    try {
      const isSuccess = await onTestConnection(device);
      setTestResults((prev) => ({
        ...prev,
        [device.id]: isSuccess ? 'success' : 'error',
      }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [device.id]: 'error',
      }));
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="overflow-visible">
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-50 uppercase text-xs text-gray-500 font-semibold border-b border-gray-200">
          <tr>
            <th className="px-5 py-3.5">Dispositivo / Host</th>
            <th className="px-5 py-3.5">Cliente</th>
            <th className="px-5 py-3.5">FortiOS & Serial</th>
            <th className="px-5 py-3.5 text-center">Modo / VDOMs</th>
            <th className="px-5 py-3.5 text-center">Estado</th>
            <th className="px-5 py-3.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {devices.map((d) => {
            const isProcessing = actionLoadingId === d.id;
            const isTesting = testingId === d.id;
            const testStatus = testResults[d.id]; // 'success' | 'error' | undefined
            const clientName = d.client_id ? clientMap.get(d.client_id) : null;

            return (
              <tr key={d.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-5 py-4 font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>{d.name}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">
                    {d.host}:{d.port}
                  </div>
                </td>

                <td className="px-5 py-4 text-xs font-medium text-gray-800">
                  {clientName ? (
                    <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>{clientName}</span>
                    </div>
                  ) : d.has_vdom_enabled ? (
                    <span className="text-gray-400 italic">Multicliente (VDOMs)</span>
                  ) : (
                    <span className="text-gray-400 italic">Sin asignar</span>
                  )}
                </td>

                <td className="px-5 py-4 text-xs text-gray-600">
                  <div className="font-semibold text-gray-800">{d.fortios_version}</div>
                  <div className="font-mono text-gray-400 text-[11px]">
                    {d.serial_number || <span className="italic">Pendiente de Sync</span>}
                  </div>
                </td>

                <td className="px-5 py-4 text-center">
                  {d.has_vdom_enabled ? (
                    <button
                      type="button"
                      onClick={() => onManageVDOMs && onManageVDOMs(d)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all cursor-pointer shadow-xs"
                    >
                      <Layers className="w-3 h-3" />
                      <span>{d.vdoms?.length || 0} VDOMs</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      <HardDrive className="w-3 h-3" />
                      <span>Standalone</span>
                    </span>
                  )}
                </td>

                <td className="px-5 py-4 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      d.is_active
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {d.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    {/* BOTÓN PROBAR CONEXIÓN DINÁMICO */}
                    {onTestConnection && (
                      <button
                        type="button"
                        onClick={() => handleTestClick(d)}
                        disabled={isTesting || isProcessing}
                        title={
                          testStatus === 'success'
                            ? 'Conexión Exitosa'
                            : testStatus === 'error'
                            ? 'Error de Conexión'
                            : 'Probar conexión con la API del Firewall'
                        }
                        className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all disabled:opacity-40 cursor-pointer shadow-xs inline-flex items-center gap-1 ${
                          testStatus === 'success'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : testStatus === 'error'
                            ? 'border-rose-300 bg-rose-50 text-rose-700'
                            : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        {isTesting ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                        ) : testStatus === 'success' ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : testStatus === 'error' ? (
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                        ) : (
                          <Activity className="w-3 h-3 text-blue-600" />
                        )}
                        <span>
                          {isTesting
                            ? 'Probando...'
                            : testStatus === 'success'
                            ? 'OK'
                            : testStatus === 'error'
                            ? 'Falló'
                            : 'Test'}
                        </span>
                      </button>
                    )}

                    {/* BOTÓN EDITAR */}
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(d)}
                        disabled={isProcessing}
                        title="Editar parámetros del firewall"
                        className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 cursor-pointer shadow-xs inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3 text-gray-500" />
                        <span>Editar</span>
                      </button>
                    )}

                    {/* BOTÓN CAMBIAR ESTADO */}
                    <button
                      type="button"
                      onClick={() => onToggleStatus && onToggleStatus(d)}
                      disabled={isProcessing}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-30 shadow-xs cursor-pointer ${
                        d.is_active
                          ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {d.is_active ? 'Desactivar' : 'Activar'}
                    </button>

                    {/* BOTÓN ELIMINAR */}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(d)}
                        disabled={isProcessing}
                        className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-200 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DevicesTable;