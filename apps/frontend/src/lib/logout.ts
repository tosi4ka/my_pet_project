import { clearAuthToken } from '@/lib/api';
import { logoutRequest } from '@/lib/auth';
import { store } from '@/store';
import { clearAuth } from '@/store/slices/authSlice';

export type LogoutOpts = {
  redirectTo?: string;
  onAfter?: () => void;
};

let _logoutInProgress = false;

export async function logout(opts?: LogoutOpts): Promise<void> {
  if (_logoutInProgress) return;
  _logoutInProgress = true;

  try {
    try {
      await logoutRequest();
    } catch {}

    try {
      store.dispatch(clearAuth());
    } catch {}

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {}

    try {
      clearAuthToken();
    } catch {}

    if (opts?.onAfter) {
      try {
        opts.onAfter();
      } catch {}
    }

    const to = opts?.redirectTo ?? '/';
    if (typeof window !== 'undefined') {
      try {
        window.location.replace(to);
      } catch {}
    }
  } finally {
    _logoutInProgress = false;
  }
}
