// DeviceSelectorTable.tsx

import React from 'react';

export interface TargetDevice {
  id: string;
  name: string;
  target_type: 'DEVICE' | 'VDOM' | string;
  ip_address?: string;
  status?: string;
}

interface DeviceSelectorTableProps {
  devices: TargetDevice[];
  selectedDeviceId: string | null;
  onSelectDevice: (id: string) => void;
  loading?: boolean;
}

export const DeviceSelectorTable: React.FC<DeviceSelectorTableProps> = ({
  devices = [],
  selectedDeviceId,
  onSelectDevice,
  loading = false,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h4 className="text-sm font-bold text-gray-900">Catálogo de Dispositivos</h4>
          <p className="text-xs text-gray-500">
            Selecciona el equipo o VDOM sobre el cual ejecutarás la auditoría.
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-gray-200 text-gray-700 rounded-md">
          {devices.length} disponibles
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
              <th className="p-3 text-center w-12"></th>
              <th className="p-3">Nombre / Hostname</th>
              <th className="p-3">Tipo Target</th>
              <th className="p-3">Dirección IP</th>
              <th className="p-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-gray-400">
                  Cargando catálogo de dispositivos...
                </td>
              </tr>
            ) : devices.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-gray-400">
                  No hay dispositivos o VDOMs registrados en el catálogo.
                </td>
              </tr>
            ) : (
              devices.map((device) => {
                const isSelected = selectedDeviceId === device.id;
                return (
                  <tr
                    key={device.id}
                    onClick={() => onSelectDevice(device.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/60 font-medium'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="radio"
                        name="device_selection"
                        checked={isSelected}
                        onChange={() => onSelectDevice(device.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                    </td>
                    <td className="p-3 text-gray-900 font-medium">{device.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-gray-100 text-gray-600">
                        {device.target_type}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs text-gray-600">
                      {device.ip_address || '127.0.0.1'}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          device.status === 'OFFLINE'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {device.status || 'ACTIVO'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};