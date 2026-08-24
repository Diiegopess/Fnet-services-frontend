import { useState, useEffect, useCallback } from 'react';
import type { AuditLog, LogFilter } from './audit.types';
import { fetchLogs, exportLogs } from './auditService';

const PAGE_CHUNK_SIZE = 20;
const MAX_MEMORY_LIMIT = 100;

export const useAuditLogs = (initialFilter?: LogFilter) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_CHUNK_SIZE);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LogFilter | undefined>(initialFilter);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadLogs = useCallback(async (currentFilter?: LogFilter) => {
    try {
      setLoading(true);
      setError(null);
      // Forzamos tope máximo de 100 registros en memoria
      const filterWithCap: LogFilter = {
        ...currentFilter,
        skip: currentFilter?.skip ?? 0,
        limit: MAX_MEMORY_LIMIT,
      };
      const data = await fetchLogs(filterWithCap);
      setLogs(data);
      setVisibleCount(PAGE_CHUNK_SIZE); // Reiniciar vista a los primeros 20
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Error al cargar los logs de auditoría';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs(filter);
  }, [loadLogs, filter]);

  // Función para cargar los siguientes 20 logs
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_CHUNK_SIZE, logs.length));
  }, [logs.length]);

  const applyFilter = (newFilter: LogFilter) => {
    setFilter(newFilter);
  };

  const resetFilter = () => {
    setFilter(undefined);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportLogs({ ...filter, limit: MAX_MEMORY_LIMIT });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.message || 'Error al exportar logs';
      setError(msg);
    } finally {
      setExporting(false);
    }
  };

  // Porción visible en la interfaz
  const visibleLogs = logs.slice(0, visibleCount);
  const hasMore = visibleCount < logs.length;

  return {
    logs: visibleLogs,
    totalInMemory: logs.length,
    hasMore,
    loading,
    exporting,
    error,
    filter,
    selectedLog,
    setSelectedLog,
    applyFilter,
    resetFilter,
    loadMore,
    refetch: () => loadLogs(filter),
    handleExport,
  };
};