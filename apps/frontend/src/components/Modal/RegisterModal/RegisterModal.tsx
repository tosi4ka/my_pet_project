'use client';

import { AuthTiles } from '@/components/auth/AnimatedTiles';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as S from './RegisterModal.styles';

type RegisterModalProps = {
  open: boolean;
  onClose: () => void;
  onOpenLogin?: () => void;
};
function SafePortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    containerRef.current = document.body;
    setMounted(true);
  }, []);

  if (!mounted || !containerRef.current) return null;
  return createPortal(children, containerRef.current);
}

export default function RegisterModal({
  open,
  onClose,
  onOpenLogin,
}: RegisterModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement as HTMLElement | null;
    setTimeout(() => dialogRef.current?.focus(), 0);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prevActive?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <SafePortal>
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
          aria-label="Register"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <S.ModalInner>
            <S.LeftPanel>
              <RegisterForm onOpenLogin={onOpenLogin} />
            </S.LeftPanel>

            <S.RightPanel>
              <AuthTiles />
              <S.RightBackdrop />
            </S.RightPanel>
          </S.ModalInner>

          <S.CloseBtn aria-label="Close" onClick={onClose}>
            ✕
          </S.CloseBtn>
        </S.Dialog>
      </S.Overlay>
    </SafePortal>
  );
}
