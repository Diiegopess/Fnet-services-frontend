import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../user.types';

const AVAILABLE_ROLES = [
  { key: 'ADMIN', label: 'Admin', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: 'TECHNICIAN', label: 'Técnico', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { key: 'AUDITOR', label: 'Auditor', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { key: 'USER', label: 'Usuario', color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

interface UsersTableProps {
  users: User[];
  currentUserId?: string;
  actionLoadingId?: string | null;
  onToggleStatus?: (user: User) => void;
  onChangeRole?: (user: User, newRole: string) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  currentUserId,
  actionLoadingId,
  onToggleStatus,
  onChangeRole,
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPrimaryRole = (user: User) => {
    if (user.roles && user.roles.length > 0) {
      return user.roles[0].name.toUpperCase();
    }
    return user.is_superuser ? 'ADMIN' : 'USER';
  };

  const getRoleBadgeStyle = (roleKey: string) => {
    const found = AVAILABLE_ROLES.find((r) => r.key === roleKey);
    return found ? found.color : 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getRoleLabel = (roleKey: string) => {
    const found = AVAILABLE_ROLES.find((r) => r.key === roleKey);
    return found ? found.label : roleKey;
  };

  if (!users || users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No se encontraron usuarios registrados.
      </div>
    );
  }

  return (
    <div className="overflow-visible">
      <table className="min-w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-50 uppercase text-xs text-gray-500 font-semibold border-b border-gray-200">
          <tr>
            <th className="px-5 py-3.5">Nombre</th>
            <th className="px-5 py-3.5">Correo</th>
            <th className="px-5 py-3.5 text-center">Rol</th>
            <th className="px-5 py-3.5 text-center">Estado</th>
            <th className="px-5 py-3.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((u) => {
            const isSelf = Boolean(currentUserId && currentUserId === u.id);
            const isProcessing = actionLoadingId === u.id;
            const isOpen = openDropdownId === u.id;
            const primaryRole = getPrimaryRole(u);

            return (
              <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-5 py-4 font-medium text-gray-900">
                  {u.full_name || 'Sin nombre'}
                  {isSelf && (
                    <span className="ml-2 text-xs text-gray-400 font-normal">
                      (Tú)
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-600 font-mono text-xs">
                  {u.email}
                </td>

                <td className="px-5 py-4 text-center">
                  {isSelf ? (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(primaryRole)}`}>
                      {getRoleLabel(primaryRole)}
                    </span>
                  ) : (
                    <div className="relative inline-block text-left" ref={isOpen ? dropdownRef : null}>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => setOpenDropdownId(isOpen ? null : u.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs disabled:opacity-50 ${getRoleBadgeStyle(primaryRole)}`}
                      >
                        <span>{getRoleLabel(primaryRole)}</span>
                        <svg
                          className={`w-3 h-3 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isOpen && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-36 rounded-xl bg-white shadow-2xl ring-1 ring-black/10 p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                          {AVAILABLE_ROLES.map((role) => (
                            <button
                              key={role.key}
                              type="button"
                              onClick={() => {
                                if (onChangeRole && primaryRole !== role.key) {
                                  onChangeRole(u, role.key);
                                }
                                setOpenDropdownId(null);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-1.5 my-0.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                primaryRole === role.key
                                  ? 'bg-gray-100 text-gray-900 font-bold'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <span>{role.label}</span>
                              {primaryRole === role.key && (
                                <span className="text-blue-600 text-xs">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </td>

                <td className="px-5 py-4 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      u.is_active
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {u.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>

                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => onToggleStatus && onToggleStatus(u)}
                    disabled={isProcessing || isSelf}
                    title={
                      isSelf
                        ? 'No puedes desactivarte a ti mismo'
                        : u.is_active
                        ? 'Desactivar cuenta'
                        : 'Activar cuenta'
                    }
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer ${
                      u.is_active
                        ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {u.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;