'use client';

import styled from '@emotion/styled';
import { ButtonHTMLAttributes } from 'react';

type SocialButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
};

export default function SocialButton({ children, ...rest }: SocialButtonProps) {
  return <Btn {...rest}>{children}</Btn>;
}

const Btn = styled.button`
  height: 54px;
  border-radius: 25px;
  width: 48%;
  font-family: 'Geist', system-ui, sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: #fff;
  background-color: rgb(30, 32, 33);
  text-transform: none;
  letter-spacing: 0.2px;
  border: none;
  &:hover {
    color: rgb(30, 32, 33);
    background-color: #fff;
  }
`;
