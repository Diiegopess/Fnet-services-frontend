import apiClient from '../../core/api/apiClient';
import type {
  User,
  UserUpdateAdminPayload,
  UserCreatePayload,
  AssignRolesPayload,
} from './user.types';

export async function createUser(payload: UserCreatePayload): Promise<User> {
  const resp = await apiClient.post<User>('/users/', payload);
  return resp.data;
}

export async function fetchUsers(): Promise<User[]> {
  const resp = await apiClient.get<User[]>('/users/');
  return resp.data;
}

export async function fetchUser(id: string): Promise<User> {
  const resp = await apiClient.get<User>(`/users/${id}`);
  return resp.data;
}

export async function updateUserAdmin(
  id: string,
  payload: UserUpdateAdminPayload
): Promise<User> {
  const resp = await apiClient.patch<User>(`/users/${id}`, payload);
  return resp.data;
}

export async function assignRolesToUser(
  id: string,
  payload: AssignRolesPayload
): Promise<User> {
  const resp = await apiClient.post<User>(`/users/${id}/roles`, payload);
  return resp.data;
}