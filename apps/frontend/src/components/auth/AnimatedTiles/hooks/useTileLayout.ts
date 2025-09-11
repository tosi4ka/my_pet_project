import { useEffect, useRef, useState } from 'react';
import {
  CCW_NEXT,
  DEFAULT_COLS,
  DEFAULT_GAP,
  DEFAULT_ROWS,
  DEFAULT_STEP_MS,
} from '../constants';
import type { CellSize, UseTileLayoutOptions } from '../types';

export function useTileLayout(
  containerRef: React.RefObject<HTMLElement | null>,
  tileCount: number,
  opts?: UseTileLayoutOptions,
) {
  const cols = opts?.cols ?? DEFAULT_COLS;
  const rows = opts?.rows ?? DEFAULT_ROWS;
  const gap = opts?.gap ?? DEFAULT_GAP;
  const stepMs = opts?.stepMs ?? DEFAULT_STEP_MS;

  const [cellSize, setCellSize] = useState<CellSize>({ w: 0, h: 0, gap });

  const initialPositions = opts?.initialPositions ?? [0, 1, 4, 5];
  const normalizeInit = (arr: number[]) => {
    const res: number[] = [];
    for (let i = 0; i < tileCount; i++) {
      res.push(arr[i % arr.length]);
    }
    return res;
  };
  const [positions, setPositions] = useState<number[]>(
    normalizeInit(initialPositions),
  );

  const pausedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const target = el;

    function measure() {
      const rect = target.getBoundingClientRect();
      const totalGapW = (cols - 1) * gap;
      const totalGapH = (rows - 1) * gap;
      const availableW = Math.max(0, rect.width - totalGapW);
      const availableH = Math.max(0, rect.height - totalGapH);
      const w = availableW / cols;
      const h = availableH / rows;
      setCellSize((prev) => {
        if (prev.w === w && prev.h === h && prev.gap === gap) return prev;
        return { w, h, gap };
      });
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(target);

    return () => {
      try {
        ro.unobserve(target);
      } catch (e) {}
      ro.disconnect();
    };
  }, [containerRef.current, cols, rows, gap]);

  useEffect(() => {
    if (tileCount <= 0) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setPositions((prev) => prev.map((p) => CCW_NEXT[p] ?? p));
    }, stepMs);
    return () => clearInterval(id);
  }, [stepMs, tileCount]);

  function getXY(index: number) {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = col * (cellSize.w + cellSize.gap);
    const y = row * (cellSize.h + cellSize.gap);
    return { x, y };
  }

  function pause() {
    pausedRef.current = true;
  }
  function resume() {
    pausedRef.current = false;
  }
  function rotateOnce() {
    setPositions((prev) => prev.map((p) => CCW_NEXT[p] ?? p));
  }
  function setCustomPositions(newPositions: number[]) {
    setPositions(newPositions);
  }

  return {
    positions,
    cellSize,
    getXY,
    pause,
    resume,
    rotateOnce,
    setCustomPositions,
  } as const;
}
