import React, { useState } from 'react';
import type { DeviceResponse } from '../device.types';
import {
  Shield,
  Layers,
  HardDrive,
  Activity,
  Edit,
  RefreshCw,
  Check,
  AlertCircle,
  Network,
} from 'lucide-react';

interface DevicesTableProps {
  devices: DeviceResponse[];
  actionLoadingId?: string | null;
  onToggleStatus?: (device: DeviceResponse) => void;
  onDelete?: (device: DeviceResponse) => void;
  onManageVDOMs?: (device: DeviceResponse) => void;
  onTestConnection?: (device: DeviceResponse) => Promise<boolean>;
  onSyncVDOMs?: (device: DeviceResponse) => Promise<boolean>;
  onEdit?: (device: DeviceResponse) => void;
}

export const DevicesTable: React.FC<DevicesTableProps> = ({
  devices,
  actionLoadingId,
  onToggleStatus,
  onDelete,
  onManageVDOMs,
  onTestConnection,
  onSyncVDOMs,
  onEdit,
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error'>>({});
  const [syncResults, setSyncResults] = useState<Record<string, 'success' | 'error'>>({});

  if (!devices || devices.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No se encontraron dispositivos FortiGate registrados.
      </div>
    );
  }

  const handleTestClick = async (device: DeviceResponse) => {
    if (!onTestConnection) return;
    setTestingId(device.id);

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

  const handleSyncClick = async (device: DeviceResponse) => {
    if (!onSyncVDOMs) return;
    setSyncingId(device.id);

    setSyncResults((prev) => {
      const updated = { ...prev };
      delete updated[device.id];
      return updated;
    });

    try {
      const isSuccess = await onSyncVDOMs(device);
      setSyncResults((prev) => ({
        ...prev,
        [device.id]: isSuccess ? 'success' : 'error',
      }));
    } catch {
      setSyncResults((prev) => ({
        ...prev,
        [device.id]: 'error',
      }));
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="overflow-visible">
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-50 uppercase text-xs text-gray-500 font-semibold border-b border-gray-200">
          <tr>
            <th className="px-5 py-3.5">Dispositivo / Host</th>
            <th className="px-5 py-3.5">Topología / Segmentación</th>
            <th className="px-5 py-3.5">FortiOS & Serial</th>
            <th className="px-5 py-3.5 text-center">Particiones</th>
            <th className="px-5 py-3.5 text-center">Estado</th>
            <th className="px-5 py-3.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {devices.map((d) => {
            const isProcessing = actionLoadingId === d.id;
            const isTesting = testingId === d.id;
            const isSyncing = syncingId === d.id;
            const testStatus = testResults[d.id];
            const syncStatus = syncResults[d.id];

            return (
              <tr key={d.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-5 py-4 font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{d.name}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">
                    {d.host}:{d.port}
                  </div>
                </td>

                <td className="px-5 py-4 text-xs font-medium text-gray-800">
                  {d.has_vdom_enabled ? (
                    <div className="flex items-center gap-1.5 text-purple-700 font-medium">
                      <Network className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>Multitenant (Por VDOMs)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                      <HardDrive className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Dedicado / Standalone</span>
                    </div>
                  )}
                </td>

                <td className="px-5 py-4 text-xs text-gray-600">
                  <div className="font-semibold text-gray-800">FortiOS v{d.fortios_version}</div>
                  <div className="font-mono text-gray-400 text-[11px]">
                    {d.serial_number || <span className="italic">Pendiente de Sync</span>}
                  </div>
                </td>

                <td className="px-5 py-4 text-center">
                  {d.has_vdom_enabled ? (
                    <button
                      type="button"
                      onClick={() => onManageVDOMs && onManageVDOMs(d)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all cursor-pointer shadow-xs"
                      title="Explorar y asignar VDOMs"
                    >
                      <Layers className="w-3 h-3" />
                      <span>VDOMs</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      <HardDrive className="w-3 h-3 text-gray-400" />
                      <span>Root</span>
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
                    {/* BOTÓN TEST */}
                    {onTestConnection && (
                      <button
                        type="button"
                        onClick={() => handleTestClick(d)}
                        disabled={isTesting || isProcessing || isSyncing}
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
                        <span>{isTesting ? 'Probando...' : testStatus === 'success' ? 'OK' : 'Test'}</span>
                      </button>
                    )}

                    {/* BOTÓN SINCRONIZAR VDOMS DIRECTO EN LA TABLA */}
                    {d.has_vdom_enabled && onSyncVDOMs && (
                      <button
                        type="button"
                        onClick={() => handleSyncClick(d)}
                        disabled={isSyncing || isProcessing || isTesting}
                        title="Sincronizar particiones desde el FortiGate"
                        className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all disabled:opacity-40 cursor-pointer shadow-xs inline-flex items-center gap-1 ${
                          syncStatus === 'success'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : syncStatus === 'error'
                            ? 'border-rose-300 bg-rose-50 text-rose-700'
                            : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                        }`}
                      >
                        {isSyncing ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-purple-600" />
                        ) : syncStatus === 'success' ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : syncStatus === 'error' ? (
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                        ) : (
                          <RefreshCw className="w-3 h-3 text-purple-600" />
                        )}
                        <span>{isSyncing ? 'Sync...' : syncStatus === 'success' ? 'Listo' : 'Sync'}</span>
                      </button>
                    )}

                    {/* BOTÓN EDITAR */}
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(d)}
                        disabled={isProcessing}
                        className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 cursor-pointer shadow-xs inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3 text-gray-500" />
                        <span>Editar</span>
                      </button>
                    )}

                    {/* BOTÓN ACTIVAR/DESACTIVAR */}
                    {onToggleStatus && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(d)}
                        disabled={isProcessing}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-30 shadow-xs cursor-pointer ${
                          d.is_active
                            ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {d.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    )}

                    {/* BOTÓN ELIMINAR */}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(d)}
                        disabled={isProcessing}
                        className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-200 bg-white text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
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