'use client';
import React from 'react';
import * as S from './FloatingInput.style';
import { FloatingInputProps } from './FloatingInputType';

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      id,
      name,
      label,
      type = 'text',
      value,
      onChange,
      onBlur,
      autoComplete,
      error,
      helperText,
      disabled,
      textAlign = 'left',
      rightAdornment,
      ...rest
    },
    ref,
  ) => {
    const hasError = Boolean(error);

    return (
      <S.Field data-error={hasError}>
        <S.InputWrap>
          <S.Input
            id={id}
            name={name}
            ref={ref}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder=" "
            autoComplete={autoComplete}
            aria-invalid={hasError || undefined}
            aria-describedby={helperText ? `${id}-help` : undefined}
            disabled={disabled}
            data-align={textAlign}
            data-withadornment={Boolean(rightAdornment)}
            {...(rest as any)}
          />
          {rightAdornment ? <S.Adornment>{rightAdornment}</S.Adornment> : null}
          <S.Label htmlFor={id}>{label}</S.Label>
        </S.InputWrap>

        {hasError ? (
          <S.Msg role="alert">{error}</S.Msg>
        ) : helperText ? (
          <S.Msg id={`${id}-help`}>{helperText}</S.Msg>
        ) : null}
      </S.Field>
    );
  },
);

FloatingInput.displayName = 'FloatingInput';

export default FloatingInput;
