import React, { useEffect, useRef } from 'react';
import type { AuditLog } from '../audit.types';
import { formatDate } from '../../../shared/utils/formatDate';

interface AuditLogsTableProps {
  logs: AuditLog[];
  hasMore: boolean;
  totalInMemory: number;
  onLoadMore: () => void;
  onSelectLog: (log: AuditLog) => void;
}

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({
  logs,
  hasMore,
  totalInMemory,
  onLoadMore,
  onSelectLog,
}) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // IntersectionObserver para detectar cuando el usuario llega al final
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '100px' }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [hasMore, onLoadMore]);

  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No se encontraron registros de auditoría.
      </div>
    );
  }

  return (
    <div>
      {/* 1. Vista Móvil: Lista de Tarjetas (Pantallas pequeñas) */}
      <div className="block md:hidden divide-y divide-gray-100">
        {logs.map((log) => (
          <div
            key={log.id}
            onClick={() => onSelectLog(log)}
            className="p-4 hover:bg-blue-50/40 transition-colors cursor-pointer space-y-2.5"
          >
            <div className="flex justify-between items-start">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono font-semibold border border-blue-200/60">
                {log.event_type}
              </span>
              <span className="text-[11px] text-gray-500 font-mono">
                {formatDate ? formatDate(log.occurred_at) : log.occurred_at}
              </span>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <p className="truncate">
                <span className="font-semibold text-gray-700">Usuario:</span>{' '}
                <span className="font-mono text-gray-500">{log.user_id || '—'}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-700">IP:</span>{' '}
                <span className="font-mono text-gray-500">{log.ip_address || '—'}</span>
              </p>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-gray-400 font-mono truncate max-w-[200px]">
                {log.payload ? JSON.stringify(log.payload) : ''}
              </span>
              <button
                type="button"
                className="text-xs text-blue-600 font-semibold"
              >
                Ver detalle &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Vista Desktop: Tabla Convencional (Pantallas medianas y grandes) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 uppercase text-xs text-gray-500 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-4 py-3.5">Fecha y Hora</th>
              <th className="px-4 py-3.5">Tipo de Evento</th>
              <th className="px-4 py-3.5">Usuario (ID)</th>
              <th className="px-4 py-3.5">IP</th>
              <th className="px-4 py-3.5">Detalles / Payload</th>
              <th className="px-4 py-3.5 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr
                key={log.id}
                onClick={() => onSelectLog(log)}
                className="hover:bg-blue-50/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3.5 whitespace-nowrap text-xs text-gray-500 font-mono">
                  {formatDate ? formatDate(log.occurred_at) : log.occurred_at}
                </td>
                <td className="px-4 py-3.5 font-medium text-gray-900">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-mono border border-gray-200">
                    {log.event_type}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs font-mono text-gray-600">
                  {log.user_id || '—'}
                </td>
                <td className="px-4 py-3.5 text-xs font-mono text-gray-500">
                  {log.ip_address || '—'}
                </td>
                <td className="px-4 py-3.5 text-xs text-gray-500 max-w-xs truncate font-mono">
                  {log.payload ? JSON.stringify(log.payload) : '—'}
                </td>
                <td className="px-4 py-3.5 text-xs text-center whitespace-nowrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLog(log);
                    }}
                    className="px-2.5 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium rounded-md transition-colors cursor-pointer"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Centinela de Scroll Infinito y Contador */}
      <div ref={sentinelRef} className="p-4 text-center border-t border-gray-100">
        {hasMore ? (
          <span className="text-xs text-blue-600 font-medium animate-pulse">
            Cargando siguientes 20 logs...
          </span>
        ) : (
          <span className="text-xs text-gray-400">
            Mostrando {logs.length} de {totalInMemory} eventos cargados (máx. 100)
          </span>
        )}
      </div>
    </div>
  );
};

export default AuditLogsTable;