import { useState, useCallback, useEffect } from 'react';
import * as clientService from './clientService';
import type { Client, ClientCreatePayload, ClientUpdatePayload } from './client.types';
import { parseApiError } from '../../shared/utils/errorHandler';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [assigning, setAssigning] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.fetchClients();
      setClients(data);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addClient = async (payload: ClientCreatePayload) => {
    setCreating(true);
    setError(null);
    try {
      const newClient = await clientService.createClient(payload);
      setClients((prev) => [newClient, ...prev]);
      return newClient;
    } catch (err) {
      const msg = parseApiError(err).message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setCreating(false);
    }
  };

  const toggleClientStatus = async (client: Client) => {
    setActionLoadingId(client.id);
    try {
      const updated = await clientService.updateClient(client.id, {
        is_active: !client.is_active,
      });
      setClients((prev) => prev.map((c) => (c.id === client.id ? updated : c)));
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const removeClient = async (id: string) => {
    setActionLoadingId(id);
    try {
      await clientService.deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const assignTechnicians = async (clientId: string, technicianIds: string[]) => {
    setAssigning(true);
    setError(null);
    try {
      const updated = await clientService.assignTechniciansToClient(clientId, {
        technician_ids: technicianIds,
      });
      // Actualiza en memoria el registro específico
      setClients((prev) => prev.map((c) => (c.id === clientId ? updated : c)));
      // Re-sincroniza la lista completa para reflejar la relación cargada
      await fetchClients();
    } catch (err) {
      const msg = parseApiError(err).message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    creating,
    assigning,
    actionLoadingId,
    error,
    isCreateModalOpen,
    setIsCreateModalOpen,
    addClient,
    refetch: fetchClients,
    toggleClientStatus,
    removeClient,
    assignTechnicians,
  };
}