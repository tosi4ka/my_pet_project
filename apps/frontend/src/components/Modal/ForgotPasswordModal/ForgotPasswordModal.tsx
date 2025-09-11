'use client';

import styled from '@emotion/styled';
import { useEffect } from 'react';

type ForgotPasswordModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function ForgotPasswordModal({
  open,
  onClose,
}: ForgotPasswordModalProps) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <Title>Reset password</Title>
        <SubTitle>Enter your email to receive a reset link.</SubTitle>
        <Actions>
          <CloseBtn onClick={onClose}>Close</CloseBtn>
        </Actions>
      </ModalBox>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  width: 420px;
  max-width: 92vw;
  background: #1e1e1e;
  color: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
  padding: 24px;
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
`;

const SubTitle = styled.p`
  margin: 0 0 20px;
  color: rgba(255, 255, 255, 0.75);
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const CloseBtn = styled.button`
  background: #414141;
  color: #fff;
  border: 0;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #4d4d4d;
  }
`;
