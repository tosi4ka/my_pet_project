'use client';

import styled from '@emotion/styled';
import { ButtonHTMLAttributes } from 'react';

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
};

export default function AuthButton({ children, ...rest }: AuthButtonProps) {
  return <Btn {...rest}>{children}</Btn>;
}

const Btn = styled.button`
  height: 54px;
  border-radius: 25px;
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: #171717;
  text-transform: none;
  letter-spacing: 0.2px;
  border: none;
  &:hover {
    color: #fff;
    background-color: #171717;
  }
`;
