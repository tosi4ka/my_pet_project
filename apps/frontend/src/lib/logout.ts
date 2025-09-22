import { clearAuthToken } from '@/lib/api';
import { logoutRequest } from '@/lib/auth';
import { store } from '@/store';
import { clearUser } from '@/store/slices/authSlice';
import { signOut } from 'next-auth/react';

export type LogoutOpts = {
  onAfter?: () => void;
};

let _logoutInProgress = false;

export async function logout(_: LogoutOpts = {}): Promise<void> {
  if (_logoutInProgress) return;
  _logoutInProgress = true;

  try {
    await signOut({ redirect: false });
  } catch (e) {
    console.error('signOut error', e);
  }

  try {
    try {
      await logoutRequest();
    } catch (e) {}

    try {
      store.dispatch(clearUser());
    } catch (e) {}

    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (e) {}

    try {
      clearAuthToken();
    } catch (e) {}

    if (_ && _.onAfter) {
      try {
        _.onAfter();
      } catch {}
    }
  } finally {
    _logoutInProgress = false;
  }
}
