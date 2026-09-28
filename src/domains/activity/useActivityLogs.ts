import { useState, useEffect, useCallback } from 'react';
import type { ActivityLogResponse, ActivityLogQueryParams } from './activity.types';
import { fetchLogs, exportLogs } from './activityService';

const PAGE_CHUNK_SIZE = 20;
const MAX_MEMORY_LIMIT = 100;

export const useActivityLogs = (initialFilter?: ActivityLogQueryParams) => {
  const [logs, setLogs] = useState<ActivityLogResponse[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_CHUNK_SIZE);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActivityLogQueryParams | undefined>(initialFilter);
  const [selectedLog, setSelectedLog] = useState<ActivityLogResponse | null>(null);

  const loadLogs = useCallback(async (currentFilter?: ActivityLogQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      // Tope máximo de 100 registros en memoria
      const filterWithCap: ActivityLogQueryParams = {
        ...currentFilter,
        skip: currentFilter?.skip ?? 0,
        limit: MAX_MEMORY_LIMIT,
      };
      const data = await fetchLogs(filterWithCap);
      setLogs(data);
      setVisibleCount(PAGE_CHUNK_SIZE);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Error al cargar los logs de actividad';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs(filter);
  }, [loadLogs, filter]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_CHUNK_SIZE, logs.length));
  }, [logs.length]);

  const applyFilter = (newFilter: ActivityLogQueryParams) => {
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
      a.download = `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.message || 'Error al exportar logs de actividad';
      setError(msg);
    } finally {
      setExporting(false);
    }
  };

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

// Exportación secundaria con el nombre anterior para asegurar compatibilidad
export const useAuditLogs = useActivityLogs;