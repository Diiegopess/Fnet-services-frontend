// HardeningPage.tsx

import React, { useEffect, useState } from 'react';
import { useHardening } from '../domains/hardening/useHardening';
import { ProfilesList } from '../domains/hardening/components/ProfilesList';
import { AdHocBuilder } from '../domains/hardening/components/AdHocBuilder';

export const HardeningPage: React.FC = () => {
  const { profiles, fetchProfiles } = useHardening();
  const [activeTab, setActiveTab] = useState<'profiles' | 'adhoc'>('profiles');

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Módulo de Hardening</h1>
        <p className="text-sm text-gray-500">Gestión de estándares y construcción de evaluaciones Ad-hoc</p>
      </div>

      {/* Navegación por Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'profiles'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Perfiles Base
          </button>
          <button
            onClick={() => setActiveTab('adhoc')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'adhoc'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Crear Evaluaciones Personalizadas (Ad-hoc)
          </button>
        </nav>
      </div>

      {/* Vista 1: Perfiles Base */}
      {activeTab === 'profiles' && <ProfilesList profiles={profiles} />}

      {/* Vista 2: Constructor Interactivo de Reglas */}
      {activeTab === 'adhoc' && <AdHocBuilder />}
    </div>
  );
};

export default HardeningPage;