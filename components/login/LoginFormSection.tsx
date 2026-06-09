'use client';

import { type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { AeroTrackIcon } from '../icons/AeroTrackLogo';
import { useApp } from '@/context/AppContext';

interface LoginFormSectionProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  rememberMe: boolean;
  setRememberMe: Dispatch<SetStateAction<boolean>>;
  error: string;
  infoMessage: string;
  setError: (error: string) => void;
  setInfoMessage: (message: string) => void;
  loading: boolean;
  onSubmit: (e: FormEvent) => void;
  onForgotPassword: () => void;
}

export function LoginFormSection({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  error,
  infoMessage,
  setError,
  setInfoMessage,
  loading,
  onSubmit,
  onForgotPassword,
}: LoginFormSectionProps) {
  const router = useRouter();
  const { startNavigationLoading } = useApp();

  return (
    <div className="relative flex w-full items-center justify-center bg-white lg:w-[38%]">
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />

      <div className="absolute left-6 top-6 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <AeroTrackIcon size={16} className="text-white" />
        </div>
        <span className="text-slate-800" style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
          Aero Track
        </span>
      </div>

      <button
        type="button"
        onClick={() => {
          startNavigationLoading('Membuka halaman awal...');
          router.push('/landing');
        }}
        className="absolute right-6 top-6 flex items-center gap-1.5 text-slate-400 transition-colors hover:text-slate-600"
        style={{ fontSize: '0.8125rem' }}
      >
        <ArrowLeft size={14} />
        Kembali
      </button>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm px-8 py-10"
      >
        <div className="mb-8">
          <h2
            className="text-slate-900"
            style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            Masuk ke Sistem
          </h2>
          <p className="mt-1 text-slate-500" style={{ fontSize: '0.875rem' }}>
            Gunakan email dan password sesuai role yang diberikan
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="ep-email"
              className="mb-1.5 block text-slate-700"
              style={{ fontSize: '0.8125rem', fontWeight: 500 }}
            >
              Alamat Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="ep-email"
                type="email"
                autoComplete="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                  setInfoMessage('');
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-500/12"
                style={{ fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="ep-password"
                className="text-slate-700"
                style={{ fontSize: '0.8125rem', fontWeight: 500 }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-blue-600 transition-colors hover:text-blue-700"
                style={{ fontSize: '0.75rem', fontWeight: 500 }}
              >
                Lupa password?
              </button>
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="ep-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                  setInfoMessage('');
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-3 focus:ring-blue-500/12"
                style={{ fontSize: '0.875rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-0.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={rememberMe}
              onClick={() => setRememberMe((v) => !v)}
              className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
                rememberMe
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-slate-300 bg-white hover:border-blue-400'
              }`}
            >
              {rememberMe && <CheckCircle2 size={11} className="text-white" fill="white" />}
            </button>
            <span
              className="cursor-pointer select-none text-slate-600"
              style={{ fontSize: '0.8125rem' }}
              onClick={() => setRememberMe((v) => !v)}
            >
              Ingat saya di perangkat ini
            </span>
          </div>

          {infoMessage && !error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3"
            >
              <Info size={15} className="mt-0.5 flex-shrink-0 text-blue-600" />
              <span className="text-blue-700" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                {infoMessage}
              </span>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3"
            >
              <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
                <span className="text-white" style={{ fontSize: '0.625rem', fontWeight: 700 }}>
                  !
                </span>
              </div>
              <span className="text-red-700" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                {error}
              </span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex w-full items-center justify-center gap-2.5 rounded-xl bg-blue-600 py-3 text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-blue-600/35 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ fontSize: '0.9375rem', fontWeight: 600 }}
          >
            {loading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                />
                Memverifikasi...
              </>
            ) : (
              <>
                Masuk ke Sistem
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400" style={{ fontSize: '0.6875rem' }}>
          © 2026 Aero Track Indonesia · v2.4.1
        </p>
      </motion.div>
    </div>
  );
}
