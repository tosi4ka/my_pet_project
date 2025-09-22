'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type VerifyNoticeProps = {
  email?: string;
  onClose?: () => void;
};

export default function VerifyNotice({ email, onClose }: VerifyNoticeProps) {
  const elRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.createElement('div');
    elRef.current = el;
    document.body.appendChild(el);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
      if (elRef.current) {
        document.body.removeChild(elRef.current);
        elRef.current = null;
      }
    };
  }, []);

  if (!elRef.current) return null;

  const node = (
    <div
      aria-modal="true"
      role="dialog"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        background: 'rgba(0,0,0,0.45)',
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 640,
          width: '100%',
          background: 'white',
          color: '#111',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Confirm your email</h3>
        <p>
          We sent a confirmation email to <strong>{email}</strong>. Please
          follow the link in that email to confirm your account. Some features
          of your account will remain restricted until you confirm your email.
        </p>

        <div
          style={{
            marginTop: 16,
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              background: '#eee',
              border: 'none',
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(node, elRef.current);
}
