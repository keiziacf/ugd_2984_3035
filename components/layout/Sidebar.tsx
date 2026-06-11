'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Package,
  Plane,
  BarChart2,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { NAV_ITEMS_BY_ROLE } from '@/lib/permissions';
import { AeroTrackIcon } from '../icons/AeroTrackLogo';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Search,
  Package,
  Plane,
  BarChart2,
  Users,
  Settings,
};

export function Sidebar() {
  const {
    sidebarCollapsed,
    toggleSidebar,
    isDark,
    currentUser,
    logout,
    startNavigationLoading,
  } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  function navigateTo(path: string, message = 'Membuka halaman...') {
    if (pathname !== path) {
      startNavigationLoading(message);
    }
    router.push(path);
  }

  function handleLogout() {
    startNavigationLoading('Keluar dari sistem...');
    logout();
    router.replace('/login');
  }

  const sidebarBg = isDark ? 'bg-[#061526]' : 'bg-[#0B2447]';
  const navItems = NAV_ITEMS_BY_ROLE[currentUser.role];

  return (
    <div
      className={`${sidebarBg} z-20 flex h-screen flex-shrink-0 flex-col border-r border-white/5 transition-all duration-300 ease-in-out`}
      style={{ width: sidebarCollapsed ? 88 : 256 }}
    >
      <div
        className={`relative flex flex-shrink-0 border-b border-white/10 ${
          sidebarCollapsed
            ? 'h-20 items-center justify-center'
            : 'h-16 items-center px-4'
        }`}
      >
        <Link
          href="/"
          className={`flex min-w-0 items-center ${
            sidebarCollapsed ? 'justify-center' : 'gap-3 overflow-hidden pr-10'
          }`}
          title={sidebarCollapsed ? 'Aero Track' : undefined}
        >
          <div
            className={`flex flex-shrink-0 items-center justify-center bg-blue-500 shadow-lg transition-all ${
              sidebarCollapsed ? 'h-10 w-10 rounded-xl' : 'h-8 w-8 rounded-lg'
            }`}
          >
            <AeroTrackIcon size={sidebarCollapsed ? 18 : 16} className="text-white" />
          </div>
          <span
            className="overflow-hidden whitespace-nowrap text-white transition-all duration-300 ease-in-out"
            style={{ maxWidth: sidebarCollapsed ? 0 : 160, opacity: sidebarCollapsed ? 0 : 1 }}
          >
            <span className="block truncate" style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
              Aero Track
            </span>
          </span>
        </Link>
        <button
          onClick={toggleSidebar}
          className={`text-slate-400 transition-colors hover:bg-white/10 hover:text-white ${
            sidebarCollapsed
              ? 'absolute right-1 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md'
              : 'absolute right-3 top-1/2 rounded-lg p-1.5 -translate-y-1/2'
          }`}
          title={sidebarCollapsed ? 'Perluas menu' : 'Kecilkan menu'}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-x-hidden overflow-y-auto px-2 py-2">
        {!sidebarCollapsed && (
          <p
            className="px-3 pb-1 pt-1"
            style={{
              fontSize: '0.625rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: '#475569',
              textTransform: 'uppercase',
            }}
          >
            Menu Navigasi
          </p>
        )}

        {navItems.map((item) => {
          const isActive =
            pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          const IconComponent = ICON_MAP[item.icon];

          return (
            <Link
              key={item.path}
              href={item.path}
              title={sidebarCollapsed ? item.label : undefined}
              className={`group relative flex items-center rounded-lg py-2.5 transition-all duration-150 ${
                sidebarCollapsed ? 'justify-center px-2' : 'gap-2.5 px-3'
              } ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-white/8 hover:text-slate-200'
              }`}
            >
              <IconComponent size={19} className="flex-shrink-0" />
              <span
                className="overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out"
                style={{
                  maxWidth: sidebarCollapsed ? 0 : 192,
                  opacity: sidebarCollapsed ? 0 : 1,
                  fontSize: '0.8125rem',
                }}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute right-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-l bg-blue-300" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 border-t border-white/10" />

      <div className="flex-shrink-0 px-2 pb-3">
        <button
          onClick={handleLogout}
          className={`flex w-full items-center rounded-lg py-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 ${
            sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
          }`}
          title={sidebarCollapsed ? 'Keluar' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span
            className="overflow-hidden whitespace-nowrap transition-all duration-300"
            style={{
              maxWidth: sidebarCollapsed ? 0 : 160,
              opacity: sidebarCollapsed ? 0 : 1,
              fontSize: '0.875rem',
            }}
          >
            Keluar
          </span>
        </button>
      </div>
    </div>
  );
}
