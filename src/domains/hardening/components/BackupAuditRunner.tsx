// src/domains/hardening/components/BackupAuditRunner.tsx

import React, { useState, useMemo } from 'react';
import {
  type HardeningProfile,
  type BackupAuditResponse,
  type Finding,
  type RuleCatalogItem,
  RuleSeverity,
} from '../hardening.types';
import { hardeningService } from '../hardeningService';
import { compareRuleIds } from '../ruleOrdering';
import { parseApiError } from '../../../shared/utils/errorHandler';

interface BackupAuditRunnerProps {
  profiles: HardeningProfile[];
  catalogRules?: RuleCatalogItem[];
}

type SortField = 'rule_id' | 'status';
type SortDirection = 'asc' | 'desc';
type ExpandedTab = 'details' | 'remediation';

export const BackupAuditRunner: React.FC<BackupAuditRunnerProps> = ({
  profiles = [],
  catalogRules = [],
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<BackupAuditResponse | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [sortField, setSortField] = useState<SortField>('rule_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [expandedRows, setExpandedRows] = useState<Record<string, ExpandedTab | null>>({});
  const [expandedCell, setExpandedCell] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
    }
  };

  const toggleRowAccordion = (rowKey: string, tab: ExpandedTab) => {
    setExpandedRows((prev) => {
      const currentTab = prev[rowKey];
      if (currentTab === tab) {
        return { ...prev, [rowKey]: null };
      }
      return { ...prev, [rowKey]: tab };
    });
  };

  const handleCopyCmd = (cmd: string, rowKey: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(rowKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunBackupAudit = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    const profileObj = profiles.find((p) => p.id === selectedProfile);

    try {
      const data = await hardeningService.auditBackupFile(
        selectedFile,
        selectedProfile || undefined,
        profileObj?.standard_version || undefined
      );

      // Enriquecer hallazgos con el catálogo de reglas
      const enrichedFindings = (data.findings || []).map((finding) => {
        const matchedRule = catalogRules.find((r) => r.id === finding.rule_id);
        return {
          ...finding,
          rule_name: finding.rule_name || matchedRule?.name || finding.rule_id,
          expected_value: finding.expected_value || 'Conformidad con política de Hardening',
          remediation_cmd: finding.remediation_cmd || matchedRule?.description,
          severity: finding.severity || matchedRule?.default_severity || RuleSeverity.MEDIUM,
        };
      });

      setResult({
        ...data,
        findings: enrichedFindings,
      });
      setExpandedRows({});
      setExpandedCell(null);
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      setError(parsed.message || 'Error al procesar el archivo de backup');
    } finally {
      setLoading(false);
    }
  };

  const allFindings = useMemo(() => result?.findings || [], [result]);

  const processedFindings = useMemo(() => {
    const filtered = allFindings.filter((f) => {
      if (filterStatus === 'ALL') return true;
      return f.status === filterStatus;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'rule_id') {
        comparison = compareRuleIds(a.rule_id, b.rule_id);
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [allFindings, filterStatus, sortField, sortDirection]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PASSED':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 border border-green-300">
            PASSED
          </span>
        );
      case 'PARCIAL':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            PARCIAL
          </span>
        );
      case 'NOT_APPLICABLE':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
            N/A
          </span>
        );
      default:
        return (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            FAILED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Panel de Carga del Archivo */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 items-end justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-3/4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Archivo de Configuración (.conf / .txt)
            </label>
            <input
              type="file"
              accept=".conf,.txt"
              onChange={handleFileChange}
              className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Perfil de Hardening (Opcional)
            </label>
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Catálogo Estándar Completo --</option>
              {profiles.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name} {prof.standard_version ? `(${prof.standard_version})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleRunBackupAudit}
          disabled={!selectedFile || loading}
          className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {loading ? <span>Analizando Archivo...</span> : <span>Auditar Archivo</span>}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {/* Resultados de la Auditoría */}
      {result && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Resultados de la Auditoría de Backup
              </h3>
              {/* Tarjeta de Metadatos Detectados */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-mono border border-slate-200">
                  Modelo: <b>{result.device_info.model}</b>
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-mono border border-slate-200">
                  FortiOS: <b>{result.device_info.firmware_version}</b>
                </span>
                {result.device_info.build && (
                  <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-mono border border-slate-200">
                    Build: {result.device_info.build}
                  </span>
                )}
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-mono border border-slate-200">
                  VDOMs: {result.device_info.vdom_enabled ? 'Habilitado' : 'Deshabilitado'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl">
              <div>
                <p className="text-xs font-bold text-blue-900 uppercase">Cumplimiento Total</p>
                <p className="text-2xl font-black text-blue-700">{Math.round(result.score)}%</p>
              </div>
            </div>
          </div>

          {/* Estadísticas de reglas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-green-50 text-green-700 rounded-lg font-semibold border border-green-200">
              Aprobadas: {result.total_passed}
            </div>
            <div className="p-3 bg-amber-50 text-amber-700 rounded-lg font-semibold border border-amber-200">
              Parciales: {result.total_partial}
            </div>
            <div className="p-3 bg-red-50 text-red-700 rounded-lg font-semibold border border-red-200">
              Fallidas: {result.total_failed}
            </div>
            <div className="p-3 bg-gray-50 text-gray-700 rounded-lg font-semibold border border-gray-200">
              Evaluadas: {allFindings.length}
            </div>
          </div>

          {/* Filtros de la tabla */}
          <div className="flex justify-between items-center pt-2">
            <h4 className="text-sm font-bold text-gray-800">
              Detalle por Regla ({processedFindings.length})
            </h4>
            <div className="flex gap-2 text-xs">
              {[
                { id: 'ALL', label: 'Todas' },
                { id: 'PASSED', label: 'Aprobadas' },
                { id: 'PARCIAL', label: 'Parciales' },
                { id: 'FAILED', label: 'Fallidas' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setFilterStatus(st.id)}
                  className={`px-3 py-1 rounded-md font-medium border cursor-pointer transition-colors ${
                    filterStatus === st.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 text-gray-600 border-gray-300'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de hallazgos */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-sm text-gray-600 border-collapse">
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
                  <th className="px-4 py-3">Detalle / Evidencia</th>
                  <th className="px-4 py-3">Valor Esperado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {processedFindings.map((finding: Finding, idx: number) => {
                  const ruleCompliance =
                    finding.compliance_score ??
                    (finding.status === 'PASSED' ? 100 : finding.status === 'PARCIAL' ? 50 : 0);

                  const matchedRule = catalogRules.find((r) => r.id === finding.rule_id);
                  const ruleName = finding.rule_name || matchedRule?.name || finding.rule_id;
                  const ruleDesc =
                    matchedRule?.description || finding.reason || 'Sin descripción disponible';
                  const ruleSeverity = finding.severity || matchedRule?.default_severity || 'MEDIUM';

                  const rowKey = `${finding.rule_id}-${idx}`;
                  const activeTab = expandedRows[rowKey] || null;
                  const currentCellId = `${rowKey}-current`;
                  const expectedCellId = `${rowKey}-expected`;

                  return (
                    <React.Fragment key={rowKey}>
                      <tr className={`transition-colors ${activeTab ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
                        <td className="px-4 py-3 align-top">
                          <button
                            onClick={() => toggleRowAccordion(rowKey, 'details')}
                            className="font-mono font-bold text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1.5 cursor-pointer transition-colors group"
                            title="Haz clic para ver el objetivo de la regla"
                          >
                            <span className="text-gray-400 group-hover:text-blue-600 transition-transform">
                              {activeTab === 'details' ? '▼' : '▶'}
                            </span>
                            <span className="underline decoration-dotted underline-offset-2">
                              {finding.rule_id}
                            </span>
                          </button>
                        </td>

                        <td className="px-4 py-3 align-top">
                          {renderStatusBadge(finding.status)}
                        </td>

                        <td className="px-4 py-3 align-top">
                          <span
                            className={`font-mono text-xs font-bold ${
                              ruleCompliance === 100
                                ? 'text-green-700'
                                : ruleCompliance >= 50
                                ? 'text-amber-600'
                                : 'text-red-600'
                            }`}
                          >
                            {ruleCompliance}%
                          </span>
                        </td>

                        <td
                          onClick={() =>
                            setExpandedCell((prev) => (prev === currentCellId ? null : currentCellId))
                          }
                          className="px-4 py-3 align-top font-mono text-xs text-gray-800 max-w-xs break-words whitespace-pre-wrap cursor-pointer hover:bg-gray-100/60 transition-colors"
                        >
                          <div className={expandedCell === currentCellId ? '' : 'line-clamp-3'}>
                            {finding.current_value || 'N/A'}
                          </div>
                        </td>

                        <td
                          onClick={() =>
                            setExpandedCell((prev) => (prev === expectedCellId ? null : expectedCellId))
                          }
                          className="px-4 py-3 align-top font-mono text-xs text-gray-500 max-w-xs break-words whitespace-pre-wrap cursor-pointer hover:bg-gray-100/60 transition-colors"
                        >
                          <div className={expandedCell === expectedCellId ? '' : 'line-clamp-3'}>
                            {finding.expected_value || 'N/A'}
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top text-right">
                          {finding.status !== 'PASSED' && finding.remediation_cmd && (
                            <button
                              onClick={() => toggleRowAccordion(rowKey, 'remediation')}
                              className={`px-3 py-1 text-xs font-semibold rounded border cursor-pointer transition-all flex items-center gap-1 ml-auto ${
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
                                  {finding.remediation_cmd && (
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
                                  onClick={() =>
                                    setExpandedRows((prev) => ({ ...prev, [rowKey]: null }))
                                  }
                                  className="text-xs text-gray-400 hover:text-gray-700 cursor-pointer flex items-center gap-1 font-medium"
                                >
                                  Contraer ✕
                                </button>
                              </div>

                              {activeTab === 'details' && (
                                <div className="space-y-3 text-xs">
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                                      {finding.rule_id}
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

                              {activeTab === 'remediation' && finding.remediation_cmd && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-gray-700">
                                      Comandos CLI FortiOS para corrección:
                                    </p>
                                    <button
                                      onClick={() => handleCopyCmd(finding.remediation_cmd!, rowKey)}
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
                                    <pre className="whitespace-pre-wrap leading-relaxed">
                                      {finding.remediation_cmd}
                                    </pre>
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
      )}
    </div>
  );
};