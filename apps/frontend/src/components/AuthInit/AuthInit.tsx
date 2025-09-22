'use client';

import { bindSessionHeader } from '@/lib/api';
import { fetchCurrentUser } from '@/lib/auth';
import { useAppDispatch } from '@/store/hooks';
import { clearUser, setUser } from '@/store/slices/authSlice';
import { getSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function AuthInit() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      try {
        await bindSessionHeader();

        const sess = await getSession();
        if (sess?.user?.id) {
          const fetched = await fetchCurrentUser();
          if (fetched) {
            dispatch(
              setUser({
                id: fetched.id,
                name: fetched.name ?? undefined,
                email: fetched.email ?? undefined,
                role: undefined,
              }),
            );
            return;
          }
        }

        dispatch(clearUser());
      } catch (err) {
        console.error('AuthInit error', err);
        dispatch(clearUser());
      }
    })();
  }, [dispatch]);

  return null;
}
