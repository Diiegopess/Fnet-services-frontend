import React from 'react';
import type { Client } from '../client.types';

interface ClientsTableProps {
  clients: Client[];
  actionLoadingId?: string | null;
  onToggleStatus?: (client: Client) => void;
  onEdit?: (client: Client) => void;
  onAssignTechnicians?: (client: Client) => void;
  onViewDevices?: (client: Client) => void; // <-- Acción modular para cargar dispositivos
  onDelete?: (client: Client) => void;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  actionLoadingId,
  onToggleStatus,
  onEdit,
  onAssignTechnicians,
  onViewDevices,
  onDelete,
}) => {
  if (!clients || clients.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No se encontraron clientes registrados.
      </div>
    );
  }

  return (
    <div className="overflow-visible">
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-50 uppercase text-xs text-gray-500 font-semibold border-b border-gray-200">
          <tr>
            <th className="px-5 py-3.5">Cliente / Empresa</th>
            <th className="px-5 py-3.5">ID Fiscal</th>
            <th className="px-5 py-3.5">Contacto</th>
            <th className="px-5 py-3.5 text-center">Técnicos</th>
            <th className="px-5 py-3.5 text-center">Dispositivos</th> {/* Nueva Columna */}
            <th className="px-5 py-3.5 text-center">Estado</th>
            <th className="px-5 py-3.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clients.map((c) => {
            const isProcessing = actionLoadingId === c.id;

            return (
              <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-5 py-4 font-medium text-gray-900">
                  <div>{c.name}</div>
                  {c.address && (
                    <div className="text-xs text-gray-400 font-normal truncate max-w-xs">
                      {c.address}
                    </div>
                  )}
                </td>

                <td className="px-5 py-4 text-gray-600 font-mono text-xs">
                  {c.tax_id || <span className="text-gray-400 italic">N/A</span>}
                </td>

                <td className="px-5 py-4 text-xs text-gray-600">
                  {c.contact_email && <div className="font-mono">{c.contact_email}</div>}
                  {c.contact_phone && <div className="text-gray-500">{c.contact_phone}</div>}
                  {!c.contact_email && !c.contact_phone && (
                    <span className="text-gray-400 italic">Sin contacto</span>
                  )}
                </td>

                <td className="px-5 py-4 text-center">
                  <button
                    type="button"
                    onClick={() => onAssignTechnicians && onAssignTechnicians(c)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all cursor-pointer shadow-xs"
                  >
                    <span>{c.assigned_technicians.length} asignados</span>
                  </button>
                </td>

                {/* Columna de Dispositivos */}
                <td className="px-5 py-4 text-center">
                  <button
                    type="button"
                    onClick={() => onViewDevices && onViewDevices(c)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Ver Equipos</span>
                  </button>
                </td>

                <td className="px-5 py-4 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      c.is_active
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {c.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-2">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(c)}
                        disabled={isProcessing}
                        className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                      >
                        Editar
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onToggleStatus && onToggleStatus(c)}
                      disabled={isProcessing}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer ${
                        c.is_active
                          ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {c.is_active ? 'Desactivar' : 'Activar'}
                    </button>

                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(c)}
                        disabled={isProcessing}
                        className="px-2.5 py-1 text-xs font-medium rounded-md border border-gray-200 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ClientsTable;