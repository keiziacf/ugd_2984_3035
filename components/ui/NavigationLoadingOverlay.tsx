'use client';

import { Loader2 } from 'lucide-react';

interface NavigationLoadingOverlayProps {
  show: boolean;
  message: string;
}

export function NavigationLoadingOverlay({ show, message }: NavigationLoadingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 text-white backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex min-w-[220px] max-w-[90vw] items-center gap-3 rounded-lg border border-white/10 bg-slate-900 px-5 py-4 shadow-xl">
        <Loader2 size={24} className="animate-spin text-blue-400" />
        <div className="min-w-0">
          <p className="truncate text-[0.9375rem] font-semibold text-white">{message}</p>
          <p className="mt-0.5 text-[0.75rem] text-slate-400">Mohon tunggu sebentar</p>
        </div>
      </div>
    </div>
  );
}
