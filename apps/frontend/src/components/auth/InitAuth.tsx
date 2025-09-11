'use client';

import { initApiAuth, setAuthToken } from '@/lib/api';
import { fetchCurrentUser, refreshRequest } from '@/lib/auth';
import { useAppDispatch } from '@/store/hooks';
import { setToken, setUser } from '@/store/slices/authSlice';
import { isTokenExpired } from '@/utils/jwt';
import { useEffect } from 'react';

type SliceUser = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
};

export default function InitAuth() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    initApiAuth();

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && !isTokenExpired(token)) {
      try {
        dispatch(setToken(token));
        setAuthToken(token);
      } catch {
        // ignore
      }
    }

    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        const sliceUser: SliceUser = {
          id: parsed.id,
          name: parsed.name ?? undefined,
          email: parsed.email ?? undefined,
          role: parsed.role ?? undefined,
        };
        dispatch(setUser(sliceUser));
      } catch {}
    }

    (async () => {
      try {
        const currentToken = localStorage.getItem('token');

        if (!currentToken) return;

        if (!isTokenExpired(currentToken)) return;

        const r = await refreshRequest();
        const newToken = r?.accessToken ?? null;

        if (newToken) {
          try {
            dispatch(setToken(newToken));
            setAuthToken(newToken);
          } catch {}
        } else {
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } catch {}
          return;
        }

        const existingUserStr = localStorage.getItem('user');
        if (!existingUserStr) {
          const me = await fetchCurrentUser();
          if (me) {
            const sliceUser: SliceUser = {
              id: me.id,
              name: me.name ?? undefined,
              email: me.email ?? undefined,
              role: undefined,
            };
            try {
              localStorage.setItem('user', JSON.stringify(sliceUser));
            } catch {}
            dispatch(setUser(sliceUser));
          }
        }
      } catch {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch {}
      }
    })();
  }, [dispatch]);

  return null;
}
