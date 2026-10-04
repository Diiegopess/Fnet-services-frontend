// src/pages/HardeningPage.tsx

import React, { useEffect } from 'react';
import { useHardening } from '../domains/hardening/useHardening';
import { useDevices } from '../domains/devices/useDevices';
import { HardeningAuditTab } from '../domains/hardening/components/HardeningAuditTab';

export const HardeningPage: React.FC = () => {
  const { loading, error } = useHardening();
  const { fetchDevices } = useDevices();

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

      {/* El componente de dominio gestiona todas las pestañas internamente */}
      {!loading && <HardeningAuditTab />}
    </div>
  );
};

export default HardeningPage;