import apiClient from '../../core/api/apiClient';
import type { LoginResponse, LoginCredentials, AuthUser } from './auth.types';

export async function loginWithCredentials(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const resp = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return resp.data;
}

export async function loginWithGoogle(tokenId: string): Promise<LoginResponse> {
  const resp = await apiClient.post<LoginResponse>('/auth/google', {
    id_token: tokenId,
  });
  return resp.data;
}

export async function fetchCurrentProfile(): Promise<AuthUser> {
  const resp = await apiClient.get<any>('/users/me');
  const data = resp.data;
  return {
    id: data.id,
    sub: data.id,
    email: data.email,
    full_name: data.full_name || data.email.split('@')[0],
    is_superuser: Boolean(data.is_superuser),
  };
}

export async function logoutSession(): Promise<void> {
  await apiClient.post('/auth/logout');
}