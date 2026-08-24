import React from 'react';
import { useAuditLogs } from '../domains/audit/useAuditLogs';
import AuditFilterBar from '../domains/audit/components/AuditFilterBar';
import AuditLogsTable from '../domains/audit/components/AuditLogsTable';
import AuditDetailModal from '../domains/audit/components/AuditDetailModal';
import Spinner from '../shared/components/Spinner';

export const AuditPage: React.FC = () => {
  const {
    logs,
    totalInMemory,
    hasMore,
    loading,
    exporting,
    error,
    selectedLog,
    setSelectedLog,
    applyFilter,
    resetFilter,
    loadMore,
    refetch,
    handleExport,
  } = useAuditLogs();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs de Auditoría</h1>
          <p className="text-sm text-gray-500">
            Registro cronológico y trazabilidad forense de eventos del sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={loading || exporting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
          <button
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            Refrescar
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <AuditFilterBar onFilter={applyFilter} onReset={resetFilter} />

      {/* Manejo de Carga y Errores */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabla Progresiva con Scroll Infinito */}
      {!loading && (
        <div className="bg-white shadow-xs rounded-xl border border-gray-200 overflow-hidden">
          <AuditLogsTable
            logs={logs}
            hasMore={hasMore}
            totalInMemory={totalInMemory}
            onLoadMore={loadMore}
            onSelectLog={setSelectedLog}
          />
        </div>
      )}

      {/* Modal de Detalle */}
      <AuditDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};

export default AuditPage;