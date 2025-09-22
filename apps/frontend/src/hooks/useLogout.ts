'use client';

import { logout as logoutLib, type LogoutOpts } from '@/lib/logout';
import { useCallback, useState } from 'react';

export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(
    async (opts?: LogoutOpts) => {
      if (isLoggingOut) return;
      setIsLoggingOut(true);
      try {
        await logoutLib(opts);
      } finally {
        setIsLoggingOut(false);
      }
    },
    [isLoggingOut],
  );

  return { logout, isLoggingOut };
}
