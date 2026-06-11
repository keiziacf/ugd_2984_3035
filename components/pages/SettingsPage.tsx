'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sun,
  Moon,
  Bell,
  Shield,
  User,
  Globe,
  Info,
  Save,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AeroTrackIcon } from '@/components/icons/AeroTrackLogo';
import { LOGIN_ACCOUNTS, ROLE_LABELS } from '@/lib/auth';

const AIRPORT_LABELS: Record<string, string> = {
  HQ: 'Kantor Pusat (HQ)',
  CGK: 'Bandara Soekarno-Hatta (CGK)',
  SUB: 'Bandara Juanda (SUB)',
  DPS: 'Bandara Ngurah Rai (DPS)',
  KNO: 'Bandara Kualanamu (KNO)',
  UPG: 'Bandara Hasanuddin (UPG)',
};

function ToggleSwitch({
  checked,
  isDark,
  onChange,
}: {
  checked: boolean;
  isDark: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-5.5 w-10 rounded-full transition-colors ${
        checked ? 'bg-blue-600' : isDark ? 'bg-slate-600' : 'bg-slate-300'
      }`}
      style={{ width: 40, height: 22 }}
    >
      <div
        className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(0)' }}
      />
    </button>
  );
}

export function SettingsPage() {
  const { currentUser, isDark, toggleDark } = useApp();
  const [notifications, setNotifications] = useState({
    email: true,
    delay: true,
    arrived: true,
    system: false,
  });
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [passwordError, setPasswordError] = useState('');

  const cardBase = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const labelCls = isDark ? 'text-slate-300' : 'text-slate-700';
  const subCls = isDark ? 'text-slate-500' : 'text-slate-400';
  const dividerCls = isDark ? 'border-slate-700' : 'border-slate-100';
  const airportLabel = AIRPORT_LABELS[currentUser.airport] ?? currentUser.airport;
  const roleLabel = ROLE_LABELS[currentUser.role];
  const accessLabel =
    currentUser.role === 'admin'
      ? 'Akses penuh ke seluruh modul'
      : currentUser.role === 'supervisor'
        ? 'Monitoring dan persetujuan operasional'
        : 'Operasional harian kargo dan tracking';

  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setPasswordForm({ current: '', next: '', confirm: '' });
    setPasswordError('');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const account = LOGIN_ACCOUNTS.find((item) => item.email === currentUser.email);

    if (!passwordForm.current.trim() || !passwordForm.next.trim() || !passwordForm.confirm.trim()) {
      setPasswordError('Semua kolom password wajib diisi.');
      return;
    }

    if (account && passwordForm.current !== account.password) {
      setPasswordError('Kata sandi lama tidak sesuai.');
      return;
    }

    if (passwordForm.next.length < 8) {
      setPasswordError('Kata sandi baru minimal 8 karakter.');
      return;
    }

    if (passwordForm.next === passwordForm.current) {
      setPasswordError('Kata sandi baru harus berbeda dari kata sandi lama.');
      return;
    }

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError('Konfirmasi kata sandi baru tidak sama.');
      return;
    }

    setPasswordUpdated(true);
    closePasswordModal();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border ${cardBase}`}
      >
        <div className={`flex items-center gap-2 border-b px-5 py-4 ${dividerCls}`}>
          <User size={16} className="text-blue-500" />
          <h3 className={labelCls}>Profil Pengguna</h3>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 shadow">
              <span className="text-white" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {currentUser.initials}
              </span>
            </div>
            <div>
              <p className={labelCls} style={{ fontWeight: 600 }}>
                {currentUser.name}
              </p>
              <p className={subCls} style={{ fontSize: '0.875rem' }}>
                {roleLabel} | {airportLabel}
              </p>
              <p className={subCls} style={{ fontSize: '0.8125rem' }}>
                {currentUser.email}
              </p>
            </div>
          </div>
          <div className={`grid grid-cols-2 gap-4 border-t pt-4 ${dividerCls}`}>
            {[
              { label: 'Nama Lengkap', value: currentUser.name },
              { label: 'Role Akses', value: roleLabel },
              { label: 'Bandara Tugas', value: airportLabel },
              { label: 'Hak Akses', value: accessLabel },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className={subCls} style={{ fontSize: '0.75rem' }}>
                  {label}
                </p>
                <p className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-xl border ${cardBase}`}
      >
        <div className={`flex items-center gap-2 border-b px-5 py-4 ${dividerCls}`}>
          <Sun size={16} className="text-blue-500" />
          <h3 className={labelCls}>Tampilan</h3>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                {isDark ? <Moon size={16} className={labelCls} /> : <Sun size={16} className={labelCls} />}
              </div>
              <div>
                <p className={labelCls} style={{ fontWeight: 500 }}>
                  Mode Gelap
                </p>
                <p className={subCls} style={{ fontSize: '0.8125rem' }}>
                  Ubah tema tampilan menjadi mode gelap untuk penggunaan di area redup
                </p>
              </div>
            </div>
            <ToggleSwitch checked={isDark} isDark={isDark} onChange={toggleDark} />
          </div>

          <div className={`border-t ${dividerCls}`} />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <Globe size={16} className={labelCls} />
              </div>
              <div>
                <p className={labelCls} style={{ fontWeight: 500 }}>
                  Bahasa
                </p>
                <p className={subCls} style={{ fontSize: '0.8125rem' }}>
                  Bahasa Indonesia (ID)
                </p>
              </div>
            </div>
            <select
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                isDark
                  ? 'border-slate-600 bg-slate-700 text-slate-200'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <option>Bahasa Indonesia</option>
              <option>English</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-xl border ${cardBase}`}
      >
        <div className={`flex items-center gap-2 border-b px-5 py-4 ${dividerCls}`}>
          <Bell size={16} className="text-blue-500" />
          <h3 className={labelCls}>Notifikasi</h3>
        </div>
        <div className="space-y-4 p-5">
          {[
            { key: 'email' as const, label: 'Notifikasi Email', desc: 'Terima ringkasan harian via email' },
            { key: 'delay' as const, label: 'Peringatan Penerbangan Delay', desc: 'Notifikasi saat ada penerbangan terlambat' },
            { key: 'arrived' as const, label: 'Notifikasi Kargo Tiba', desc: 'Notifikasi saat kargo berhasil tiba di tujuan' },
            { key: 'system' as const, label: 'Notifikasi Sistem', desc: 'Pemeliharaan dan pembaruan sistem' },
          ].map((item, index) => (
            <div key={item.key}>
              {index > 0 && <div className={`mb-4 border-t ${dividerCls}`} />}
              <div className="flex items-center justify-between">
                <div>
                  <p className={labelCls} style={{ fontWeight: 500 }}>
                    {item.label}
                  </p>
                  <p className={subCls} style={{ fontSize: '0.8125rem' }}>
                    {item.desc}
                  </p>
                </div>
                <ToggleSwitch
                  checked={notifications[item.key]}
                  isDark={isDark}
                  onChange={() =>
                    setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-xl border ${cardBase}`}
      >
        <div className={`flex items-center gap-2 border-b px-5 py-4 ${dividerCls}`}>
          <Shield size={16} className="text-blue-500" />
          <h3 className={labelCls}>Keamanan</h3>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className={labelCls} style={{ fontWeight: 500 }}>
                Ubah Kata Sandi
              </p>
              <p className={subCls} style={{ fontSize: '0.8125rem' }}>
                Terakhir diubah: {passwordUpdated ? 'Baru saja' : '3 bulan lalu'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              className={`rounded-lg border px-4 py-2 transition-colors ${
                isDark
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              style={{ fontSize: '0.875rem' }}
            >
              Ubah
            </button>
          </div>
          <div className={`border-t ${dividerCls}`} />
          <div className="flex items-center justify-between">
            <div>
              <p className={labelCls} style={{ fontWeight: 500 }}>
                Autentikasi Dua Faktor
              </p>
              <p className={subCls} style={{ fontSize: '0.8125rem' }}>
                Keamanan tambahan untuk akun Anda
              </p>
            </div>
            <ToggleSwitch checked={true} isDark={isDark} onChange={() => {}} />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-xl border ${cardBase}`}
      >
        <div className={`flex items-center gap-2 border-b px-5 py-4 ${dividerCls}`}>
          <Info size={16} className="text-blue-500" />
          <h3 className={labelCls}>Tentang Sistem</h3>
        </div>
        <div className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow">
              <AeroTrackIcon size={18} className="text-white" />
            </div>
            <div>
              <p className={labelCls} style={{ fontWeight: 700 }}>
                Aero Track
              </p>
              <p className={subCls} style={{ fontSize: '0.8125rem' }}>
                Sistem Pelacakan Kargo Udara
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Versi', value: 'v2.4.1' },
              { label: 'Pembaruan', value: '12 Apr 2026' },
              { label: 'Server', value: 'CGK-NODE-01' },
              { label: 'Uptime', value: '99.98%' },
            ].map(({ label, value }) => (
              <div
                key={label}
                className={`rounded-lg p-3 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}
              >
                <p className={subCls} style={{ fontSize: '0.75rem' }}>
                  {label}
                </p>
                <p className={labelCls} style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {passwordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(5px)' }}
          onClick={closePasswordModal}
        >
          <div
            className={`w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl ${cardBase}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between border-b px-5 py-4 ${dividerCls}`}>
              <div>
                <h3 className={labelCls} style={{ fontSize: '1rem', fontWeight: 700 }}>
                  Ubah Kata Sandi
                </h3>
                <p className={subCls} style={{ fontSize: '0.8125rem' }}>
                  Gunakan kata sandi baru minimal 8 karakter.
                </p>
              </div>
              <button
                type="button"
                onClick={closePasswordModal}
                className={`rounded-xl p-2 transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 p-5">
              {[
                { key: 'current' as const, label: 'Kata Sandi Lama' },
                { key: 'next' as const, label: 'Kata Sandi Baru' },
                { key: 'confirm' as const, label: 'Konfirmasi Kata Sandi Baru' },
              ].map((field) => (
                <div key={field.key}>
                  <label className={labelCls} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm[field.key]}
                    onChange={(e) => {
                      setPasswordForm((prev) => ({ ...prev, [field.key]: e.target.value }));
                      setPasswordError('');
                    }}
                    className={`mt-1 w-full rounded-xl border px-3 py-2.5 outline-none transition-colors focus:border-blue-500 ${
                      isDark
                        ? 'border-slate-600 bg-slate-700 text-slate-200 placeholder-slate-500'
                        : 'border-slate-300 bg-white text-slate-800 placeholder-slate-400'
                    }`}
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>
              ))}

              {passwordError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300" style={{ fontSize: '0.8125rem' }}>
                  {passwordError}
                </p>
              )}

              <div className={`flex gap-3 border-t pt-4 ${dividerCls}`}>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className={`flex-1 rounded-xl border px-4 py-2.5 transition-colors ${
                    isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                  style={{ fontSize: '0.875rem', fontWeight: 500 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white transition-colors hover:bg-blue-700"
                  style={{ fontSize: '0.875rem', fontWeight: 600 }}
                >
                  <Save size={15} />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
