import React from 'react';

export type TileVariant = 'img' | 'purple' | 'yellow';

export type TileDef = {
  id: string;
  variant: TileVariant;
  img?: string;
  content?: React.ReactNode;
};

export type CellSize = { w: number; h: number; gap: number };

export type UseTileLayoutOptions = {
  cols?: number;
  rows?: number;
  gap?: number;
  stepMs?: number;
  initialPositions?: number[];
};

export type TileInnerProps = {
  variant?: 'img' | 'purple' | 'yellow';
  img?: string | undefined;
};
export type AnimatedTileItemProps = {
  tile: TileDef;
  index: number;
  x: number;
  y: number;
  cellSize: CellSize;
  delay?: number;
  id?: string;
};
