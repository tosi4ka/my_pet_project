'use client';

import { AuthTiles } from '@/components/auth/AnimatedTiles';
import { LoginForm } from '@/components/auth/LoginForm';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as S from './LoginModal.style';

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  onOpenForgot?: () => void;
};

export default function LoginModal({
  open,
  onClose,
  onOpenForgot,
}: LoginModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement as HTMLElement | null;
    setTimeout(() => dialogRef.current?.focus(), 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prevActive?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <S.Overlay
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <S.Dialog
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Login"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <S.ModalInner>
          <S.LeftPanel>
            <AuthTiles />
            <S.LeftBackdrop />
          </S.LeftPanel>

          <S.RightPanel>
            <LoginForm
              onForgotPassword={() => {
                onClose();
                onOpenForgot?.();
              }}
            />
          </S.RightPanel>
        </S.ModalInner>

        <S.CloseBtn aria-label="Close" onClick={onClose}>
          ✕
        </S.CloseBtn>
      </S.Dialog>
    </S.Overlay>,
    document.body,
  );
}
