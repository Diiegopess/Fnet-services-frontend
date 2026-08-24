export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AuthUser {
  id?: string;
  email: string;
  sub?: string;
  full_name?: string;
  picture_url?: string;
  is_superuser?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}