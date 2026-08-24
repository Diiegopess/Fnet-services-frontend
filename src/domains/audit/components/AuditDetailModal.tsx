import React from 'react';
import type { AuditLog } from '../audit.types';
import { formatDate } from '../../../shared/utils/formatDate';

interface AuditDetailModalProps {
  log: AuditLog | null;
  onClose: () => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Detalle de Evento</h3>
            <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
              {log.event_type}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-2 hover:bg-gray-100 transition-colors text-xl leading-none cursor-pointer"
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                ID del Registro
              </span>
              <span className="font-mono text-xs text-gray-800 break-all select-all">
                {log.id}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                Fecha / Hora
              </span>
              <span className="text-xs text-gray-800">
                {formatDate ? formatDate(log.occurred_at) : log.occurred_at}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                ID de Usuario
              </span>
              <span className="font-mono text-xs text-gray-800 break-all select-all">
                {log.user_id || '—'}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                Dirección IP
              </span>
              <span className="font-mono text-xs text-gray-800">
                {log.ip_address || '—'}
              </span>
            </div>

            {log.correlation_id && (
              <div className="sm:col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                  Correlation ID
                </span>
                <span className="font-mono text-xs text-gray-800 break-all select-all">
                  {log.correlation_id}
                </span>
              </div>
            )}

            {log.user_agent && (
              <div className="sm:col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                  User Agent
                </span>
                <p className="text-xs text-gray-700 font-mono break-words whitespace-normal leading-relaxed">
                  {log.user_agent}
                </p>
              </div>
            )}
          </div>

          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">
              Payload (JSON)
            </span>
            <pre className="bg-[#0f172a] text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-56 shadow-inner border border-slate-800 leading-relaxed">
              {log.payload ? JSON.stringify(log.payload, null, 2) : '// Sin datos de payload'}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuditDetailModal;