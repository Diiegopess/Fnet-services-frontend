import React, { useState, useEffect } from 'react';
import type { HardeningProfile } from '../hardening.types';
import { DeviceSelectorTable } from './DeviceSelectorTable';
import type { TargetDevice } from './DeviceSelectorTable';

interface HardeningAuditFormProps {
  profiles: HardeningProfile[];
  onExecuteAudit: (profileId: string, deviceId: string) => void;
}

export const HardeningAuditForm: React.FC<HardeningAuditFormProps> = ({
  profiles,
  onExecuteAudit,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [devices, setDevices] = useState<TargetDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState<boolean>(false);

  // Carga inicial del perfil por defecto
  useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

  // Cargar catálogo de dispositivos desde la API / Servicio
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingDevices(true);
      try {
        // Reemplazar con llamada a tu hook o servicio de catálogo:
        // const data = await devicesService.getCatalog();
        // setDevices(data);
        
        // Datos mock de prueba mientras conectas tu endpoint de catálogo
        setDevices([
          { id: 'dev-1', name: 'FW-CORE-PRIMARY', target_type: 'DEVICE', ip_address: '10.0.0.1', status: 'ONLINE' },
          { id: 'vdom-1', name: 'VDOM-DMZ-PROD', target_type: 'VDOM', ip_address: '10.0.10.1', status: 'ONLINE' },
        ]);
      } catch (err) {
        console.error('Error al obtener catálogo de dispositivos:', err);
      } finally {
        setLoadingDevices(false);
      }
    };

    fetchCatalog();
  }, []);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const rules = selectedProfile?.rules || [];

  const handleRun = () => {
    if (selectedProfileId && selectedDeviceId) {
      onExecuteAudit(selectedProfileId, selectedDeviceId);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-6 max-w-4xl mx-auto">
      {/* Selector de Perfil */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Perfil de Evaluación:
        </label>
        <select
          value={selectedProfileId}
          onChange={(e) => setSelectedProfileId(e.target.value)}
          className="w-full md:w-1/2 p-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
        >
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
      </div>

      {/* Badges de Reglas Asociadas */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
          Reglas asociadas a evaluar ({rules.length}):
        </span>
        <div className="flex flex-wrap gap-2">
          {rules.length > 0 ? (
            rules.map((rule) => (
              <span
                key={rule.id}
                className="inline-block bg-blue-100 text-blue-800 text-xs font-mono font-bold px-2.5 py-1 rounded border border-blue-200"
              >
                {rule.rule_id || rule.code || rule.id}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400">Sin reglas asociadas en este perfil.</span>
          )}
        </div>
      </div>

      {/* Tabla del Catálogo de Dispositivos (Sustituye al TextArea CLI) */}
      <DeviceSelectorTable
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        onSelectDevice={(id) => setSelectedDeviceId(id)}
        loading={loadingDevices}
      />

      {/* Botón de Acción */}
      <div>
        <button
          onClick={handleRun}
          disabled={!selectedProfileId || !selectedDeviceId}
          className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xs"
        >
          Ejecutar Auditoría
        </button>
      </div>
    </div>
  );
};