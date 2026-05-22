'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  CRUD_DISABLED_MESSAGE,
  USER_CRUD_DISABLED,
} from '@/lib/feature-flags';
import { users as initialUsers } from '@/lib/mock-data';

type RoleFilter = 'all' | 'admin' | 'supervisor' | 'operator';
type StatusFilter = 'all' | 'active' | 'inactive';

const ROLE_CONFIG: Record<Exclude<RoleFilter, 'all'>, { label: string; cls: string; icon: LucideIcon }> = {
  admin: {
    label: 'Admin',
    cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    icon: Shield,
  },
  supervisor: {
    label: 'Supervisor',
    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    icon: UserCheck,
  },
  operator: {
    label: 'Operator',
    cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    icon: UserIcon,
  },
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-orange-500',
];

export function UsersPage() {
  const { isDark } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const crudDisabled = USER_CRUD_DISABLED;
  const [userRows, setUserRows] = useState(initialUsers);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 2500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const validRoles: RoleFilter[] = ['all', 'admin', 'supervisor', 'operator'];
  const validStatuses: StatusFilter[] = ['all', 'active', 'inactive'];
  const requestedRole = (searchParams.get('role') as RoleFilter | null) ?? 'all';
  const requestedStatus = (searchParams.get('status') as StatusFilter | null) ?? 'all';
  const roleFilter = validRoles.includes(requestedRole) ? requestedRole : 'all';
  const statusFilter = validStatuses.includes(requestedStatus) ? requestedStatus : 'all';
  const searchQuery = searchParams.get('q') ?? '';

  const cardBase = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

  const filtered = userRows.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.airport.toLowerCase().includes(q);
    return matchRole && matchStatus && matchSearch;
  });

  const counts = {
    all: userRows.length,
    admin: userRows.filter((u) => u.role === 'admin').length,
    supervisor: userRows.filter((u) => u.role === 'supervisor').length,
    operator: userRows.filter((u) => u.role === 'operator').length,
  };

  const activeCount = userRows.filter((u) => u.status === 'active').length;
  const inactiveCount = userRows.filter((u) => u.status === 'inactive').length;

  function updateQuery(next: { role?: RoleFilter; status?: StatusFilter; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.role !== undefined) {
      if (next.role !== 'all') params.set('role', next.role);
      else params.delete('role');
    }

    if (next.status !== undefined) {
      if (next.status !== 'all') params.set('status', next.status);
      else params.delete('status');
    }

    if (next.q !== undefined) {
      if (next.q.trim()) params.set('q', next.q);
      else params.delete('q');
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleEdit(name: string) {
    if (crudDisabled) {
      setToast(CRUD_DISABLED_MESSAGE);
      return;
    }
    updateQuery({ q: name });
    setToast(`Mode edit dibuka untuk ${name}.`);
  }

  function toggleUserStatus(userId: number) {
    if (crudDisabled) {
      setToast(CRUD_DISABLED_MESSAGE);
      return;
    }
    setUserRows((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )
    );

    const user = userRows.find((item) => item.id === userId);
    if (user) {
      setToast(
        user.status === 'active'
          ? `${user.name} berhasil dinonaktifkan.`
          : `${user.name} berhasil diaktifkan kembali.`
      );
    }
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed left-1/2 top-5 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700 shadow-lg"
          >
            <Info size={15} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: 'Total Pengguna', value: userRows.length, icon: Users, color: 'text-blue-600', bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50' },
          { label: 'Admin', value: counts.admin, icon: Shield, color: 'text-purple-600', bg: isDark ? 'bg-purple-900/30' : 'bg-purple-50' },
          { label: 'Supervisor', value: counts.supervisor, icon: UserCheck, color: 'text-blue-600', bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50' },
          { label: 'Pengguna Aktif', value: activeCount, icon: CheckCircle2, color: 'text-green-600', bg: isDark ? 'bg-green-900/30' : 'bg-green-50' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-xl border p-4 ${cardBase}`}
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-2.5 ${card.bg}`}>
                <card.icon size={20} className={card.color} />
              </div>
              <div>
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                  {card.label}
                </p>
                <p className={isDark ? 'text-white' : 'text-slate-900'} style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>
                  {card.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-xl border ${cardBase}`}
      >
        <div className={`border-b p-5 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className={isDark ? 'text-slate-200' : 'text-slate-800'}>Daftar Pengguna Sistem</h3>
              <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.8125rem' }}>
                {filtered.length} dari {userRows.length} pengguna
              </p>
            </div>
            <div className="relative">
              <Search size={15} className={isDark ? 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-500' : 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'} />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => updateQuery({ q: e.target.value })}
                className={`rounded-lg border py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                  isDark
                    ? 'border-slate-600 bg-slate-700 text-slate-200 placeholder-slate-500'
                    : 'border-slate-200 bg-white text-slate-700 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                { key: 'all', label: 'Semua' },
                { key: 'admin', label: 'Admin' },
                { key: 'supervisor', label: 'Supervisor' },
                { key: 'operator', label: 'Operator' },
              ] as { key: RoleFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => updateQuery({ role: tab.key })}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors ${
                  roleFilter === tab.key
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : isDark
                    ? 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
                style={{ fontSize: '0.8125rem' }}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 ${
                    roleFilter === tab.key ? 'bg-white/20' : isDark ? 'bg-slate-700' : 'bg-slate-100'
                  }`}
                  style={{ fontSize: '0.6875rem', fontWeight: 600 }}
                >
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                { key: 'all', label: 'Semua Status', count: userRows.length },
                { key: 'active', label: 'Aktif', count: activeCount },
                { key: 'inactive', label: 'Tidak Aktif', count: inactiveCount },
              ] as { key: StatusFilter; label: string; count: number }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => updateQuery({ status: tab.key })}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors ${
                  statusFilter === tab.key
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : isDark
                    ? 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
                style={{ fontSize: '0.8125rem' }}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 ${
                    statusFilter === tab.key ? 'bg-white/20' : isDark ? 'bg-slate-700' : 'bg-slate-100'
                  }`}
                  style={{ fontSize: '0.6875rem', fontWeight: 600 }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-700 bg-slate-800/60' : 'border-slate-100 bg-slate-50'}`}>
                {['Pengguna', 'Email', 'Role', 'Bandara', 'Login Terakhir', 'Status', 'Aksi'].map((h) => (
                  <th
                    key={h}
                    className={isDark ? 'px-4 py-3 text-left text-slate-400' : 'px-4 py-3 text-left text-slate-500'}
                    style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => {
                const roleInfo = ROLE_CONFIG[user.role];
                const RoleIcon = roleInfo.icon;
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.04 }}
                    className={`border-b transition-colors last:border-0 ${
                      isDark ? 'border-slate-700/50 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-blue-50/20'
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${AVATAR_COLORS[(user.id - 1) % AVATAR_COLORS.length]}`}>
                          <span className="text-white" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            {getInitials(user.name)}
                          </span>
                        </div>
                        <span className={isDark ? 'text-slate-200' : 'text-slate-800'} style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                        {user.email}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${roleInfo.cls}`} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        <RoleIcon size={12} />
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={isDark ? 'rounded bg-slate-700 px-2 py-0.5 font-mono text-slate-300' : 'rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-600'} style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                        {user.airport}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                        {user.lastLogin}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                        }`}
                        style={{ fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        {user.status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user.name)}
                          disabled={crudDisabled}
                          title={crudDisabled ? CRUD_DISABLED_MESSAGE : 'Edit pengguna'}
                          className={`rounded-lg border px-2.5 py-1 transition-colors ${
                            crudDisabled
                              ? 'cursor-not-allowed border-slate-200 text-slate-300 dark:border-slate-700 dark:text-slate-600'
                              : 'border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30'
                          }`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          Edit
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            disabled={crudDisabled}
                            title={crudDisabled ? CRUD_DISABLED_MESSAGE : user.status === 'active' ? 'Nonaktifkan pengguna' : 'Aktifkan pengguna'}
                            className={`rounded-lg border px-2.5 py-1 transition-colors ${
                              crudDisabled
                                ? 'cursor-not-allowed border-slate-200 text-slate-300 dark:border-slate-700 dark:text-slate-600'
                                : 'border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30'
                            }`}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {user.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className={isDark ? 'py-12 text-center text-slate-500' : 'py-12 text-center text-slate-400'}>
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p>Tidak ada pengguna yang sesuai filter</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
