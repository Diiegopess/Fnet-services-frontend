import { useState, useEffect, useCallback } from 'react';
import type { User, UserUpdateAdminPayload, UserCreatePayload } from './user.types';
import { fetchUsers, updateUserAdmin, createUser } from './userService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.message || 'Error al cargar usuarios';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const addUser = async (payload: UserCreatePayload) => {
    try {
      setCreating(true);
      setError(null);
      await createUser(payload);
      await loadUsers(); // Refresca la tabla tras registrar
      setIsCreateModalOpen(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al registrar usuario';
      throw new Error(msg);
    } finally {
      setCreating(false);
    }
  };

  const updateUser = async (id: string, payload: UserUpdateAdminPayload) => {
    try {
      setActionLoadingId(id);
      setError(null);
      const updated = await updateUserAdmin(id, payload);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updated } : u))
      );
      return updated;
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Error al actualizar usuario';
      setError(msg);
      throw err;
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleUserStatus = async (user: User) => {
    return updateUser(user.id, { is_active: !user.is_active });
  };

  const toggleUserRole = async (user: User) => {
    return updateUser(user.id, { is_superuser: !user.is_superuser });
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    creating,
    actionLoadingId,
    error,
    isCreateModalOpen,
    setIsCreateModalOpen,
    addUser,
    refetch: loadUsers,
    toggleUserStatus,
    toggleUserRole,
  };
};