import { useState, useEffect, useCallback } from 'react';
import type {
  Client,
  ClientCreatePayload,
  ClientUpdatePayload,
  AssignTechniciansPayload,
} from './client.types';
import {
  fetchClients,
  createClient,
  updateClient,
  assignTechniciansToClient,
  deleteClient,
} from './clientService';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchClients();
      setClients(data);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Error al cargar clientes';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const addClient = async (payload: ClientCreatePayload) => {
    try {
      setCreating(true);
      setError(null);
      await createClient(payload);
      await loadClients();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al registrar cliente';
      throw new Error(msg);
    } finally {
      setCreating(false);
    }
  };

  const editClient = async (id: string, payload: ClientUpdatePayload) => {
    try {
      setActionLoadingId(id);
      setError(null);
      const updated = await updateClient(id, payload);
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
      );
      return updated;
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Error al actualizar cliente';
      setError(msg);
      throw err;
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleClientStatus = async (client: Client) => {
    return editClient(client.id, { is_active: !client.is_active });
  };

  const assignTechnicians = async (
    clientId: string,
    payload: AssignTechniciansPayload
  ) => {
    try {
      setActionLoadingId(clientId);
      setError(null);
      const updated = await assignTechniciansToClient(clientId, payload);
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, ...updated } : c))
      );
      return updated;
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al asignar técnicos';
      setError(msg);
      throw err;
    } finally {
      setActionLoadingId(null);
    }
  };

  const removeClient = async (id: string) => {
    try {
      setActionLoadingId(id);
      setError(null);
      await deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al eliminar cliente';
      setError(msg);
      throw err;
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return {
    clients,
    loading,
    creating,
    actionLoadingId,
    error,
    isCreateModalOpen,
    setIsCreateModalOpen,
    addClient,
    editClient,
    toggleClientStatus,
    assignTechnicians,
    removeClient,
    refetch: loadClients,
  };
};