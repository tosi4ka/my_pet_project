'use client';
import React, { useRef } from 'react';

export default function OtpInput({
  length = 6,
  onComplete,
  disabled = false,
}: {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const onChange = (i: number, v: string) => {
    if (disabled) return;
    const val = v.replace(/\D/g, '').slice(-1);
    if (refs.current[i]) refs.current[i]!.value = val;
    if (val && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
    const code = refs.current.map((r) => r?.value ?? '').join('');
    if (code.length === length) {
      onComplete(code);
    }
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !refs.current[i]?.value && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKey(i, e)}
          inputMode="numeric"
          maxLength={1}
          style={{
            width: 42,
            height: 42,
            textAlign: 'center',
            fontSize: 18,
            borderRadius: 8,
            border: '1px solid #999',
            background: '#0c0c0c',
            color: '#fff',
          }}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
