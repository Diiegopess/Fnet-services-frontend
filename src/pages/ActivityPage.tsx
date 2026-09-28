import React from 'react';
import { useActivityLogs } from '../domains/activity/useActivityLogs';
import ActivityFilterBar from '../domains/activity/components/ActivityFilterBar';
import ActivityLogsTable from '../domains/activity/components/ActivityLogsTable';
import ActivityDetailModal from '../domains/activity/components/ActivityDetailModal';
import Spinner from '../shared/components/Spinner';

export const ActivityPage: React.FC = () => {
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
  } = useActivityLogs();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Encabezado y Acciones */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs de Actividad</h1>
          <p className="text-sm text-gray-500">
            Registro cronológico y trazabilidad forense de eventos del sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={loading || exporting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            Refrescar
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <ActivityFilterBar onFilter={applyFilter} onReset={resetFilter} />

      {/* Manejo de Errores */}
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={refetch}
            className="text-xs font-semibold underline hover:no-underline cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Estado de Carga Inicial */}
      {loading && logs.length === 0 ? (
        <div className="flex justify-center items-center py-16 bg-white rounded-xl border border-gray-200 shadow-xs">
          <Spinner />
        </div>
      ) : (
        /* Tabla Progresiva con Scroll Infinito */
        <div className="bg-white shadow-xs rounded-xl border border-gray-200 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex justify-center items-center z-10">
              <Spinner />
            </div>
          )}
          <ActivityLogsTable
            logs={logs}
            hasMore={hasMore}
            totalInMemory={totalInMemory}
            onLoadMore={loadMore}
            onSelectLog={setSelectedLog}
          />
        </div>
      )}

      {/* Modal de Detalle */}
      <ActivityDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};

// Aliases para retrocompatibilidad
export const AuditPage = ActivityPage;
export default ActivityPage;