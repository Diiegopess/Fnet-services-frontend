import React, { useEffect, useState } from 'react';
import type { AuditReportListItem, AuditReport, Finding } from '../hardening.types';
import { hardeningService } from '../hardeningService';

interface AuditHistoryTableProps {
  onSelectReport?: (report: AuditReport) => void;
}

export const AuditHistoryTable: React.FC<AuditHistoryTableProps> = ({ onSelectReport }) => {
  const [reports, setReports] = useState<AuditReportListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para visualización rápida de reporte en Modal
  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [activeRemediation, setActiveRemediation] = useState<Finding | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hardeningService.getAuditReports({ limit: 50 });
      setReports(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Error al cargar el historial de auditorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleViewDetails = async (reportId: string) => {
    try {
      setLoadingDetail(true);
      const detail = await hardeningService.getAuditReportById(reportId);
      if (onSelectReport) {
        onSelectReport(detail);
      } else {
        setSelectedReport(detail);
      }
    } catch (err: any) {
      alert('No se pudo cargar el detalle de la auditoría seleccionada.');
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
        <p className="text-sm">Cargando historial de evaluaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex justify-between items-center text-sm">
        <span>{error}</span>
        <button onClick={fetchHistory} className="px-3 py-1 bg-red-100 hover:bg-red-200 font-semibold rounded">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm space-y-4 p-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Historial de Evaluaciones</h3>
          <p className="text-xs text-gray-500">Listado de auditorías guardadas en el sistema</p>
        </div>
        <button
          onClick={fetchHistory}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b">
            <tr>
              <th className="px-4 py-3">ID / Fecha</th>
              <th className="px-4 py-3">Dispositivo</th>
              <th className="px-4 py-3">Tipo Ejecución</th>
              <th className="px-4 py-3 text-center">Aprobadas</th>
              <th className="px-4 py-3 text-center">Fallidas</th>
              <th className="px-4 py-3 text-center">Puntaje</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 italic">
                  No se registran auditorías guardadas aún.
                </td>
              </tr>
            ) : (
              reports.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 align-middle">
                    <span className="font-mono text-xs font-bold text-gray-800 block">
                      {item.id.substring(0, 8)}...
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(item.executed_at).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle font-medium text-gray-900">
                    {item.device_name || item.device_id.substring(0, 8)}
                  </td>
                  <td className="px-4 py-3 align-middle text-xs">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono">
                      {item.execution_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle text-center font-bold text-green-600">
                    {item.total_passed}
                  </td>
                  <td className="px-4 py-3 align-middle text-center font-bold text-red-600">
                    {item.total_failed}
                  </td>
                  <td className="px-4 py-3 align-middle text-center font-bold text-blue-600">
                    {item.score}%
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <button
                      onClick={() => handleViewDetails(item.id)}
                      disabled={loadingDetail}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-md transition-colors"
                    >
                      {loadingDetail ? 'Cargando...' : 'Ver Detalle'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Auditoría Seleccionada */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Detalle de Auditoría Guardada
                </h3>
                <p className="text-xs text-gray-500 font-mono">ID: {selectedReport.id}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-2.5 bg-green-50 text-green-700 rounded-lg font-semibold border border-green-200">
                  Aprobadas: {selectedReport.total_passed}
                </div>
                <div className="p-2.5 bg-red-50 text-red-700 rounded-lg font-semibold border border-red-200">
                  Fallidas: {selectedReport.total_failed}
                </div>
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg font-semibold border border-blue-200">
                  Puntaje: {selectedReport.score}%
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b">
                    <tr>
                      <th className="px-4 py-2.5">Regla</th>
                      <th className="px-4 py-2.5">Estado</th>
                      <th className="px-4 py-2.5">Detectado</th>
                      <th className="px-4 py-2.5">Esperado</th>
                      <th className="px-4 py-2.5">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(selectedReport.findings || selectedReport.findings_data || []).map((f) => (
                      <tr key={f.id}>
                        <td className="px-4 py-2.5 font-mono font-bold text-gray-900">{f.rule_id}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              f.status === 'PASSED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {f.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs">{f.current_value || 'N/A'}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{f.expected_value || 'N/A'}</td>
                        <td className="px-4 py-2.5">
                          {f.status !== 'PASSED' && f.remediation_cmd && (
                            <button
                              onClick={() => setActiveRemediation(f)}
                              className="px-2 py-1 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100"
                            >
                              Remediación
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end px-6 py-3 bg-gray-50 border-t">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submodal para Remediación */}
      {activeRemediation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h4 className="font-bold text-sm">Remediación — {activeRemediation.rule_id}</h4>
              <button onClick={() => setActiveRemediation(null)}>✕</button>
            </div>
            <div className="p-6">
              <pre className="p-4 bg-gray-900 text-amber-300 font-mono text-xs rounded-lg whitespace-pre-wrap overflow-x-auto">
                {activeRemediation.remediation_cmd}
              </pre>
            </div>
            <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setActiveRemediation(null)}
                className="px-4 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};