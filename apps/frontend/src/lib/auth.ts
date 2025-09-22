import api from '@/lib/api';

export type User = {
  id: string;
  name?: string | null;
  email?: string;
  phone?: string | null;
};

export async function loginRequest(email: string, password: string) {
  const r = await api.post('/auth/login', { email, password });
  return r.data;
}

export async function logoutRequest() {
  await api.post('/auth/logout');
}

export async function startPhoneLogin(phone: string) {
  const r = await api.post('/auth/login-by-phone', { phone });
  return r.data;
}

export async function verifyOtp(sessionId: string, otp: string) {
  const r = await api.post('/auth/verify-otp', { sessionId, otp });
  return r.data;
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const r = await api.get('/auth/me');
    return r.data?.user ?? null;
  } catch (e) {
    return null;
  }
}
