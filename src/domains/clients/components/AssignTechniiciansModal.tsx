import React, { useState, useEffect, useMemo } from 'react';
import type { Client } from '../client.types';
import type { User } from '../../users/user.types';
import { useUsers } from '../../users/useUsers';
import { UserCheck, Search, Users } from 'lucide-react';

export interface AssignTechniciansModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onAssign: (clientId: string, technicianIds: string[]) => Promise<void>;
  loading?: boolean;
}

export const AssignTechniciansModal: React.FC<AssignTechniciansModalProps> = ({
  isOpen,
  onClose,
  client,
  onAssign,
  loading = false,
}) => {
  const { users, loading: loadingUsers } = useUsers();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (client) {
      setSelectedIds(client.assigned_technicians.map((t) => t.id));
      setSearchTerm('');
      setError(null);
    }
  }, [client]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  if (!isOpen || !client) return null;

  const handleToggleUser = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(users.map((u) => u.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await onAssign(client.id, selectedIds);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar las asignaciones.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Asignar Técnicos</h3>
              <p className="text-xs text-gray-500 font-medium">Cliente: {client.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col flex-1 overflow-hidden space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Search bar & quick actions */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuario por nombre o correo..."
                className="w-full text-xs pl-9 pr-3.5 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">
                {selectedIds.length} de {users.length} técnicos seleccionados
              </span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  Marcar todos
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-gray-500 hover:text-gray-700 font-semibold cursor-pointer"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-64">
            {loadingUsers ? (
              <div className="p-6 text-center text-xs text-gray-500">Cargando usuarios...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">No se encontraron usuarios</div>
            ) : (
              filteredUsers.map((user: User) => {
                const isSelected = selectedIds.includes(user.id);
                return (
                  <label
                    key={user.id}
                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleUser(user.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-semibold text-gray-900">
                          {user.full_name || 'Usuario'}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono">{user.email}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        user.is_superuser
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {user.is_superuser ? 'Administrador' : 'Técnico'}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Guardar Asignaciones'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTechniciansModal;