import React from 'react';
import { useAuth } from '../domains/auth/AuthContext';
import { useUsers } from '../domains/users/useUsers';
import { UsersTable } from '../domains/users/components/UsersTable';
import CreateUserModal from '../domains/users/components/CreateUserModal';
import Spinner from '../shared/components/Spinner';

export const UsersPage: React.FC = () => {
  const { user } = useAuth();
  const {
    users,
    loading,
    creating,
    actionLoadingId,
    error,
    isCreateModalOpen,
    setIsCreateModalOpen,
    addUser,
    refetch,
    toggleUserStatus,
    toggleUserRole,
  } = useUsers();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-500">
            Listado y administración de cuentas registradas en el sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            + Nuevo Usuario
          </button>
          <button
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Refrescar
          </button>
        </div>
      </div>

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

      {!loading && (
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <UsersTable
            users={users}
            currentUserId={user?.sub}
            actionLoadingId={actionLoadingId}
            onToggleStatus={toggleUserStatus}
            onToggleRole={toggleUserRole}
          />
        </div>
      )}

      {/* Modal de Registro de Usuario */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={addUser}
        loading={creating}
      />
    </div>
  );
};

export default UsersPage;