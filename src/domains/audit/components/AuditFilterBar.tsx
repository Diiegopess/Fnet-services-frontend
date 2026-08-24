import React, { useState } from 'react';
import type { LogFilter } from '../audit.types';

interface AuditFilterBarProps {
  onFilter: (filter: LogFilter) => void;
  onReset: () => void;
}

export const AuditFilterBar: React.FC<AuditFilterBarProps> = ({ onFilter, onReset }) => {
  const [eventType, setEventType] = useState('');
  const [userId, setUserId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({
      event_type: eventType.trim() || undefined,
      user_id: userId.trim() || undefined,
      from_date: fromDate ? new Date(fromDate).toISOString() : undefined,
      to_date: toDate ? new Date(toDate).toISOString() : undefined,
      skip: 0,
      limit: 100,
    });
  };

  const handleClear = () => {
    setEventType('');
    setUserId('');
    setFromDate('');
    setToDate('');
    onReset();
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-xs space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
            Tipo de Evento
          </label>
          <input
            type="text"
            placeholder="Ej: auth.login_success"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
            ID de Usuario
          </label>
          <input
            type="text"
            placeholder="UUID o identificador"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
            Desde (Fecha / Hora)
          </label>
          <input
            type="datetime-local"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
            Hasta (Fecha / Hora)
          </label>
          <input
            type="datetime-local"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          Limpiar
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          Filtrar
        </button>
      </div>
    </form>
  );
};

export default AuditFilterBar;