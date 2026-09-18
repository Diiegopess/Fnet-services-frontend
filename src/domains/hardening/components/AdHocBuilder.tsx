import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { RuleCatalogItem, AuditReport, Finding, ExportFormat } from '../hardening.types';
import { ExecutionType } from '../hardening.types';
import { useHardening } from '../useHardening';

interface Device {
  id: string;
  name: string;
  host: string;
}

interface AdHocBuilderProps {
  catalogRules?: RuleCatalogItem[];
  devices?: Device[];
}

type SortField = 'rule_id' | 'status';
type SortDirection = 'asc' | 'desc';

export const AdHocBuilder: React.FC<AdHocBuilderProps> = ({
  catalogRules = [],
  devices = [],
}) => {
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedRules, setSelectedRules] = useState<RuleCatalogItem[]>([]);

  // Estados para resultados y errores
  const [report, setReport] = useState<AuditReport | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Estados para el manejo de ordenamiento en la tabla
  const [sortField, setSortField] = useState<SortField>('rule_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  // Modales de Detalle de Regla y Remediación
  const [activeRemediation, setActiveRemediation] = useState<Finding | null>(null);
  const [copiedRemediation, setCopiedRemediation] = useState<boolean>(false);
  const [selectedRuleDetail, setSelectedRuleDetail] = useState<{
    rule_id: string;
    rule_name?: string;
    severity?: string;
    description?: string;
  } | null>(null);

  const {
    executeAudit,
    exportAuditReport: exportReport,
    exporting,
    loading,
    error: hookError,
  } = useHardening();

  // Cálculo memoizado de reglas disponibles
  const availableRules = useMemo(() => {
    if (selectedRules.length === 0) return catalogRules;
    const selectedIds = new Set(selectedRules.map((r) => r.id));
    return catalogRules.filter((r) => !selectedIds.has(r.id));
  }, [catalogRules, selectedRules]);

  // Agrupación memoizada de las reglas disponibles
  const groupedAvailableRules = useMemo(() => {
    const groups: Record<string, RuleCatalogItem[]> = {};
    availableRules.forEach((rule) => {
      const stdKey = `${rule.standard || 'OTROS'} ${
        rule.standard_version ? `(${rule.standard_version})` : ''
      }`.trim();
      if (!groups[stdKey]) groups[stdKey] = [];
      groups[stdKey].push(rule);
    });
    return groups;
  }, [availableRules]);

  // Cierre de modales con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRuleDetail(null);
        setActiveRemediation(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addRule = useCallback((rule: RuleCatalogItem) => {
    setSelectedRules((prev) => [...prev, rule]);
  }, []);

  const removeRule = useCallback((rule: RuleCatalogItem) => {
    setSelectedRules((prev) => prev.filter((r) => r.id !== rule.id));
  }, []);

  // Manejador del cambio de ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleDetail = (key: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Ejecución Ad-hoc directa
  const handleRunAdHocAudit = async () => {
    if (!selectedDevice || selectedRules.length === 0) return;
    setLocalError(null);

    try {
      const result = await executeAudit({
        device_id: selectedDevice,
        raw_config: '',
        execution_type: ExecutionType.CUSTOM_ADHOC,
        adhoc_rule_ids: selectedRules.map((r) => r.id),
      });
      setReport(result);
      setExpandedDetails({});
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al ejecutar auditoría Ad-hoc';
      setLocalError(msg);
    }
  };

  // Manejador de Exportación (DOCX, PDF)
  const handleExport = async (format: ExportFormat) => {
    if (!report?.id) return;
    try {
      await exportReport(report.id, format);
    } catch (err) {
      console.error('Error al exportar reporte:', err);
    }
  };

  const handleCopyRemediation = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedRemediation(true);
      setTimeout(() => setCopiedRemediation(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles', err);
    }
  };

  const activeError = localError || hookError;
  const allFindings = useMemo(
    () => (report?.findings?.length ? report.findings : report?.findings_data || []),
    [report]
  );

  // Cálculo del porcentaje de cumplimiento TOTAL
  const totalComplianceScore = useMemo(() => {
    if (!report) return 0;
    if (report.score !== undefined && report.score !== null) {
      return Math.round(report.score);
    }
    const total = report.total_rules_evaluated || allFindings.length;
    if (total === 0) return 0;
    const passed = report.total_passed ?? allFindings.filter((f) => f.status === 'PASSED').length;
    return Math.round((passed / total) * 100);
  }, [report, allFindings]);

  // Filtrado y Ordenamiento Combinado
  const processedFindings = useMemo(() => {
    const filtered = allFindings.filter((f) => {
      if (filterStatus === 'ALL') return true;
      return f.status === filterStatus;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'rule_id') {
        comparison = (a.rule_id || '').localeCompare(b.rule_id || '', undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [allFindings, filterStatus, sortField, sortDirection]);

  return (
    <div className="space-y-6">
      {/* Barra de Control */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-1/2">
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
            Seleccionar Dispositivo (FortiGate)
          </label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">-- Seleccionar Equipo --</option>
            {devices.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.name} ({dev.host})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRunAdHocAudit}
          disabled={!selectedDevice || selectedRules.length === 0 || loading}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 cursor-pointer self-end flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Evaluando en Vivo...</span>
          ) : (
            <>
              <span>Ejecutar Evaluación Ad-hoc</span>
              <span className="bg-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">
                {selectedRules.length}
              </span>
            </>
          )}
        </button>
      </div>

      {activeError && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
          {activeError}
        </div>
      )}

      {/* Grid del Selector de Reglas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMNA IZQUIERDA: Reglas Seleccionadas */}
        <div className="bg-white rounded-xl border-2 border-blue-200 p-5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Reglas para Evaluación Ad-hoc
              </h3>
              <p className="text-xs text-gray-500">
                Haz clic en una regla para eliminarla del escaneo.
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-xs">
              {selectedRules.length} Reglas
            </span>
          </div>

          <div className="min-h-[300px] max-h-[420px] overflow-y-auto space-y-2 border-2 border-dashed border-gray-200 rounded-lg p-3 bg-gray-50/50">
            {selectedRules.length === 0 ? (
              <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center text-gray-400 p-6">
                <span className="text-3xl mb-2">📥</span>
                <p className="text-sm font-medium">Sin reglas seleccionadas</p>
                <p className="text-xs">
                  Haz clic en las reglas del panel derecho para armar tu escaneo.
                </p>
              </div>
            ) : (
              selectedRules.map((rule) => (
                <div
                  key={rule.id}
                  onClick={() => removeRule(rule)}
                  className="p-3 bg-white border border-blue-200 hover:border-red-300 rounded-lg shadow-2xs flex justify-between items-center cursor-pointer transition-all hover:bg-red-50/40 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                      {rule.rule_id || rule.code || rule.id.substring(0, 8)}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        {rule.name}
                      </p>
                      <span className="text-[10px] text-gray-400 uppercase font-medium">
                        {rule.standard} {rule.standard_version}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-red-600 font-bold px-2">
                    ✕
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Catálogo */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {Object.keys(groupedAvailableRules).length === 0 ? (
            <div className="p-8 bg-white rounded-xl border border-gray-200 text-center text-gray-400 text-sm">
              No hay reglas disponibles en el catálogo.
            </div>
          ) : (
            Object.entries(groupedAvailableRules).map(([groupTitle, rulesGroup]) => (
              <div
                key={groupTitle}
                className="bg-white rounded-xl border border-gray-200 p-4 space-y-2"
              >
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex justify-between">
                  <span>{groupTitle}</span>
                  <span className="text-gray-400 font-normal">
                    ({rulesGroup.length})
                  </span>
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {rulesGroup.map((rule) => (
                    <div
                      key={rule.id}
                      onClick={() => addRule(rule)}
                      className="p-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-md flex justify-between items-center cursor-pointer transition-colors"
                    >
                      <span className="font-mono text-xs font-bold text-gray-700">
                        {rule.rule_id || rule.code || rule.id.substring(0, 8)}
                      </span>
                      <span className="text-xs text-gray-600 truncate max-w-[220px]">
                        {rule.name}
                      </span>
                      <span className="text-xs font-bold text-blue-600">+</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RESULTADOS DE EVALUACIÓN AD-HOC */}
      {report && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Resultados de la Auditoría Ad-hoc
              </h3>
              <p className="text-xs text-gray-500">ID Auditoría: {report.id}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* BOTONES DE EXPORTACIÓN */}
              <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                <span className="text-xs font-semibold text-gray-500 px-2">Exportar:</span>
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
              </div>

              {/* TARJETA CUMPLIMIENTO TOTAL */}
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-blue-900 uppercase">Cumplimiento Total</p>
                  <p className="text-2xl font-black text-blue-700">{totalComplianceScore}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 text-green-700 rounded-lg font-semibold border border-green-200">
              Aprobadas: {report.total_passed ?? allFindings.filter((f) => f.status === 'PASSED').length}
            </div>
            <div className="p-3 bg-red-50 text-red-700 rounded-lg font-semibold border border-red-200">
              Fallidas: {report.total_failed ?? allFindings.filter((f) => f.status === 'FAILED').length}
            </div>
            <div className="p-3 bg-gray-50 text-gray-700 rounded-lg font-semibold border border-gray-200">
              Evaluadas: {report.total_rules_evaluated || allFindings.length}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <h4 className="text-sm font-bold text-gray-800">
              Detalle por Regla ({processedFindings.length})
            </h4>
            <div className="flex gap-2 text-xs">
              {['ALL', 'PASSED', 'FAILED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-md font-medium border cursor-pointer transition-colors ${
                    filterStatus === st
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 text-gray-600 border-gray-300'
                  }`}
                >
                  {st === 'ALL' ? 'Todas' : st === 'PASSED' ? 'Pasaron' : 'Fallaron'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b select-none">
                <tr>
                  <th
                    onClick={() => handleSort('rule_id')}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Regla / ID</span>
                      {sortField === 'rule_id' && (
                        <span className="text-blue-600 font-bold">
                          {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Estado</span>
                      {sortField === 'status' && (
                        <span className="text-blue-600 font-bold">
                          {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3">Cumplimiento</th>
                  <th className="px-4 py-3">Detalle</th>
                  <th className="px-4 py-3">Valor Esperado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {processedFindings.map((finding: Finding, idx: number) => {
                  const isPassed = finding.status === 'PASSED';
                  const ruleCompliance = finding.compliance_score ?? (isPassed ? 100 : 0);

                  const matchedRule = catalogRules.find(
                    (r) => r.id === finding.rule_id || r.rule_id === finding.rule_id
                  );
                  const ruleName = finding.rule_name || matchedRule?.name;
                  const ruleDesc = matchedRule?.description || finding.reason;

                  const rowKey = `${finding.rule_id}-${idx}`;
                  const isExpanded = !!expandedDetails[rowKey];
                  const detailText = finding.current_value || 'N/A';

                  return (
                    <tr key={rowKey} className="hover:bg-gray-50">
                      <td className="px-4 py-3 align-top">
                        <button
                          onClick={() =>
                            setSelectedRuleDetail({
                              rule_id: finding.rule_id,
                              rule_name: ruleName,
                              severity: finding.severity,
                              description: ruleDesc,
                            })
                          }
                          className="font-mono font-bold text-blue-600 hover:text-blue-800 text-xs underline decoration-dotted underline-offset-2 cursor-pointer transition-colors"
                          title="Haz clic para ver el detalle de la regla"
                        >
                          {finding.rule_id}
                        </button>
                      </td>

                      <td className="px-4 py-3 align-top">
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

                      {/* Cumplimiento */}
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`font-mono text-xs font-bold ${
                            ruleCompliance === 100 ? 'text-green-700' : 'text-red-600'
                          }`}
                        >
                          {ruleCompliance}
                        </span>
                      </td>

                      {/* DETALLE: muestra tres renglones y permite expandir el contenido completo */}
                      <td className="px-4 py-3 align-top font-mono text-xs text-gray-800 max-w-xs">
                        <div
                          onClick={() => toggleDetail(rowKey)}
                          className={`break-words whitespace-pre-wrap cursor-pointer hover:text-blue-600 transition-colors ${
                            isExpanded ? '' : 'line-clamp-3'
                          }`}
                          title="Haz clic para expandir o contraer"
                        >
                          {detailText}
                        </div>
                      </td>

                      {/* VALOR ESPERADO */}
                      <td className="px-4 py-3 align-top font-mono text-xs text-gray-500 max-w-xs break-words">
                        {finding.expected_value || 'N/A'}
                      </td>

                      <td className="px-4 py-3 align-top text-right">
                        {!isPassed && finding.remediation_cmd && (
                          <button
                            onClick={() => setActiveRemediation(finding)}
                            className="px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 rounded hover:bg-amber-100 transition-colors cursor-pointer"
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
      )}

      {/* Modal Detalle de Regla */}
      {selectedRuleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200">
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

            <div className="flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setSelectedRuleDetail(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Remediación */}
      {activeRemediation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200">
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
                  <span className="font-semibold text-gray-500 block">Detalle:</span>
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

            <div className="flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setActiveRemediation(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
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