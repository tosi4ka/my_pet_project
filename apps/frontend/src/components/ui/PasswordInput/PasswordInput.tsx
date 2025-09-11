'use client';
import { useState } from 'react';
import FloatingInput from '../FloatingInput/FloatingInput';

type Props = Omit<
  React.ComponentProps<typeof FloatingInput>,
  'type' | 'rightAdornment'
>;

export default function PasswordInput(props: Props) {
  const [show, setShow] = useState(false);

  return (
    <FloatingInput
      {...props}
      type={show ? 'text' : 'password'}
      rightAdornment={
        <button
          type="button"
          aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
          onClick={() => setShow((s) => !s)}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
}

function EyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" />
      <path
        d="M10.6 10.6A3 3 0 0012 15a3 3 0 002.4-4.4M2 12s3.5-6 10-6c2.2 0 4 .6 5.5 1.4M21.8 13.5C20.6 15.3 17.5 18 12 18c-2.2 0-4-.6-5.5-1.4"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
