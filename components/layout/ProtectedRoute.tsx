'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { hydrated, isAuthenticated } = useApp();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/landing');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06121f] text-slate-300">
        Memuat dashboard...
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
