// src/domains/hardening/components/AuditHistoryTable.tsx

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import type { AuditReportListItem, AuditReport, ExportFormat } from '../hardening.types';
import { hardeningService } from '../hardeningService';
import { useHardening } from '../useHardening';

interface AuditHistoryTableProps {
  onSelectReport?: (report: AuditReport) => void;
}

type MainSortField = 'executed_at' | 'device_name' | 'total_passed' | 'total_failed' | 'score';
type FindingSortField = 'rule_id' | 'status';
type SortDirection = 'asc' | 'desc';
type ExpandedTab = 'details' | 'remediation';

export const AuditHistoryTable: React.FC<AuditHistoryTableProps> = ({ onSelectReport }) => {
  const [reports, setReports] = useState<AuditReportListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { catalogRules, exportAuditReport: exportReport, exporting } = useHardening();

  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  // Control de acordeón desplegable en línea por fila
  const [expandedRows, setExpandedRows] = useState<Record<string, ExpandedTab | null>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Control de celdas expandidas para texto largo
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  const [mainSortField, setMainSortField] = useState<MainSortField>('executed_at');
  const [mainSortDir, setMainSortDir] = useState<SortDirection>('desc');

  const [findingSortField, setFindingSortField] = useState<FindingSortField>('rule_id');
  const [findingSortDir, setFindingSortDir] = useState<SortDirection>('asc');

  const toggleCellExpansion = useCallback((cellId: string) => {
    setExpandedCell((prev) => (prev === cellId ? null : cellId));
  }, []);

  const toggleRowAccordion = useCallback((rowKey: string, tab: ExpandedTab) => {
    setExpandedRows((prev) => {
      const currentTab = prev[rowKey];
      if (currentTab === tab) {
        return { ...prev, [rowKey]: null };
      }
      return { ...prev, [rowKey]: tab };
    });
  }, []);

  const handleCopyCmd = useCallback((code: string, rowKey: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(rowKey);
    setTimeout(() => setCopiedId(null), 2000);
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

  // Cierre del modal contenedor con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedReport) {
        setSelectedReport(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedReport]);

  const handleViewDetails = useCallback(async (reportId: string) => {
    try {
      setLoadingDetailId(reportId);
      const detail = await hardeningService.getAuditReportById(reportId);
      setExpandedCell(null);
      setExpandedRows({});
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

      {/* Modal Principal: Reporte Histórico */}
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
                <table className="w-full text-left text-sm text-gray-600 border-collapse">
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
                      <th className="px-4 py-2.5">Detalle / Evidencia</th>
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
                        (r) => r.id === f.rule_id
                      );
                      const ruleName = f.rule_name || matchedRule?.name || f.rule_id;
                      const ruleDesc = matchedRule?.description || f.reason || 'Sin descripción disponible';
                      const ruleSeverity = f.severity || matchedRule?.default_severity || 'MEDIUM';

                      const rowKey = `${f.rule_id}-${idx}`;
                      const activeTab = expandedRows[rowKey] || null;

                      return (
                        <React.Fragment key={rowKey}>
                          <tr className={`transition-colors ${activeTab ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
                            {/* ID interactivo para desplegar detalle en línea */}
                            <td className="px-4 py-2.5 align-top">
                              <button
                                onClick={() => toggleRowAccordion(rowKey, 'details')}
                                className="font-mono font-bold text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1.5 cursor-pointer transition-colors group"
                                title="Haz clic para desplegar o contraer el objetivo del control"
                              >
                                <span className="text-gray-400 group-hover:text-blue-600 transition-transform">
                                  {activeTab === 'details' ? '▼' : '▶'}
                                </span>
                                <span className="underline decoration-dotted underline-offset-2">
                                  {f.rule_id}
                                </span>
                              </button>
                            </td>

                            {/* Estado */}
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

                            {/* Cumplimiento */}
                            <td className="px-4 py-2.5 align-top text-center">
                              <span
                                className={`font-mono text-xs font-bold ${
                                  ruleCompliance === 100 ? 'text-green-700' : 'text-red-600'
                                }`}
                              >
                                {ruleCompliance}%
                              </span>
                            </td>

                            {/* Detalle actual */}
                            <td
                              onClick={() => toggleCellExpansion(currentCellId)}
                              className="px-4 py-2.5 align-top font-mono text-xs max-w-md break-words whitespace-pre-wrap cursor-pointer hover:bg-gray-100/60 transition-colors rounded"
                              title="Haz clic para alternar vista completa"
                            >
                              <div className={isCurrentExpanded ? '' : 'line-clamp-3'}>
                                {f.current_value || 'N/A'}
                              </div>
                            </td>

                            {/* Valor esperado */}
                            <td
                              onClick={() => toggleCellExpansion(expectedCellId)}
                              className="px-4 py-2.5 align-top font-mono text-xs max-w-xs break-words whitespace-pre-wrap cursor-pointer hover:bg-gray-100/60 transition-colors rounded"
                              title="Haz clic para alternar vista completa"
                            >
                              <div className={isExpectedExpanded ? '' : 'line-clamp-3'}>
                                {f.expected_value || 'N/A'}
                              </div>
                            </td>

                            {/* Botón remediación en línea */}
                            <td className="px-4 py-2.5 align-top text-right whitespace-nowrap">
                              {!isPassed && f.remediation_cmd && (
                                <button
                                  onClick={() => toggleRowAccordion(rowKey, 'remediation')}
                                  className={`px-2.5 py-1 text-xs font-semibold rounded border cursor-pointer transition-all flex items-center gap-1 ml-auto ${
                                    activeTab === 'remediation'
                                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                      : 'text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100'
                                  }`}
                                >
                                  <span>Remediación</span>
                                  <span className="text-xs">
                                    {activeTab === 'remediation' ? '▲' : '▼'}
                                  </span>
                                </button>
                              )}
                            </td>
                          </tr>

                          {/* ACORDEÓN DESPLEGABLE EN LÍNEA */}
                          {activeTab && (
                            <tr className="bg-slate-50/80 border-b border-gray-200">
                              <td colSpan={6} className="px-6 py-4">
                                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-inner space-y-4">
                                  <div className="flex items-center justify-between border-b pb-3">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => toggleRowAccordion(rowKey, 'details')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                                          activeTab === 'details'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                      >
                                        Detalle del Control
                                      </button>
                                      {f.remediation_cmd && (
                                        <button
                                          onClick={() => toggleRowAccordion(rowKey, 'remediation')}
                                          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                                            activeTab === 'remediation'
                                              ? 'bg-amber-600 text-white'
                                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                          }`}
                                        >
                                          Guía de Remediación
                                        </button>
                                      )}
                                    </div>

                                    <button
                                      onClick={() => setExpandedRows((prev) => ({ ...prev, [rowKey]: null }))}
                                      className="text-xs text-gray-400 hover:text-gray-700 cursor-pointer flex items-center gap-1 font-medium"
                                    >
                                      Contraer ✕
                                    </button>
                                  </div>

                                  {/* Contenido: DETALLE DEL CONTROL */}
                                  {activeTab === 'details' && (
                                    <div className="space-y-3 text-xs">
                                      <div className="flex items-center gap-3">
                                        <span className="font-mono bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                                          {f.rule_id}
                                        </span>
                                        <h5 className="font-bold text-gray-900 text-sm">{ruleName}</h5>
                                        <span className="ml-auto uppercase text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                                          Severidad: {ruleSeverity}
                                        </span>
                                      </div>

                                      <div>
                                        <p className="font-semibold text-gray-500 uppercase tracking-wider mb-1 text-[11px]">
                                          Descripción y Objetivo de Auditoría:
                                        </p>
                                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded border border-gray-200 text-xs">
                                          {ruleDesc}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Contenido: COMANDOS CLI DE REMEDIACIÓN */}
                                  {activeTab === 'remediation' && f.remediation_cmd && (
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-gray-700">
                                          Comandos CLI FortiOS para corrección:
                                        </p>
                                        <button
                                          onClick={() => handleCopyCmd(f.remediation_cmd!, rowKey)}
                                          className="px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer border border-blue-200"
                                        >
                                          {copiedId === rowKey ? (
                                            <span className="text-green-600 font-bold">✓ Copiado al portapapeles</span>
                                          ) : (
                                            <span>Copiar Comandos</span>
                                          )}
                                        </button>
                                      </div>

                                      <div className="p-3 bg-gray-900 text-amber-300 font-mono text-xs rounded-lg overflow-x-auto border border-gray-800 shadow-inner">
                                        <pre className="whitespace-pre-wrap leading-relaxed">{f.remediation_cmd}</pre>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

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
    </div>
  );
};