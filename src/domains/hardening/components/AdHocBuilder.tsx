// AdHocBuilder.tsx

import React, { useState } from 'react';

interface Rule {
  id: string;
  name: string;
  standard: 'CIS' | 'BP' | 'GAMMA';
  severity: string;
}

const INITIAL_RULES: Rule[] = [
  { id: 'CIS-001', name: 'Disable Administrative HTTP Access', standard: 'CIS', severity: 'HIGH' },
  { id: 'CIS-002', name: 'Set Strong SSH Port', standard: 'CIS', severity: 'MEDIUM' },
  { id: 'BP-101', name: 'Enforce Password Complexity Policy', standard: 'BP', severity: 'CRITICAL' },
  { id: 'BP-102', name: 'Enable Idle Timeout for Admin Sessions', standard: 'BP', severity: 'LOW' },
  { id: 'GAMMA-001', name: 'Corporate Login Disclaimer Banner', standard: 'GAMMA', severity: 'LOW' },
  { id: 'GAMMA-002', name: 'Disable Central Management Defaults', standard: 'GAMMA', severity: 'HIGH' },
];

export const AdHocBuilder: React.FC = () => {
  const [profileName, setProfileName] = useState('');
  const [availableRules, setAvailableRules] = useState<Rule[]>(INITIAL_RULES);
  const [selectedRules, setSelectedRules] = useState<Rule[]>([]);

  // Agrega una regla al cuadro de evaluación Ad-hoc
  const addRule = (rule: Rule) => {
    setAvailableRules((prev) => prev.filter((r) => r.id !== rule.id));
    setSelectedRules((prev) => [...prev, rule]);
  };

  // Devuelve una regla a su caja de origen
  const removeRule = (rule: Rule) => {
    setSelectedRules((prev) => prev.filter((r) => r.id !== rule.id));
    setAvailableRules((prev) => [...prev, rule]);
  };

  const cisRules = availableRules.filter((r) => r.standard === 'CIS');
  const bpRules = availableRules.filter((r) => r.standard === 'BP');
  const gammaRules = availableRules.filter((r) => r.standard === 'GAMMA');

  return (
    <div className="space-y-6">
      {/* Selector de Nombre del Perfil */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-2/3">
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
            Nombre del Perfil Ad-hoc
          </label>
          <input
            type="text"
            placeholder="Ej: Auditoría Personalizada Servidores DMZ"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button
          disabled={!profileName || selectedRules.length === 0}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 cursor-pointer self-end"
        >
          Guardar Perfil Ad-hoc
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMNA IZQUIERDA: Cuadro Limpio (Perfil Objetivo) */}
        <div className="bg-white rounded-xl border-2 border-blue-200 p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Reglas Seleccionadas para el Perfil</h3>
              <p className="text-xs text-gray-500">Haz clic en una regla para removerla de este grupo.</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-xs">
              {selectedRules.length} Reglas
            </span>
          </div>

          <div className="min-h-[380px] max-h-[500px] overflow-y-auto space-y-2 border-2 border-dashed border-gray-200 rounded-lg p-3 bg-gray-50/50">
            {selectedRules.length === 0 ? (
              <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center text-gray-400 p-6">
                <span className="text-3xl mb-2">📥</span>
                <p className="text-sm font-medium">Cuadro limpio</p>
                <p className="text-xs">Haz clic en las reglas del panel derecho para ir agregándolas aquí.</p>
              </div>
            ) : (
              selectedRules.map((rule) => (
                <div
                  key={rule.id}
                  onClick={() => removeRule(rule)}
                  className="p-3 bg-white border border-blue-200 hover:border-red-300 rounded-lg shadow-2xs flex justify-between items-center cursor-pointer transition-all hover:bg-red-50/40 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                      {rule.id}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{rule.name}</p>
                      <span className="text-[10px] text-gray-400 uppercase font-medium">{rule.standard}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-red-600 font-bold px-2">✕</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Cajas Origen por Estándar */}
        <div className="space-y-4">
          {/* Caja CIS */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex justify-between">
              <span>Estándar CIS</span>
              <span className="text-gray-400 font-normal">({cisRules.length})</span>
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {cisRules.length === 0 ? (
                <p className="text-xs text-gray-400 italic p-2">No hay reglas CIS disponibles.</p>
              ) : (
                cisRules.map((rule) => (
                  <div
                    key={rule.id}
                    onClick={() => addRule(rule)}
                    className="p-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-md flex justify-between items-center cursor-pointer transition-colors"
                  >
                    <span className="font-mono text-xs font-bold text-gray-700">{rule.id}</span>
                    <span className="text-xs text-gray-600 truncate max-w-[220px]">{rule.name}</span>
                    <span className="text-xs font-bold text-blue-600">+</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Caja BP (Buenas Prácticas) */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex justify-between">
              <span>Estándar Buenas Prácticas (BP)</span>
              <span className="text-gray-400 font-normal">({bpRules.length})</span>
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {bpRules.length === 0 ? (
                <p className="text-xs text-gray-400 italic p-2">No hay reglas BP disponibles.</p>
              ) : (
                bpRules.map((rule) => (
                  <div
                    key={rule.id}
                    onClick={() => addRule(rule)}
                    className="p-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-md flex justify-between items-center cursor-pointer transition-colors"
                  >
                    <span className="font-mono text-xs font-bold text-gray-700">{rule.id}</span>
                    <span className="text-xs text-gray-600 truncate max-w-[220px]">{rule.name}</span>
                    <span className="text-xs font-bold text-blue-600">+</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Caja GAMMA */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex justify-between">
              <span>Estándar GAMMA</span>
              <span className="text-gray-400 font-normal">({gammaRules.length})</span>
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {gammaRules.length === 0 ? (
                <p className="text-xs text-gray-400 italic p-2">No hay reglas GAMMA disponibles.</p>
              ) : (
                gammaRules.map((rule) => (
                  <div
                    key={rule.id}
                    onClick={() => addRule(rule)}
                    className="p-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-md flex justify-between items-center cursor-pointer transition-colors"
                  >
                    <span className="font-mono text-xs font-bold text-gray-700">{rule.id}</span>
                    <span className="text-xs text-gray-600 truncate max-w-[220px]">{rule.name}</span>
                    <span className="text-xs font-bold text-blue-600">+</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};