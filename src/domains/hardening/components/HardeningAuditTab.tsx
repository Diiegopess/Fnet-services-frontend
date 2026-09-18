// src/domains/hardening/components/HardeningAuditTab.tsx

import React, { useState, useMemo } from 'react';
import { ProfilesList } from './ProfilesList';
import { AdHocBuilder } from './AdHocBuilder';
import { AuditHistoryTable } from './AuditHistoryTable';
import { AuditRunner } from './AuditRunner'; // 👈 Importante: Importar AuditRunner
import { useHardening } from '../useHardening';
import { useDevices } from '../../devices/useDevices';
import type { RuleCatalogItem } from '../hardening.types';

export const HardeningAuditTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'base' | 'adhoc' | 'runner' | 'history'>('base');
  const { profiles } = useHardening();
  const { devices } = useDevices();

  // Construcción del catálogo unificado resolviendo IDs y Códigos de regla
  const catalogRules = useMemo(() => {
    const rulesMap = new Map<string, RuleCatalogItem>();
    profiles?.forEach((profile) => {
      profile.rules?.forEach((rule: any) => {
        // Obtenemos el identificador único (rule_id, code o id)
        const key = rule.rule_id || rule.code || rule.id;
        if (key && !rulesMap.has(key)) {
          rulesMap.set(key, rule);
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

          {/* 👈 Pestaña "Ejecutar Evaluación" agregada */}
          <button
            onClick={() => setActiveTab('runner')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'runner'
                ? 'border-blue-500 text-blue-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ejecutar Evaluación
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
            devices={devices || []}
          />
        )}

        {/* 👈 Renderizado de AuditRunner pasándole el catalogRules */}
        {activeTab === 'runner' && (
          <AuditRunner
            profiles={profiles || []}
            devices={devices || []}
            catalogRules={catalogRules}
          />
        )}

        {activeTab === 'history' && <AuditHistoryTable />}
      </div>
    </div>
  );
};