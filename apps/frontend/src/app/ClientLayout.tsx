'use client';

import { ReduxProvider } from '@/store/ReduxProvider';
import { EmotionProvider } from '@/styles/EmotionProvider';

type Props = { children: React.ReactNode };

export default function ClientLayout({ children }: Props) {
  return (
    <EmotionProvider>
      <ReduxProvider>{children}</ReduxProvider>
    </EmotionProvider>
  );
}
