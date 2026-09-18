import React, { useEffect, useState, useCallback, useMemo } from 'react';
import type { AuditReportListItem, AuditReport, Finding, ExportFormat } from '../hardening.types';
import { hardeningService } from '../hardeningService';
import { useHardening } from '../useHardening';

interface AuditHistoryTableProps {
  onSelectReport?: (report: AuditReport) => void;
}

type MainSortField = 'executed_at' | 'device_name' | 'total_passed' | 'total_failed' | 'score';
type FindingSortField = 'rule_id' | 'status';
type SortDirection = 'asc' | 'desc';

export const AuditHistoryTable: React.FC<AuditHistoryTableProps> = ({ onSelectReport }) => {
  const [reports, setReports] = useState<AuditReportListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { catalogRules, exportAuditReport: exportReport, exporting } = useHardening();

  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [activeRemediation, setActiveRemediation] = useState<Finding | null>(null);
  const [copiedRemediation, setCopiedRemediation] = useState<boolean>(false);

  // Estado para controlar qué celda está expandida mediante clic
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  const [mainSortField, setMainSortField] = useState<MainSortField>('executed_at');
  const [mainSortDir, setMainSortDir] = useState<SortDirection>('desc');

  const [findingSortField, setFindingSortField] = useState<FindingSortField>('rule_id');
  const [findingSortDir, setFindingSortDir] = useState<SortDirection>('asc');

  const [selectedRuleDetail, setSelectedRuleDetail] = useState<{
    rule_id: string;
    rule_name?: string;
    severity?: string;
    description?: string;
  } | null>(null);

  const toggleCellExpansion = useCallback((cellId: string) => {
    setExpandedCell((prev) => (prev === cellId ? null : cellId));
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hardeningService.getAuditReports({ limit: 50 });
      setReports(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Error al cargar el historial de auditorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Manejo de cierre de modales por jerarquía con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeRemediation) {
          setActiveRemediation(null);
        } else if (selectedRuleDetail) {
          setSelectedRuleDetail(null);
        } else if (selectedReport) {
          setSelectedReport(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRemediation, selectedRuleDetail, selectedReport]);

  const handleViewDetails = useCallback(async (reportId: string) => {
    try {
      setLoadingDetailId(reportId);
      const detail = await hardeningService.getAuditReportById(reportId);
      setExpandedCell(null);
      if (onSelectReport) {
        onSelectReport(detail);
      } else {
        setSelectedReport(detail);
      }
    } catch (err: any) {
      alert('No se pudo cargar el detalle de la auditoría seleccionada.');
    } finally {
      setLoadingDetailId(null);
    }
  }, [onSelectReport]);

  const handleCopyRemediation = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedRemediation(true);
      setTimeout(() => setCopiedRemediation(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles', err);
    }
  }, []);

  const handleExport = useCallback(async (format: ExportFormat) => {
    if (!selectedReport?.id) return;
    await exportReport(selectedReport.id, format);
  }, [exportReport, selectedReport]);

  const handleMainSort = useCallback((field: MainSortField) => {
    setMainSortField((prevField) => {
      if (prevField === field) {
        setMainSortDir((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
        return prevField;
      }
      setMainSortDir('asc');
      return field;
    });
  }, []);

  const handleFindingSort = useCallback((field: FindingSortField) => {
    setFindingSortField((prevField) => {
      if (prevField === field) {
        setFindingSortDir((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
        return prevField;
      }
      setFindingSortDir('asc');
      return field;
    });
  }, []);

  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => {
      let comparison = 0;
      if (mainSortField === 'executed_at') {
        comparison =
          new Date(a.executed_at || a.created_at || 0).getTime() -
          new Date(b.executed_at || b.created_at || 0).getTime();
      } else if (mainSortField === 'device_name') {
        const nameA = a.device_name || a.device_id || '';
        const nameB = b.device_name || b.device_id || '';
        comparison = nameA.localeCompare(nameB);
      } else if (mainSortField === 'total_passed') {
        comparison = (a.total_passed || 0) - (b.total_passed || 0);
      } else if (mainSortField === 'total_failed') {
        comparison = (a.total_failed || 0) - (b.total_failed || 0);
      } else if (mainSortField === 'score') {
        comparison = (a.score || 0) - (b.score || 0);
      }
      return mainSortDir === 'asc' ? comparison : -comparison;
    });
  }, [reports, mainSortField, mainSortDir]);

  const sortedFindings = useMemo(() => {
    if (!selectedReport) return [];
    const rawFindings = selectedReport.findings?.length
      ? selectedReport.findings
      : selectedReport.findings_data || [];

    return [...rawFindings].sort((a, b) => {
      let comparison = 0;
      if (findingSortField === 'rule_id') {
        comparison = (a.rule_id || '').localeCompare(b.rule_id || '', undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      } else if (findingSortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }
      return findingSortDir === 'asc' ? comparison : -comparison;
    });
  }, [selectedReport, findingSortField, findingSortDir]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
        <p className="text-sm animate-pulse">Cargando historial de evaluaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex justify-between items-center text-sm">
        <span>{error}</span>
        <button
          onClick={fetchHistory}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-semibold rounded transition-colors cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs space-y-4 p-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Historial de Evaluaciones</h3>
          <p className="text-xs text-gray-500">Listado de auditorías guardadas en el sistema</p>
        </div>
        <button
          onClick={fetchHistory}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer"
        >
          🔄 Actualizar
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b select-none">
            <tr>
              <th
                onClick={() => handleMainSort('executed_at')}
                className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>ID / Fecha</span>
                  {mainSortField === 'executed_at' && (
                    <span className="text-blue-600 font-bold">{mainSortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleMainSort('device_name')}
                className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Dispositivo</span>
                  {mainSortField === 'device_name' && (
                    <span className="text-blue-600 font-bold">{mainSortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3">Tipo Ejecución</th>
              <th
                onClick={() => handleMainSort('total_passed')}
                className="px-4 py-3 text-center cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Aprobadas</span>
                  {mainSortField === 'total_passed' && (
                    <span className="text-blue-600 font-bold">{mainSortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleMainSort('total_failed')}
                className="px-4 py-3 text-center cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Fallidas</span>
                  {mainSortField === 'total_failed' && (
                    <span className="text-blue-600 font-bold">{mainSortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleMainSort('score')}
                className="px-4 py-3 text-center cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Cumplimiento</span>
                  {mainSortField === 'score' && (
                    <span className="text-blue-600 font-bold">{mainSortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 italic">
                  No se registran auditorías guardadas aún.
                </td>
              </tr>
            ) : (
              sortedReports.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 align-middle">
                    <span className="font-mono text-xs font-bold text-gray-800 block">
                      {item.id ? `${item.id.substring(0, 8)}...` : 'N/A'}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {item.executed_at || item.created_at
                        ? new Date(item.executed_at || item.created_at!).toLocaleString()
                        : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle font-medium text-gray-900">
                    {item.device_name || (item.device_id ? item.device_id.substring(0, 8) : 'Desconocido')}
                  </td>
                  <td className="px-4 py-3 align-middle text-xs">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono">
                      {item.execution_type || 'Manual'}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle text-center font-bold text-green-600">
                    {item.total_passed ?? 0}
                  </td>
                  <td className="px-4 py-3 align-middle text-center font-bold text-red-600">
                    {item.total_failed ?? 0}
                  </td>
                  <td className="px-4 py-3 align-middle text-center">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {item.score !== undefined && item.score !== null ? `${Math.round(item.score)}%` : '0%'}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <button
                      onClick={() => handleViewDetails(item.id)}
                      disabled={loadingDetailId === item.id}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {loadingDetailId === item.id ? 'Cargando...' : 'Ver Detalle'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Principal: Auditoría Seleccionada */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div>
                <h3 className="text-base font-bold text-gray-900">Detalle de Auditoría Guardada</h3>
                <p className="text-xs text-gray-500 font-mono">ID: {selectedReport.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport('docx')}
                  disabled={exporting}
                  className="px-3 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  DOCX
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                  className="px-3 py-1 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  PDF
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200/50 transition-colors cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                <div className="p-2.5 bg-green-50 text-green-700 rounded-lg font-semibold border border-green-200 text-sm">
                  Aprobadas: {selectedReport.total_passed ?? 0}
                </div>
                <div className="p-2.5 bg-red-50 text-red-700 rounded-lg font-semibold border border-red-200 text-sm">
                  Fallidas: {selectedReport.total_failed ?? 0}
                </div>
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg font-semibold border border-blue-200 text-sm">
                  Cumplimiento Total: {selectedReport.score !== undefined && selectedReport.score !== null ? `${Math.round(selectedReport.score)}%` : '0%'}
                </div>
                <div className="p-2.5 bg-gray-50 text-gray-700 rounded-lg font-semibold border border-gray-200 text-sm">
                  Evaluadas: {selectedReport.total_rules_evaluated ?? sortedFindings.length}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b select-none">
                    <tr>
                      <th
                        onClick={() => handleFindingSort('rule_id')}
                        className="px-4 py-2.5 cursor-pointer hover:bg-gray-100 transition-colors w-28"
                      >
                        <div className="flex items-center gap-1">
                          <span>Regla / ID</span>
                          {findingSortField === 'rule_id' && (
                            <span className="text-blue-600 font-bold">
                              {findingSortDir === 'asc' ? '▲' : '▼'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleFindingSort('status')}
                        className="px-4 py-2.5 cursor-pointer hover:bg-gray-100 transition-colors w-24"
                      >
                        <div className="flex items-center gap-1">
                          <span>Estado</span>
                          {findingSortField === 'status' && (
                            <span className="text-blue-600 font-bold">
                              {findingSortDir === 'asc' ? '▲' : '▼'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-2.5 text-center w-28">Cumplimiento</th>
                      <th className="px-4 py-2.5">Detalle</th>
                      <th className="px-4 py-2.5">Valor Esperado</th>
                      <th className="px-4 py-2.5 text-right w-28">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedFindings.map((f, idx) => {
                      const isPassed = f.status === 'PASSED';
                      const ruleCompliance = (f as any).compliance_score ?? (isPassed ? 100 : 0);
                      const currentCellId = `current-${idx}`;
                      const expectedCellId = `expected-${idx}`;

                      const isCurrentExpanded = expandedCell === currentCellId;
                      const isExpectedExpanded = expandedCell === expectedCellId;

                      const matchedRule = catalogRules?.find(
                        (r) => r.id === f.rule_id || r.rule_id === f.rule_id
                      );
                      const ruleName = f.rule_name || matchedRule?.name;
                      const ruleDesc = matchedRule?.description || f.reason;

                      return (
                        <tr key={`${f.rule_id}-${idx}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2.5 align-top">
                            <button
                              onClick={() =>
                                setSelectedRuleDetail({
                                  rule_id: f.rule_id,
                                  rule_name: ruleName,
                                  severity: f.severity,
                                  description: ruleDesc,
                                })
                              }
                              className="font-mono font-bold text-blue-600 hover:text-blue-800 text-xs underline decoration-dotted underline-offset-2 cursor-pointer transition-colors"
                              title="Ver detalle de regla"
                            >
                              {f.rule_id}
                            </button>
                          </td>

                          <td className="px-4 py-2.5 align-top">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold inline-block ${
                                isPassed
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-red-100 text-red-800 border border-red-200'
                              }`}
                            >
                              {f.status}
                            </span>
                          </td>

                          <td className="px-4 py-2.5 align-top text-center">
                            <span
                              className={`font-mono text-xs font-bold ${
                                ruleCompliance === 100 ? 'text-green-700' : 'text-red-600'
                              }`}
                            >
                              {ruleCompliance}
                            </span>
                          </td>

                          {/* Columna Detectado: Clic directo para expandir / cerrar */}
                          <td
                            onClick={() => toggleCellExpansion(currentCellId)}
                            className="px-4 py-2.5 align-top font-mono text-xs max-w-md break-words cursor-pointer hover:bg-gray-100/60 transition-colors rounded"
                            title="Haz clic para alternar vista completa"
                          >
                            <div className={isCurrentExpanded ? '' : 'line-clamp-2'}>
                              {f.current_value || 'N/A'}
                            </div>
                          </td>

                          {/* Columna Esperado: Clic directo para expandir / cerrar */}
                          <td
                            onClick={() => toggleCellExpansion(expectedCellId)}
                            className="px-4 py-2.5 align-top font-mono text-xs max-w-xs break-words cursor-pointer hover:bg-gray-100/60 transition-colors rounded"
                            title="Haz clic para alternar vista completa"
                          >
                            <div className={isExpectedExpanded ? '' : 'line-clamp-2'}>
                              {f.expected_value || 'N/A'}
                            </div>
                          </td>

                          <td className="px-4 py-2.5 align-top text-right whitespace-nowrap">
                            {!isPassed && f.remediation_cmd && (
                              <button
                                onClick={() => setActiveRemediation(f)}
                                className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 rounded hover:bg-amber-100 transition-colors cursor-pointer"
                              >
                                Remediación
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

            {/* Botón Cerrar integrado */}
            <div className="flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-xs rounded-lg border border-gray-300 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submodal: Detalle de la Regla */}
      {selectedRuleDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedRuleDetail(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <span className="font-mono font-bold text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {selectedRuleDetail.rule_id}
              </span>
              <button
                onClick={() => setSelectedRuleDetail(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200/50 transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Nombre de la Regla
                </label>
                <h4 className="text-base font-bold text-gray-900">
                  {selectedRuleDetail.rule_name || 'Sin título asignado'}
                </h4>
              </div>

              {selectedRuleDetail.severity && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Nivel de Severidad
                  </label>
                  <span className="inline-block text-xs uppercase font-bold px-2.5 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200">
                    {selectedRuleDetail.severity}
                  </span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Descripción / Objetivo
                </label>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {selectedRuleDetail.description || 'No hay descripción detallada disponible.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setSelectedRuleDetail(null)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-xs rounded-lg border border-gray-300 transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submodal: Remediación */}
      {activeRemediation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveRemediation(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Guía de Remediación — <span className="font-mono text-blue-600">{activeRemediation.rule_id}</span>
                </h3>
                {activeRemediation.rule_name && (
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">{activeRemediation.rule_name}</p>
                )}
              </div>
              <button
                onClick={() => setActiveRemediation(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200/50 transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg text-xs">
                <div>
                  <span className="font-semibold text-gray-500 block">Valor Detectado:</span>
                  <span className="font-mono text-gray-800">{activeRemediation.current_value || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block">Valor Esperado:</span>
                  <span className="font-mono text-gray-800">{activeRemediation.expected_value || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700">Comandos CLI de Configuración:</label>
                  {activeRemediation.remediation_cmd && (
                    <button
                      onClick={() => handleCopyRemediation(activeRemediation.remediation_cmd!)}
                      className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedRemediation ? <span className="text-green-600 font-bold">✓ Copiado</span> : <span>Copiar Comandos</span>}
                    </button>
                  )}
                </div>
                <div className="p-4 bg-gray-900 text-amber-300 font-mono text-xs rounded-lg overflow-x-auto max-h-80 border border-gray-800 shadow-inner">
                  <pre className="whitespace-pre-wrap leading-relaxed">{activeRemediation.remediation_cmd}</pre>
                </div>
              </div>
            </div>

            <div className="flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setActiveRemediation(null)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-xs rounded-lg border border-gray-300 transition-colors cursor-pointer"
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