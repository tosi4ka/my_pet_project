import styled from '@emotion/styled';
import { TileInnerProps } from '../types';

export const TileInnerWrapper = styled('div')<TileInnerProps>`
  width: 100%;
  height: 100%;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.02),
    0 10px 28px rgba(0, 0, 0, 0.45);
  border-radius: 14px;
  padding: 18px;
  box-sizing: border-box;
  display: flex;
  position: relative;
  overflow: hidden;

  ${(p) =>
    p.variant === 'img' &&
    p.img &&
    `
    background-image: url(${p.img});
    background-size: cover;
    background-position: center;
    filter: saturate(0.6) brightness(0.72);
  `}

  ${(p) =>
    p.variant === 'purple' &&
    `
    background: linear-gradient(180deg,#d7b7ff,#a87bff);
    color: #0b0b0b;
    justify-content: center;
    align-items: center;
  `}

  ${(p) =>
    p.variant === 'purple' &&
    p.id === 't1' &&
    `
    justify-content: flex-start;
    align-items: flex-end;
  `}


  ${(p) =>
    p.variant === 'yellow' &&
    `
    background: linear-gradient(180deg,#f7efc9,#efeaa3);
    color: #0b0b0b;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    padding: 14px;
  `}
`;
