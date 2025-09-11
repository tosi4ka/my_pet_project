'use client';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';
import React from 'react';

type Props = { children: React.ReactNode };

function createEmotionCache() {
  let insertionPoint: HTMLElement | null = null;
  if (typeof document !== 'undefined') {
    insertionPoint = document.querySelector(
      'meta[name="emotion-insertion-point"]',
    );
  }

  const cache = createCache({
    key: 'css',
    prepend: true,
    insertionPoint: insertionPoint ?? undefined,
  });

  (cache as unknown as { compat?: boolean }).compat = true;

  return cache;
}

export default function EmotionRegistry({ children }: Props) {
  const [{ cache, flush }] = React.useState(() => {
    const cache = createEmotionCache();

    const inserted: string[] = [];

    const originalInsert = (
      cache.insert as (...args: unknown[]) => unknown
    ).bind(cache);

    cache.insert = ((...args: any[]) => {
      const serialized = args[1] as { name?: string } | undefined;
      const name = serialized?.name;
      if (name && cache.inserted && cache.inserted[name] === undefined) {
        inserted.push(name);
      }
      return originalInsert(...args);
    }) as typeof cache.insert;

    return {
      cache,
      flush: () => {
        const names = inserted.slice();
        inserted.length = 0;
        return names;
      },
    };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (!names.length) return null;

    let css = '';
    for (const name of names) {
      const entry = (cache.inserted as Record<string, string | undefined>)[
        name
      ];
      if (entry) css += entry;
    }

    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: css }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
