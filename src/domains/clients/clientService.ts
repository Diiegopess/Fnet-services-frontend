import apiClient from '../../core/api/apiClient';
import type {
  Client,
  ClientCreatePayload,
  ClientUpdatePayload,
  AssignTechniciansPayload,
} from './client.types';

export async function fetchClients(isActive?: boolean): Promise<Client[]> {
  const params = isActive !== undefined ? { is_active: isActive } : {};
  const resp = await apiClient.get<Client[]>('/clients', { params });
  return resp.data;
}

export async function fetchClient(id: string): Promise<Client> {
  const resp = await apiClient.get<Client>(`/clients/${id}`);
  return resp.data;
}

export async function createClient(payload: ClientCreatePayload): Promise<Client> {
  const resp = await apiClient.post<Client>('/clients', payload);
  return resp.data;
}

export async function updateClient(
  id: string,
  payload: ClientUpdatePayload
): Promise<Client> {
  const resp = await apiClient.patch<Client>(`/clients/${id}`, payload);
  return resp.data;
}

export async function assignTechniciansToClient(
  clientId: string,
  payload: AssignTechniciansPayload
): Promise<Client> {
  const resp = await apiClient.post<Client>(
    `/clients/${clientId}/technicians`,
    payload
  );
  return resp.data;
}

export async function deleteClient(id: string): Promise<void> {
  await apiClient.delete(`/clients/${id}`);
}