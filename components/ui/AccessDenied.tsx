'use client';

import { useRouter } from 'next/navigation';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ROLE_META } from '@/lib/permissions';

interface AccessDeniedProps {
  requiredRole?: string;
  pageName?: string;
}

export function AccessDenied({ requiredRole, pageName }: AccessDeniedProps) {
  const { isDark, currentUser } = useApp();
  const router = useRouter();
  const roleMeta = ROLE_META[currentUser.role];

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 transition-colors ${
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      }`}
    >
      <div
        className={`w-full max-w-lg rounded-2xl border p-10 text-center shadow-lg ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}
      >
        {/* Icon */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${
            isDark ? 'bg-red-900/30' : 'bg-red-50'
          }`}
        >
          <ShieldX size={40} className="text-red-500" />
        </div>

        {/* Title */}
        <h2
          className={`mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
          style={{ fontSize: '1.5rem', fontWeight: 700 }}
        >
          Akses Ditolak
        </h2>
        <p
          className={`mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          style={{ fontSize: '0.9375rem' }}
        >
          Anda tidak memiliki izin untuk mengakses{' '}
          {pageName ? <strong>{pageName}</strong> : 'halaman ini'}.
        </p>

        {/* Current Role Info */}
        <div
          className={`flex items-center justify-center gap-3 p-4 rounded-xl border mb-5 ${
            isDark ? 'border-slate-700 bg-slate-700/50' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: roleMeta.color }}
          >
            <span className="text-white" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
              {currentUser.initials}
            </span>
          </div>
          <div className="text-left">
            <p
              className={`${isDark ? 'text-slate-200' : 'text-slate-800'}`}
              style={{ fontWeight: 600, fontSize: '0.9375rem' }}
            >
              {currentUser.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`px-2 py-0.5 rounded-full border text-xs font-bold ${roleMeta.bgClass} ${roleMeta.textClass} ${roleMeta.borderClass}`}
              >
                {roleMeta.label}
              </span>
              <span
                className={`${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                style={{ fontSize: '0.75rem' }}
              >
                {roleMeta.description}
              </span>
            </div>
          </div>
        </div>

        {/* Requirement info */}
        {requiredRole && (
          <div
            className={`p-3 rounded-lg mb-5 ${
              isDark ? 'bg-amber-900/20 border border-amber-800/40' : 'bg-amber-50 border border-amber-200'
            }`}
          >
            <p className={`${isDark ? 'text-amber-300' : 'text-amber-700'}`} style={{ fontSize: '0.8125rem' }}>
              Halaman ini memerlukan akses <strong>{requiredRole}</strong>. Hubungi Administrator untuk mendapatkan hak akses.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
              isDark
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                : 'border-slate-300 text-slate-600 hover:bg-slate-100'
            }`}
            style={{ fontSize: '0.875rem', fontWeight: 500 }}
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            style={{ fontSize: '0.875rem', fontWeight: 500 }}
          >
            <Home size={16} />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
