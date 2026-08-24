export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserUpdateAdminPayload {
  full_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface UserCreatePayload {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  is_superuser?: boolean;
}