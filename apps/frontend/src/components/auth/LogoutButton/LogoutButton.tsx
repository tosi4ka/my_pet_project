'use client';

import { useLogout } from '@/hooks/useLogout';
import api from '@/lib/api';
import { useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';

type LogoutButtonProps = {
  children?: React.ReactNode;
  className?: string;
  redirectTo?: string;
  onAfter?: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function LogoutButton({
  children,
  className,
  redirectTo,
  onAfter,
  ...rest
}: LogoutButtonProps) {
  const { logout, isLoggingOut } = useLogout();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleClick = useCallback(
    async (e?: React.MouseEvent<HTMLButtonElement>) => {
      try {
        await logout({ onAfter });
      } catch (err) {
        console.error('logout hook error', err);
      } finally {
        try {
          dispatch(clearUser());
        } catch {}
        try {
          delete api.defaults.headers.common['X-Session-Id'];
        } catch {}
        if (redirectTo) {
          try {
            router.replace(redirectTo);
          } catch (e) {
            try {
              router.push(redirectTo);
            } catch {}
          }
        }
      }
    },
    [logout, redirectTo, onAfter, dispatch, router],
  );

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={isLoggingOut || rest.disabled}
      {...rest}
    >
      {isLoggingOut ? 'Signing out…' : (children ?? 'Logout')}
    </button>
  );
}
