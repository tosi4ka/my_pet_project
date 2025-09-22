'use client';

import { setSessionHeader } from '@/lib/api';
import { fetchCurrentUser } from '@/lib/auth';
import { useAppDispatch } from '@/store/hooks';
import { ReduxProvider } from '@/store/ReduxProvider';
import { clearUser, setUser } from '@/store/slices/authSlice';
import EmotionRegistry from '@/styles/EmotionRegistry';
import { GlobalStyles } from '@/styles/global';
import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';

type Props = { children: React.ReactNode };

function SessionBinder({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  useEffect(() => {
    const sid = (session?.user as any)?.id ?? null;
    setSessionHeader(sid);

    (async () => {
      if (!sid) {
        dispatch(clearUser());
        return;
      }

      try {
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
        } else {
          dispatch(clearUser());
        }
      } catch (err) {
        console.error('SessionBinder fetchCurrentUser error', err);
        dispatch(clearUser());
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  return <>{children}</>;
}

export default function ClientLayout({ children }: Props) {
  return (
    <ReduxProvider>
      <EmotionRegistry>
        <GlobalStyles />
        <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
          <SessionBinder>{children}</SessionBinder>
        </SessionProvider>
      </EmotionRegistry>
    </ReduxProvider>
  );
}
