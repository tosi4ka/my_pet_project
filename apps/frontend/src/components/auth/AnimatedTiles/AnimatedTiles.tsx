'use client';

import { useRef } from 'react';
import * as S from './AnimatedTiles.styles';
import { useTileLayout } from './hooks/useTileLayout';
import LogoIcon from './icon/LogoIcon';
import { AnimatedTileItem } from './TileItem/AnimatedTileItem';
import type { TileDef } from './types';

const TILES: TileDef[] = [
  {
    id: 't1',
    variant: 'purple',
    content: (
      <S.TileText>
        Easy words.
        <br />
        Fast fun.
      </S.TileText>
    ),
  },
  {
    id: 't2',
    variant: 'purple',
    content: (
      <S.LogoWrapper>
        <LogoIcon />
      </S.LogoWrapper>
    ),
  },
  {
    id: 't3',
    variant: 'yellow',
    content: (
      <>
        <S.Plus>+</S.Plus>
        <S.TileText>Start French today</S.TileText>
      </>
    ),
  },
  {
    id: 't4',
    variant: 'yellow',
    content: (
      <>
        <S.Plus>+</S.Plus>
        <S.TileText>
          Tiny lessons,
          <br />
          big wins
        </S.TileText>
      </>
    ),
  },
];

export default function AnimatedTiles() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { positions, cellSize, getXY, pause, resume } = useTileLayout(
    containerRef,
    TILES.length,
    {
      cols: 2,
      rows: 3,
      gap: 18,
      stepMs: 4200,
    },
  );

  return (
    <S.Container
      ref={containerRef}
      onMouseEnter={() => pause()}
      onMouseLeave={() => resume()}
    >
      <S.Grid />

      {TILES.map((tile, i) => {
        const posIndex = positions[i];
        const { x, y } = getXY(posIndex);
        const delay = i * 0.12;
        return (
          <AnimatedTileItem
            key={tile.id}
            tile={tile}
            index={i}
            x={x}
            y={y}
            cellSize={cellSize}
            delay={delay}
          />
        );
      })}

      <S.LeftBackdrop />
    </S.Container>
  );
}
