// src/domains/hardening/components/DeviceSelectorTable.tsx

import React from 'react';
import { Layers, Server } from 'lucide-react';

export interface TargetItem {
  id: string; // Puede ser device_id o vdom_id
  name: string;
  target_type: 'DEVICE' | 'VDOM';
  device_id: string; // Referencia al chasis padre
  vdom_id?: string;
  host: string;
  fortios_version?: string;
  is_active: boolean;
  client_name?: string;
}

interface DeviceSelectorTableProps {
  targets: TargetItem[];
  selectedTargetId: string | null;
  onSelectTarget: (target: TargetItem) => void;
  loading?: boolean;
}

export const DeviceSelectorTable: React.FC<DeviceSelectorTableProps> = ({
  targets = [],
  selectedTargetId,
  onSelectTarget,
  loading = false,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h4 className="text-sm font-bold text-gray-900">Objetivos de Evaluación</h4>
          <p className="text-xs text-gray-500">
            Selecciona el chasis global o la partición VDOM a auditar.
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-gray-200 text-gray-700 rounded-md">
          {targets.length} disponibles
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
              <th className="p-3 text-center w-12"></th>
              <th className="p-3">Objetivo / Nombre</th>
              <th className="p-3">Alcance / Tipo</th>
              <th className="p-3">Versión FortiOS</th>
              <th className="p-3">Host / Dirección</th>
              <th className="p-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-gray-400">
                  Cargando catálogo de objetivos...
                </td>
              </tr>
            ) : targets.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-gray-400">
                  No hay objetivos o VDOMs disponibles para evaluar.
                </td>
              </tr>
            ) : (
              targets.map((target) => {
                const isSelected = selectedTargetId === target.id;
                const isVDOM = target.target_type === 'VDOM';

                return (
                  <tr
                    key={target.id}
                    onClick={() => onSelectTarget(target)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 font-medium'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="radio"
                        name="target_selection"
                        checked={isSelected}
                        onChange={() => onSelectTarget(target)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {isVDOM ? (
                          <Layers className="w-4 h-4 text-purple-600 shrink-0" />
                        ) : (
                          <Server className="w-4 h-4 text-gray-500 shrink-0" />
                        )}
                        <div>
                          <p className="text-gray-900 font-medium">{target.name}</p>
                          {target.client_name && (
                            <p className="text-[10px] text-purple-700 font-semibold">
                              Cliente: {target.client_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          isVDOM
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {isVDOM ? 'VDOM / Partición' : 'Chasis Global'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {target.fortios_version ? `v${target.fortios_version}` : 'v7.2.x'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs text-gray-600">
                      {target.host}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          target.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {target.is_active ? 'ACTIVO' : 'INACTIVO'}
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