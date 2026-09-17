// src/domains/hardening/components/HardeningAuditTab.tsx

import React, { useState, useMemo } from 'react';
import { ProfilesList } from './ProfilesList';
import { AdHocBuilder } from './AdHocBuilder';
import { AuditHistoryTable } from './AuditHistoryTable';
import { useHardening } from '../useHardening';
import type { RuleCatalogItem } from '../hardening.types';

export const HardeningAuditTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'base' | 'adhoc' | 'history'>('base');
  const { profiles } = useHardening();

  // Consolida dinámicamente el catálogo de reglas únicas a partir de los perfiles cargados
  const catalogRules = useMemo(() => {
    const rulesMap = new Map<string, RuleCatalogItem>();
    profiles?.forEach((profile) => {
      profile.rules?.forEach((rule) => {
        if (!rulesMap.has(rule.id)) {
          rulesMap.set(rule.id, rule);
        }
      });
    });
    return Array.from(rulesMap.values());
  }, [profiles]);

  return (
    <div>
      {/* Navegación por pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('base')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'base'
                ? 'border-blue-500 text-blue-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Perfiles Base
          </button>

          <button
            onClick={() => setActiveTab('adhoc')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'adhoc'
                ? 'border-blue-500 text-blue-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Crear Evaluaciones Personalizadas (Ad-hoc)
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📋 Historial de Evaluaciones
          </button>
        </nav>
      </div>

      {/* Renderizado del Contenido */}
      <div className="py-6">
        {activeTab === 'base' && <ProfilesList profiles={profiles} />}
        
        {activeTab === 'adhoc' && (
          <AdHocBuilder
            catalogRules={catalogRules}
            onSaveProfile={(name, ruleIds) => {
              console.log('Guardando perfil:', name, ruleIds);
            }}
          />
        )}

        {activeTab === 'history' && <AuditHistoryTable />}
      </div>
    </div>
  );
};