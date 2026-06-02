'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300">
          <AlertTriangle size={24} />
        </div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-red-600 dark:text-red-300">
          Error aplikasi
        </p>
        <h1 className="text-2xl font-bold">Terjadi kesalahan</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Sistem gagal memuat halaman ini. Pesan error: {error.message || 'Tidak ada detail error.'}
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-500">
            Digest: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          Coba Lagi
        </button>
      </section>
    </main>
  );
}
