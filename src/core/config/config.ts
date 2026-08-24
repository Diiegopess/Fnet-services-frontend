export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  STORAGE_KEYS: {
    AUTH_TOKEN: 'access_token',
  },
} as const;

export const GOOGLE_CLIENT_ID = ENV.GOOGLE_CLIENT_ID;