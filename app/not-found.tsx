import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Halaman Tidak Ditemukan',
  description: 'Halaman Aero Track yang diminta tidak tersedia.',
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
          <Search size={24} />
        </div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-blue-600 dark:text-blue-300">
          Error 404
        </p>
        <h1 className="text-2xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Rute yang dibuka tidak tersedia atau sudah dipindahkan. Periksa kembali alamat halaman,
          lalu kembali ke dashboard jika masih ingin melanjutkan pekerjaan.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Home size={16} />
          Kembali ke Dashboard
        </Link>
      </section>
    </main>
  );
}
