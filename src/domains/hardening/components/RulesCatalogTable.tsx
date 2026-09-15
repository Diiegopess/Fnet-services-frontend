// RulesCatalogTable.tsx

import React from 'react';
import type { RuleCatalogItem } from '../hardening.types';

interface RulesCatalogTableProps {
  rules?: RuleCatalogItem[];
}

export const RulesCatalogTable: React.FC<RulesCatalogTableProps> = ({ rules = [] }) => {
  const getSeverityBadge = (severity?: string) => {
    const key = severity?.toUpperCase() || 'INFO';
    const colors: Record<string, string> = {
      CRITICAL: 'bg-red-100 text-red-800 border-red-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      LOW: 'bg-blue-100 text-blue-800 border-blue-200',
      INFO: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return (
      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${colors[key] || colors.INFO}`}>
        {key}
      </span>
    );
  };

  if (!rules || rules.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
        <p className="text-sm font-medium text-gray-500">No hay reglas registradas para este perfil.</p>
        <p className="text-xs text-gray-400 mt-1">Sincroniza el catálogo o selecciona otro perfil.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
            <th className="p-3">ID Regla</th>
            <th className="p-3">Nombre / Descripción</th>
            <th className="p-3">Categoría</th>
            <th className="p-3">Estándar</th>
            <th className="p-3">Severidad</th>
            <th className="p-3">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rules.map((rule) => {
            // Se prioriza el código legible (rule_id o code, p. ej. 'CIS-1.1') sobre el UUID interno
            const displayId = rule.rule_id || rule.code || rule.id;
            const isActive = rule.is_active ?? true;

            return (
              <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 font-mono font-bold text-blue-600 whitespace-nowrap">
                  {displayId}
                </td>
                <td className="p-3 max-w-xs sm:max-w-md">
                  <div className="font-medium text-gray-900">{rule.name}</div>
                  {rule.description && (
                    <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                      {rule.description}
                    </div>
                  )}
                </td>
                <td className="p-3 text-xs text-gray-600 whitespace-nowrap">
                  {rule.category || 'General'}
                </td>
                <td className="p-3 font-semibold text-xs text-gray-700 whitespace-nowrap">
                  {rule.standard || 'N/A'}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {getSeverityBadge(rule.default_severity)}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isActive ? 'ACTIVA' : 'INACTIVA'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};