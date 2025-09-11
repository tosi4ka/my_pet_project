'use client';

import InitAuth from '@/components/auth/InitAuth';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from './index';

interface ReduxProviderProps {
  children: ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <InitAuth />
      {children}
    </Provider>
  );
}
