'use client';

import { ReduxProvider } from '@/store/ReduxProvider';
import EmotionRegistry from '@/styles/EmotionRegistry';
import { GlobalStyles } from '@/styles/global';

type Props = { children: React.ReactNode };

export default function ClientLayout({ children }: Props) {
  return (
    <ReduxProvider>
      <EmotionRegistry>
        <GlobalStyles />
        {children}
      </EmotionRegistry>
    </ReduxProvider>
  );
}
