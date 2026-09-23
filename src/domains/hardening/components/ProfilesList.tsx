// ProfilesList.tsx

import React, { useState } from 'react';
import type { HardeningProfile } from '../hardening.types';
import { compareRuleIds } from '../ruleOrdering';

interface ProfilesListProps {
  profiles: HardeningProfile[];
}

export const ProfilesList: React.FC<ProfilesListProps> = ({ profiles }) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    profiles[0]?.id || ''
  );

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  return (
    <div className="space-y-6">
      {/* Tarjetas Superiores (Sin el contador de reglas) */}
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
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Reglas del Perfil: {selectedProfile.name}
            </h3>
            <p className="text-xs text-gray-500">
              Catálogo de verificaciones asignadas a este perfil de cumplimiento.
            </p>
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
                  .sort((a, b) =>
                    compareRuleIds(a.rule_id || a.code || a.id, b.rule_id || b.code || b.id)
                  )
                  .map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {rule.rule_id || rule.code || rule.id}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-800">{rule.name}</p>
                      {rule.description && (
                        <p className="text-[11px] text-gray-500">{rule.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{rule.category || 'General'}</td>
                    <td className="py-3 px-4 font-bold text-gray-700">
                      {rule.standard || selectedProfile.name.split(' ')[2] || 'BASE'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-blue-50 text-blue-700">
                        {rule.default_severity || 'LOW'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 uppercase">
                        {rule.is_active !== false ? 'ACTIVA' : 'INACTIVA'}
                      </span>
                    </td>
                  </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};