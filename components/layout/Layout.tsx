'use client';

import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useApp } from '@/context/AppContext';

export function Layout({ children }: { children: ReactNode }) {
  const { isDark } = useApp();

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      }`}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
