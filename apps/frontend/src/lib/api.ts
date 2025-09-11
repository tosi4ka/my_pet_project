import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true,
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export function clearAuthToken() {
  delete api.defaults.headers.common['Authorization'];
}

export function initApiAuth(): void {
  if (typeof window === 'undefined') return;
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    setAuthToken(storedToken);
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];
let refreshPromise: Promise<any> | null = null;

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}
function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export function performTokenRefresh(): Promise<any> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = api
    .post('/auth/refresh')
    .then((r) => {
      refreshPromise = null;
      return r;
    })
    .catch((err) => {
      refreshPromise = null;
      throw err;
    });

  return refreshPromise;
}

// Response interceptor
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const url = originalRequest.url ?? '';
    if (url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const r = await performTokenRefresh();
        const newToken = r.data?.accessToken ?? null;
        if (newToken) {
          localStorage.setItem('token', newToken);
          setAuthToken(newToken);
        } else {
          localStorage.removeItem('token');
          clearAuthToken();
        }
        onRefreshed(newToken);
        return api(originalRequest);
      } catch (refreshError) {
        onRefreshed(null);
        localStorage.removeItem('token');
        clearAuthToken();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
