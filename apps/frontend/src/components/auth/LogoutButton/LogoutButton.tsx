'use client';

import { useLogout } from '@/hooks/useLogout';
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

  const handleClick = useCallback(
    async (e?: React.MouseEvent<HTMLButtonElement>) => {
      await logout({ redirectTo, onAfter });
    },
    [logout, redirectTo, onAfter],
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
