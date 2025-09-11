import api, {
  clearAuthToken,
  performTokenRefresh,
  setAuthToken,
} from '@/lib/api';

export type User = { id: string; name?: string | null; email?: string };

export async function loginRequest(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  const token = res.data?.accessToken ?? null;
  if (token) {
    localStorage.setItem('token', token);
    setAuthToken(token);
  }
  return res.data;
}

export async function refreshRequest() {
  const r = await performTokenRefresh();
  const token = r.data?.accessToken ?? null;
  if (token) {
    localStorage.setItem('token', token);
    setAuthToken(token);
  } else {
    localStorage.removeItem('token');
    clearAuthToken();
  }
  return r.data;
}

export async function logoutRequest() {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  clearAuthToken();
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const r = await api.get('/auth/me');
    return r.data?.user ?? r.data ?? null;
  } catch (e) {
    console.warn('fetchCurrentUser failed', e);
    return null;
  }
}
