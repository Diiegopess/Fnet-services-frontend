// src/domains/hardening/components/ProfilesList.tsx

import React, { useEffect, useState } from 'react';
import type { HardeningProfile, RuleSeverity } from '../hardening.types';
import { compareRuleIds } from '../ruleOrdering';

interface ProfilesListProps {
  profiles: HardeningProfile[];
}

const SEVERITY_STYLES: Record<RuleSeverity | string, string> = {
  CRITICAL: 'bg-rose-100 text-rose-800 border-rose-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
  LOW: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export const ProfilesList: React.FC<ProfilesListProps> = ({ profiles }) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  // Asegura seleccionar el primer perfil cuando cargue la respuesta asíncrona
  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

  const selectedProfile =
    profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  return (
    <div className="space-y-6">
      {/* Tarjetas Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => {
          const isSelected = profile.id === selectedProfile?.id;

          return (
            <div
              key={profile.id}
              onClick={() => setSelectedProfileId(profile.id)}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all bg-white shadow-2xs ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900 text-base">{profile.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase tracking-wider">
                  {profile.profile_type || 'SYSTEM'}
                </span>
              </div>
              
              <p className="text-xs text-gray-500 min-h-[36px] line-clamp-2">
                {profile.description || 'Plantilla predeterminada del estándar.'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tabla Inferior de Reglas */}
      {selectedProfile && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Reglas del Perfil: {selectedProfile.name}
              </h3>
              <p className="text-xs text-gray-500">
                Catálogo de verificaciones asignadas a este perfil de cumplimiento.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {selectedProfile.rules?.length || 0} reglas asignadas
            </span>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">ID Regla</th>
                  <th className="py-3 px-4">Nombre / Descripción</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Estándar</th>
                  <th className="py-3 px-4">Severidad</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...(selectedProfile.rules || [])]
                  .sort((a, b) => compareRuleIds(a.id, b.id))
                  .map((rule) => {
                    const ruleId = rule.id;
                    const severity = rule.default_severity || 'LOW';
                    const severityClass =
                      SEVERITY_STYLES[severity] || SEVERITY_STYLES.LOW;

                    return (
                      <tr key={`${rule.id}_${rule.standard_version}`} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          {ruleId}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-800">{rule.name}</p>
                          {rule.description && (
                            <p className="text-[11px] text-gray-500 line-clamp-2">
                              {rule.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 uppercase font-medium">
                          {rule.category || 'GENERAL'}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-700">
                          {rule.standard || 'CIS'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${severityClass}`}>
                            {severity}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                              rule.is_active !== false
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {rule.is_active !== false ? 'ACTIVA' : 'INACTIVA'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};