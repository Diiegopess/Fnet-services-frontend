// src/pages/HardeningPage.tsx

import React, { useEffect, useState } from 'react';
import { useHardening } from '../domains/hardening/useHardening';
import { useDevices } from '../domains/devices/useDevices';
import { ProfilesList } from '../domains/hardening/components/ProfilesList';
import { AdHocBuilder } from '../domains/hardening/components/AdHocBuilder';
import { AuditRunner } from '../domains/hardening/components/AuditRunner';
import { AuditHistoryTable } from '../domains/hardening/components/AuditHistoryTable';

export const HardeningPage: React.FC = () => {
  const { profiles, catalogRules, loading, error } = useHardening();
  const { devices, fetchDevices } = useDevices();
  const [activeTab, setActiveTab] = useState<'profiles' | 'adhoc' | 'eval' | 'history'>('profiles');

  useEffect(() => {
    if (fetchDevices) {
      fetchDevices();
    }
  }, [fetchDevices]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Módulo de Hardening</h1>
        <p className="text-sm text-gray-500">
          Gestión de estándares, construcción Ad-hoc y ejecución de auditorías
        </p>
      </div>

      {/* Manejo de Estados de Carga y Error */}
      {loading && (
        <div className="p-4 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
          Cargando datos de hardening...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
          Error al cargar datos: {error}
        </div>
      )}

      {/* Navegación por Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'profiles'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Perfiles Base
          </button>
          
          <button
            onClick={() => setActiveTab('adhoc')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'adhoc'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Crear Evaluaciones Personalizadas (Ad-hoc)
          </button>

          <button
            onClick={() => setActiveTab('eval')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'eval'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ejecutar Evaluación
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Historial de Evaluaciones
          </button>
        </nav>
      </div>

      {/* Vistas */}
      {!loading && activeTab === 'profiles' && <ProfilesList profiles={profiles} />}

      {!loading && activeTab === 'adhoc' && (
        <AdHocBuilder 
          catalogRules={catalogRules}
          devices={devices || []} 
        />
      )}

      {!loading && activeTab === 'eval' && (
        <AuditRunner 
          profiles={profiles} 
          devices={devices || []} 
          catalogRules={catalogRules} 
        />
      )}

      {!loading && activeTab === 'history' && (
        <AuditHistoryTable />
      )}
    </div>
  );
};

export default HardeningPage;