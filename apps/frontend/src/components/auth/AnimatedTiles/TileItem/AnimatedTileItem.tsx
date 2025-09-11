'use client';

import { motion } from 'framer-motion';
import React from 'react';
import type { AnimatedTileItemProps } from '../types';
import * as S from './AnimatedTileItem.styles';

export const AnimatedTileItem: React.FC<AnimatedTileItemProps> = ({
  tile,
  x,
  y,
  cellSize,
  delay = 0,
}) => {
  const width = Math.max(80, cellSize.w);
  const height = Math.max(80, cellSize.h);

  return (
    <motion.div
      key={tile.id}
      initial={false}
      animate={{ x, y }}
      transition={{
        type: 'spring',
        stiffness: 70,
        damping: 16,
        mass: 0.8,
        delay,
      }}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width,
        height,
        zIndex: 10,
      }}
      aria-hidden={false}
    >
      <S.TileInnerWrapper variant={tile.variant} img={tile.img} id={tile.id}>
        {tile.content}
      </S.TileInnerWrapper>
    </motion.div>
  );
};
