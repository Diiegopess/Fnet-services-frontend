import React, { useState } from 'react';
import type { HardeningProfile, AuditReport, Finding } from '../hardening.types';
import { useHardening } from '../useHardening';

interface Device {
  id: string;
  name: string;
  host: string;
}

interface AuditRunnerProps {
  profiles: HardeningProfile[];
  devices: Device[];
}

// Subcomponente Modal para mostrar la Remediación
const RemediationModal: React.FC<{
  finding: Finding;
  onClose: () => void;
}> = ({ finding, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (finding.remediation_cmd) {
      navigator.clipboard.writeText(finding.remediation_cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-150">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Guía de Remediación — <span className="font-mono text-blue-600">{finding.rule_id}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Comandos sugeridos para corregir el hallazgo</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200/50 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg text-xs">
            <div>
              <span className="font-semibold text-gray-500 block">Valor Detectado:</span>
              <span className="font-mono text-gray-800">{finding.current_value || 'N/A'}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-500 block">Valor Esperado:</span>
              <span className="font-mono text-gray-800">{finding.expected_value || 'N/A'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-700">Comandos CLI de Configuración:</label>
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1"
              >
                {copied ? <span className="text-green-600 font-bold">✓ Copiado</span> : <span>Copiar Comandos</span>}
              </button>
            </div>
            <div className="p-4 bg-gray-900 text-amber-300 font-mono text-xs rounded-lg overflow-x-auto max-h-80 border border-gray-800 shadow-inner">
              <pre className="whitespace-pre-wrap leading-relaxed">{finding.remediation_cmd}</pre>
            </div>
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export const AuditRunner: React.FC<AuditRunnerProps> = ({ profiles, devices }) => {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [activeRemediation, setActiveRemediation] = useState<Finding | null>(null);

  const { executeAudit, loading, error: hookError } = useHardening();
  const [report, setReport] = useState<AuditReport | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRunAudit = async () => {
    if (!selectedDevice || !selectedProfile) return;
    setLocalError(null);

    try {
      const result = await executeAudit({
        device_id: selectedDevice,
        raw_config: '',
        execution_type: 'ASSIGNED_PROFILE',
        profile_id: selectedProfile,
      });
      setReport(result);
    } catch (err: any) {
      setLocalError(err?.message || 'Error al ejecutar la evaluación');
    }
  };

  const activeError = localError || hookError;

  const allFindings = report?.findings || report?.findings_data || [];

  const filteredFindings = allFindings.filter((f) => {
    if (filterStatus === 'ALL') return true;
    return f.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Formulario de Selección */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Configuración de Evaluación</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dispositivo (FortiGate)
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Seleccionar Equipo --</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} ({device.host})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Perfil de Evaluación
            </label>
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Seleccionar Perfil --</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeError && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {activeError}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleRunAudit}
            disabled={!selectedDevice || !selectedProfile || loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg disabled:opacity-50 cursor-pointer transition-colors"
          >
            {loading ? 'Evaluando Reglas...' : 'Ejecutar Evaluación'}
          </button>
        </div>
      </div>

      {/* Resultados de la Evaluación */}
      {report && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Resultados de la Evaluación</h3>
              <p className="text-xs text-gray-500">ID Auditoría: {report.id}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-blue-600">
                {report.score !== undefined ? `${report.score}%` : 'N/A'}
              </span>
              <p className="text-xs text-gray-400">Puntaje Global</p>
            </div>
          </div>

          {/* Tarjetas de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 text-green-700 rounded-lg font-semibold border border-green-200">
              Aprobadas: {report.total_passed}
            </div>
            <div className="p-3 bg-red-50 text-red-700 rounded-lg font-semibold border border-red-200">
              Fallidas: {report.total_failed}
            </div>
            <div className="p-3 bg-gray-50 text-gray-700 rounded-lg font-semibold border border-gray-200">
              Evaluadas: {report.total_rules_evaluated || allFindings.length}
            </div>
          </div>

          {/* Filtro rápido por estado */}
          <div className="flex justify-between items-center pt-2">
            <h4 className="text-sm font-bold text-gray-800">
              Detalle de Reglas Evaluadas ({filteredFindings.length})
            </h4>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1 rounded-md font-medium border ${
                  filterStatus === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterStatus('PASSED')}
                className={`px-3 py-1 rounded-md font-medium border ${
                  filterStatus === 'PASSED'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                }`}
              >
                Pasaron
              </button>
              <button
                onClick={() => setFilterStatus('FAILED')}
                className={`px-3 py-1 rounded-md font-medium border ${
                  filterStatus === 'FAILED'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                }`}
              >
                Fallaron
              </button>
            </div>
          </div>

          {/* Tabla de Reglas Evaluadas */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b">
                <tr>
                  <th className="px-4 py-3">Regla / Severidad</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Valor Detectado</th>
                  <th className="px-4 py-3">Valor Esperado</th>
                  <th className="px-4 py-3">Detalle / Evidencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFindings.map((finding: Finding, idx: number) => {
                  const isPassed = finding.status === 'PASSED';

                  return (
                    <tr key={finding.id || idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 align-middle">
                        <div className="font-mono font-bold text-gray-900">
                          {finding.rule_id}
                        </div>
                        {finding.severity && (
                          <span className="inline-block mt-1 text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            {finding.severity}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            isPassed
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {finding.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-middle font-mono text-xs text-gray-800">
                        {finding.current_value || 'N/A'}
                      </td>

                      <td className="px-4 py-3 align-middle font-mono text-xs text-gray-500">
                        {finding.expected_value || 'N/A'}
                      </td>

                      <td className="px-4 py-3 align-middle space-y-1">
                        {finding.reason && (
                          <p className="text-xs text-gray-600">{finding.reason}</p>
                        )}

                        {!isPassed && finding.remediation_cmd && (
                          <button
                            onClick={() => setActiveRemediation(finding)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
                          >
                            <span> Remediación</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Renderizado condicional del Modal */}
      {activeRemediation && (
        <RemediationModal
          finding={activeRemediation}
          onClose={() => setActiveRemediation(null)}
        />
      )}
    </div>
  );
};