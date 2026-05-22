'use client';

import { Loader2, Plane } from 'lucide-react';

interface NavigationLoadingOverlayProps {
  show: boolean;
  message: string;
}

export function NavigationLoadingOverlay({ show, message }: NavigationLoadingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/72 px-6 text-white backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex min-w-[230px] max-w-[90vw] items-center gap-4 rounded-2xl border border-white/10 bg-[#0b1d33]/92 px-5 py-4 shadow-2xl shadow-slate-950/40">
        <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600">
          <Plane size={20} className="text-white" />
          <Loader2 size={42} className="absolute animate-spin text-white/35" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[0.9375rem] font-semibold leading-tight text-white">
            {message}
          </p>
          <p className="mt-1 text-[0.75rem] font-medium text-slate-300">
            Mohon tunggu sebentar
          </p>
        </div>
      </div>
    </div>
  );
}
