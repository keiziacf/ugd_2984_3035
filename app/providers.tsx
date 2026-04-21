'use client';

import type { ReactNode } from 'react';
import { AppProvider } from '@/context/AppContext';
import { CargoProvider } from '@/context/CargoContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <CargoProvider>{children}</CargoProvider>
    </AppProvider>
  );
}
