import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true,
});

export function initApiAuth(): void {
  return;
}

export function clearAuthToken(): void {
  try {
    delete api.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['X-Session-Id'];
  } catch {}
}

// let _lastBoundSessionId: string | null = null;
export async function bindSessionHeader(): Promise<void> {
  // if (typeof window === 'undefined') return;
  // try {
  //   const sess = await getSession();
  //   const sid = (sess?.user as any)?.id ?? null;
  //   if (sid && sid !== _lastBoundSessionId) {
  //     api.defaults.headers.common['X-Session-Id'] = sid;
  //     _lastBoundSessionId = sid;
  //   } else if (!sid) {
  //     delete api.defaults.headers.common['X-Session-Id'];
  //     _lastBoundSessionId = null;
  //   }
  // } catch (err) {
  //   delete api.defaults.headers.common['X-Session-Id'];
  //   _lastBoundSessionId = null;
  // }
  return;
}

export function setSessionHeader(sessionId?: string | null) {
  if (sessionId) {
    api.defaults.headers.common['X-Session-Id'] = String(sessionId);
  } else {
    delete api.defaults.headers.common['X-Session-Id'];
  }
}

export function clearClientAuthState(): void {
  try {
    localStorage.removeItem('user');
  } catch {}
  try {
    delete api.defaults.headers.common['X-Session-Id'];
  } catch {}
}

export default api;
