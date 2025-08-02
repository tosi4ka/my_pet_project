'use client';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { ReactNode } from 'react';

const emotionCache = createCache({ key: 'css', prepend: true });

export function EmotionProvider({ children }: { children: ReactNode }) {
  return <CacheProvider value={emotionCache}>{children}</CacheProvider>;
}
