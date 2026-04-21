'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Sun,
  Moon,
  ChevronRight,
  Wifi,
  ChevronDown,
  Settings,
  LogOut,
  Search,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ROLE_META } from '@/lib/permissions';

const PAGE_TITLES: Record<string, { title: string; breadcrumb: string[] }> = {
  '/': { title: 'Dashboard Operasional', breadcrumb: ['Dashboard'] },
  '/tracking': { title: 'Pelacakan AWB', breadcrumb: ['Dashboard', 'Pelacakan AWB'] },
  '/cargo': { title: 'Manajemen Kargo', breadcrumb: ['Dashboard', 'Manajemen Kargo'] },
  '/flights': { title: 'Manajemen Penerbangan', breadcrumb: ['Dashboard', 'Penerbangan'] },
  '/reports': { title: 'Laporan & Statistik', breadcrumb: ['Dashboard', 'Laporan'] },
  '/users': { title: 'Manajemen Pengguna', breadcrumb: ['Dashboard', 'Pengguna'] },
  '/settings': { title: 'Pengaturan', breadcrumb: ['Dashboard', 'Pengaturan'] },
};

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
};

const NOTIFICATIONS: Record<'admin' | 'supervisor' | 'operator', NotificationItem[]> = {
  admin: [
    {
      id: 'adm-1',
      title: '2 penerbangan terdeteksi delay',
      description: 'Buka monitor penerbangan untuk melihat detail operasional terbaru.',
      href: '/flights?status=delayed',
    },
    {
      id: 'adm-2',
      title: '1 pengguna masih nonaktif',
      description: 'Tinjau daftar pengguna dan status akun operasional hari ini.',
      href: '/users?status=inactive',
    },
    {
      id: 'adm-3',
      title: 'Kargo AT-2604120014 perlu verifikasi',
      description: 'Dokumen shipment masih menunggu tindak lanjut.',
      href: '/tracking/AT-2604120014',
    },
  ],
  supervisor: [
    {
      id: 'sup-1',
      title: 'Delay GA-238 menunggu review',
      description: 'Supervisor perlu memeriksa AWB AT-2604120012.',
      href: '/tracking/AT-2604120012',
    },
    {
      id: 'sup-2',
      title: 'Pemuatan GA-632 siap dikonfirmasi',
      description: 'Shipment AT-2604120003 sedang berada di tahap loaded.',
      href: '/tracking/AT-2604120003',
    },
    {
      id: 'sup-3',
      title: 'Laporan mingguan tersedia',
      description: 'Pantau performa tim dan tren kargo bandara Anda.',
      href: '/reports',
    },
  ],
  operator: [
    {
      id: 'opr-1',
      title: 'Sortasi AT-2604120012 belum selesai',
      description: 'Lanjutkan update tracking untuk shipment yang sedang diproses.',
      href: '/tracking/AT-2604120012',
    },
    {
      id: 'opr-2',
      title: 'Dokumen QG-973 perlu diperiksa',
      description: 'Buka detail AWB AT-2604120014 untuk tindak lanjut.',
      href: '/tracking/AT-2604120014',
    },
    {
      id: 'opr-3',
      title: 'Tracking kargo tersedia real-time',
      description: 'Gunakan halaman tracking untuk pencarian AWB cepat.',
      href: '/tracking',
    },
  ],
};

export function TopBar() {
  const { isDark, toggleDark, currentUser, logout } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const routeKey = pathname.split('/').slice(0, 2).join('/') || '/';
  const pageInfo = PAGE_TITLES[routeKey] || PAGE_TITLES['/'];
  const roleMeta = ROLE_META[currentUser.role];
  const notifications = useMemo(() => NOTIFICATIONS[currentUser.role], [currentUser.role]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  function navigateTo(href: string) {
    setNotificationsOpen(false);
    setProfileOpen(false);
    router.push(href);
  }

  function handleLogout() {
    logout();
    setNotificationsOpen(false);
    setProfileOpen(false);
    router.replace('/login');
  }

  return (
    <header
      className={`flex h-16 flex-shrink-0 items-center justify-between border-b px-6 transition-colors duration-200 ${
        isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
      }`}
    >
      <div>
        <nav className="mb-0.5 flex items-center gap-1">
          {pageInfo.breadcrumb.map((crumb, i) => (
            <span key={crumb + i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className={isDark ? 'text-slate-500' : 'text-slate-400'} />}
              <span
                className={`${
                  i === pageInfo.breadcrumb.length - 1
                    ? isDark
                      ? 'text-slate-300'
                      : 'text-slate-600'
                    : isDark
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
                style={{ fontSize: '0.75rem' }}
              >
                {crumb}
              </span>
            </span>
          ))}
        </nav>
        <h1 className={isDark ? 'text-white' : 'text-slate-800'} style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1 }}>
          {pageInfo.title}
        </h1>
      </div>

      <div ref={menuRef} className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigateTo('/settings')}
          className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 md:flex ${
            isDark ? 'bg-green-900/30' : 'bg-green-50'
          }`}
        >
          <Wifi size={12} className="text-green-500" />
          <span className="text-green-600" style={{ fontSize: '0.6875rem', fontWeight: 500 }}>
            Sistem Online
          </span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            className={`relative rounded-lg p-2 transition-colors ${
              isDark
                ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
            title="Notifikasi"
          >
            <Bell size={18} />
            {notifications.length > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />}
          </button>

          {notificationsOpen && (
            <div
              className={`absolute right-0 top-[calc(100%+10px)] z-30 w-[320px] overflow-hidden rounded-2xl border shadow-xl ${
                isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
              }`}
            >
              <div className={`flex items-center justify-between border-b px-4 py-3 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                <div>
                  <p className={isDark ? 'text-slate-200' : 'text-slate-800'} style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Notifikasi
                  </p>
                  <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.75rem' }}>
                    {notifications.length} update siap ditindaklanjuti
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-blue-600 transition-colors hover:text-blue-700"
                  style={{ fontSize: '0.75rem', fontWeight: 600 }}
                >
                  Tutup
                </button>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.href)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                      isDark ? 'hover:bg-slate-700/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                    <div className="min-w-0 flex-1">
                      <p className={isDark ? 'text-slate-200' : 'text-slate-800'} style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {item.title}
                      </p>
                      <p className={isDark ? 'text-slate-500' : 'text-slate-500'} style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                        {item.description}
                      </p>
                    </div>
                    <ExternalLink size={13} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={toggleDark}
          className={`rounded-lg p-2 transition-colors ${
            isDark
              ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
          title={isDark ? 'Mode Terang' : 'Mode Gelap'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className={isDark ? 'h-6 w-px bg-slate-700' : 'h-6 w-px bg-slate-200'} />

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotificationsOpen(false);
            }}
            className={`flex items-center gap-2 rounded-xl px-1.5 py-1 transition-colors ${
              isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
            }`}
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-sm"
              style={{ backgroundColor: roleMeta.color }}
            >
              <span className="text-white" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {currentUser.initials}
              </span>
            </div>
            <div className="hidden text-left sm:block">
              <div className="flex items-center gap-1.5">
                <p className={isDark ? 'text-slate-200' : 'text-slate-700'} style={{ fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.2 }}>
                  {currentUser.name}
                </p>
                <span
                  className={`rounded border px-1.5 py-0.5 ${roleMeta.bgClass} ${roleMeta.textClass} ${roleMeta.borderClass}`}
                  style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}
                >
                  {roleMeta.label}
                </span>
              </div>
              <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.6875rem' }}>
                {currentUser.airport} &bull; {currentUser.email.split('@')[0]}
              </p>
            </div>
            <ChevronDown size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
          </button>

          {profileOpen && (
            <div
              className={`absolute right-0 top-[calc(100%+10px)] z-30 w-[260px] overflow-hidden rounded-2xl border shadow-xl ${
                isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
              }`}
            >
              <div className={`border-b px-4 py-3 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                <p className={isDark ? 'text-slate-200' : 'text-slate-800'} style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {currentUser.name}
                </p>
                <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.75rem' }}>
                  {roleMeta.label} di {currentUser.airport}
                </p>
              </div>
              <div className="p-2">
                {[
                  { label: 'Pengaturan Akun', icon: Settings, href: '/settings' },
                  { label: 'Tracking AWB', icon: Search, href: '/tracking' },
                  {
                    label: currentUser.role === 'admin' ? 'Audit & Ringkasan' : 'Ringkasan Sistem',
                    icon: ShieldCheck,
                    href: currentUser.role === 'admin' ? '/users?role=operator' : '/',
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigateTo(item.href)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isDark ? 'hover:bg-slate-700/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <item.icon size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    <span className={isDark ? 'text-slate-200' : 'text-slate-700'} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      {item.label}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <LogOut size={16} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
