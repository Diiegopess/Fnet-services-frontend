import React from 'react';
import type { DeviceResponse } from '../device.types';
import { Shield, Layers, HardDrive } from 'lucide-react';

interface DevicesTableProps {
  devices: DeviceResponse[];
  actionLoadingId?: string | null;
  onToggleStatus?: (device: DeviceResponse) => void;
  onDelete?: (device: DeviceResponse) => void;
  onManageVDOMs?: (device: DeviceResponse) => void;
}

export const DevicesTable: React.FC<DevicesTableProps> = ({
  devices,
  actionLoadingId,
  onToggleStatus,
  onDelete,
  onManageVDOMs,
}) => {
  if (!devices || devices.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No se encontraron dispositivos FortiGate registrados.
      </div>
    );
  }

  return (
    <div className="overflow-visible">
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-50 uppercase text-xs text-gray-500 font-semibold border-b border-gray-200">
          <tr>
            <th className="px-5 py-3.5">Dispositivo / Host</th>
            <th className="px-5 py-3.5">FortiOS & Serial</th>
            <th className="px-5 py-3.5 text-center">Modo / VDOMs</th>
            <th className="px-5 py-3.5 text-center">Estado</th>
            <th className="px-5 py-3.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {devices.map((d) => {
            const isProcessing = actionLoadingId === d.id;

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

                <td className="px-5 py-4 text-xs text-gray-600">
                  <div className="font-semibold text-gray-800">v{d.fortios_version}</div>
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
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleStatus && onToggleStatus(d)}
                      disabled={isProcessing}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-30 shadow-xs cursor-pointer ${
                        d.is_active
                          ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {d.is_active ? 'Desactivar' : 'Activar'}
                    </button>

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