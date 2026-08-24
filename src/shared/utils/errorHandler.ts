export function parseApiError(err: any) {
  if (!err) return { message: 'Unknown error' };
  return { message: err?.response?.data?.detail || err.message || 'Unknown error' };
}
