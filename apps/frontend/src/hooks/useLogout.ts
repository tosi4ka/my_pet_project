'use client';

import { logout, type LogoutOpts } from '@/lib/logout';
import { useCallback, useState } from 'react';

export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const doLogout = useCallback(
    async (opts?: LogoutOpts) => {
      if (isLoggingOut) return;
      setIsLoggingOut(true);
      try {
        await logout(opts);
      } finally {
        setIsLoggingOut(false);
      }
    },
    [isLoggingOut],
  );

  return { logout: doLogout, isLoggingOut };
}
