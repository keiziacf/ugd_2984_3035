'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  Edit2,
  Filter,
  Info,
  Plus,
  RefreshCw,
  Save,
  Search,
  Shield,
  Trash2,
  User as UserIcon,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { users as initialUsers, type User } from '@/lib/mock-data';

type RoleFilter = 'all' | 'admin' | 'supervisor' | 'operator';
type StatusFilter = 'all' | 'active' | 'inactive';
type DateFilter = 'all' | '3d' | '7d' | '30d';
type UserFormMode = 'create' | 'edit';

type UserFormState = {
  name: string;
  email: string;
  password: string;
  role: User['role'];
  airport: string;
  status: User['status'];
};

type UserFormErrors = Partial<Record<keyof UserFormState, string>>;

const EMPTY_FORM: UserFormState = {
  name: '',
  email: '',
  password: '',
  role: 'operator',
  airport: 'CGK',
  status: 'active',
};

const AIRPORT_OPTIONS = ['HQ', 'CGK', 'SUB', 'DPS', 'KNO', 'UPG', 'BPN', 'SOC', 'JOG', 'PLM', 'SRG'];

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

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function isSystemAdmin(user: User) {
  return user.role === 'admin' && user.email === 'admin@gmail.com';
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getNowLoginLabel() {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  }).format(new Date()) + ' WIB';
}

function parseLoginDate(value: string) {
  const match = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4}),\s+(\d{2})[:.](\d{2})/);
  if (!match) return null;

  const monthMap: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    Mei: 4,
    Jun: 5,
    Jul: 6,
    Agt: 7,
    Sep: 8,
    Okt: 9,
    Nov: 10,
    Des: 11,
  };

  const [, day, month, year, hour, minute] = match;
  const monthIndex = monthMap[month];
  if (monthIndex === undefined) return null;

  return new Date(Number(year), monthIndex, Number(day), Number(hour), Number(minute));
}

export function UsersPage() {
  const { isDark } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [userRows, setUserRows] = useState(initialUsers);
  const [toast, setToast] = useState('');
  const [modalMode, setModalMode] = useState<UserFormMode | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<UserFormErrors>({});

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const validRoles: RoleFilter[] = ['all', 'admin', 'supervisor', 'operator'];
  const validStatuses: StatusFilter[] = ['all', 'active', 'inactive'];
  const validDateFilters: DateFilter[] = ['all', '3d', '7d', '30d'];
  const requestedRole = (searchParams.get('role') as RoleFilter | null) ?? 'all';
  const requestedStatus = (searchParams.get('status') as StatusFilter | null) ?? 'all';
  const requestedDate = (searchParams.get('periode') as DateFilter | null) ?? 'all';
  const roleFilter = validRoles.includes(requestedRole) ? requestedRole : 'all';
  const statusFilter = validStatuses.includes(requestedStatus) ? requestedStatus : 'all';
  const dateFilter = validDateFilters.includes(requestedDate) ? requestedDate : 'all';
  const searchQuery = searchParams.get('q') ?? '';

  const visibleUserRows = useMemo(
    () => userRows.filter((user) => !isSystemAdmin(user)),
    [userRows]
  );

  const latestLoginDate = useMemo(() => {
    const times = visibleUserRows
      .map((user) => parseLoginDate(user.lastLogin)?.getTime())
      .filter((time): time is number => typeof time === 'number' && Number.isFinite(time));
    return times.length ? Math.max(...times) : Date.now();
  }, [visibleUserRows]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const rangeDays = dateFilter === '3d' ? 3 : dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : null;
    const minLoginTime = rangeDays ? latestLoginDate - (rangeDays - 1) * 24 * 60 * 60 * 1000 : null;

    return visibleUserRows.filter((user) => {
      const matchRole = roleFilter === 'all' || user.role === roleFilter;
      const matchStatus = statusFilter === 'all' || user.status === statusFilter;
      const loginTime = parseLoginDate(user.lastLogin)?.getTime();
      const matchDate =
        minLoginTime === null ||
        (typeof loginTime === 'number' && loginTime >= minLoginTime && loginTime <= latestLoginDate);
      const matchSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.airport.toLowerCase().includes(q);
      return matchRole && matchStatus && matchDate && matchSearch;
    });
  }, [dateFilter, latestLoginDate, roleFilter, searchQuery, statusFilter, visibleUserRows]);

  const counts = {
    all: visibleUserRows.length,
    admin: visibleUserRows.filter((user) => user.role === 'admin').length,
    supervisor: visibleUserRows.filter((user) => user.role === 'supervisor').length,
    operator: visibleUserRows.filter((user) => user.role === 'operator').length,
    active: visibleUserRows.filter((user) => user.status === 'active').length,
    inactive: visibleUserRows.filter((user) => user.status === 'inactive').length,
  };

  const cardBase = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

  function updateQuery(next: { role?: RoleFilter; status?: StatusFilter; date?: DateFilter; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.role !== undefined) {
      if (next.role !== 'all') params.set('role', next.role);
      else params.delete('role');
    }

    if (next.status !== undefined) {
      if (next.status !== 'all') params.set('status', next.status);
      else params.delete('status');
    }

    if (next.date !== undefined) {
      if (next.date !== 'all') params.set('periode', next.date);
      else params.delete('periode');
    }

    if (next.q !== undefined) {
      if (next.q.trim()) params.set('q', next.q);
      else params.delete('q');
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function setFormValue<K extends keyof UserFormState>(key: K, value: UserFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  function openCreateModal() {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalMode('create');
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      airport: user.airport,
      status: user.status,
    });
    setErrors({});
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function validateForm() {
    const nextErrors: UserFormErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Nama wajib diisi.';
    else if (form.name.trim().length < 8) nextErrors.name = 'Nama minimal 8 karakter.';

    if (!form.email.trim()) nextErrors.email = 'Email wajib diisi.';
    else if (!isValidEmail(form.email)) nextErrors.email = 'Format email tidak valid.';
    else {
      const duplicate = userRows.some(
        (user) =>
          user.email.toLowerCase() === form.email.trim().toLowerCase() &&
          user.id !== editingUser?.id
      );
      if (duplicate) nextErrors.email = 'Email sudah digunakan pengguna lain.';
    }

    if (!form.password.trim()) nextErrors.password = 'Password wajib diisi.';
    else if (form.password.trim().length < 8) nextErrors.password = 'Password minimal 8 karakter.';

    if (!form.airport.trim()) nextErrors.airport = 'Bandara wajib dipilih.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function submitUserForm(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    if (modalMode === 'create') {
      const nextUser: User = {
        id: Math.max(0, ...userRows.map((user) => user.id)) + 1,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password.trim(),
        role: form.role,
        airport: form.airport,
        lastLogin: getNowLoginLabel(),
        status: form.status,
      };
      setUserRows((prev) => [nextUser, ...prev]);
      setToast(`${nextUser.name} berhasil ditambahkan.`);
    } else if (editingUser) {
      setUserRows((prev) =>
        prev.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password.trim(),
                role: form.role,
                airport: form.airport,
                status: form.status,
              }
            : user
        )
      );
      setToast(`${form.name.trim()} berhasil diperbarui.`);
    }

    closeModal();
  }

  function deleteUser(user: User) {
    if (window.confirm(`Hapus pengguna ${user.name}?`)) {
      setUserRows((prev) => prev.filter((item) => item.id !== user.id));
      setToast(`${user.name} berhasil dihapus.`);
    }
  }

  function toggleUserStatus(user: User) {
    setUserRows((prev) =>
      prev.map((item) =>
        item.id === user.id
          ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' }
          : item
      )
    );
    setToast(
      user.status === 'active'
        ? `${user.name} berhasil dinonaktifkan.`
        : `${user.name} berhasil diaktifkan.`
    );
  }

  const roleFilterOptions: { value: RoleFilter; label: string }[] = [
    { value: 'all', label: 'Semua Role' },
    { value: 'admin', label: 'Admin' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'operator', label: 'Operator' },
  ];

  const statusFilterOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Semua Status' },
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak Aktif' },
  ];

  const dateFilterOptions: { value: DateFilter; label: string }[] = [
    { value: 'all', label: 'Semua Tanggal' },
    { value: '3d', label: '3 Hari Terakhir' },
    { value: '7d', label: '7 Hari Terakhir' },
    { value: '30d', label: '30 Hari Terakhir' },
  ];

  return (
    <div className="space-y-5">
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

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? 'bg-blue-900/40' : 'bg-blue-50'}`}>
              <Users size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className={isDark ? 'text-white' : 'text-slate-900'} style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Manajemen Pengguna
            </h1>
          </div>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.875rem' }}>
            Kelola akun, role, password, dan status pengguna operasional.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm transition-colors hover:bg-blue-700"
          style={{ fontSize: '0.875rem', fontWeight: 600 }}
        >
          <Plus size={16} />
          Tambah Pengguna
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Total Pengguna', value: counts.all, icon: Users, color: 'text-blue-600', bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50', filter: { role: 'all' as RoleFilter, status: 'all' as StatusFilter } },
          { label: 'Admin', value: counts.admin, icon: Shield, color: 'text-purple-600', bg: isDark ? 'bg-purple-900/30' : 'bg-purple-50', filter: { role: 'admin' as RoleFilter } },
          { label: 'Supervisor', value: counts.supervisor, icon: UserCheck, color: 'text-blue-600', bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50', filter: { role: 'supervisor' as RoleFilter } },
          { label: 'Pengguna Aktif', value: counts.active, icon: CheckCircle2, color: 'text-green-600', bg: isDark ? 'bg-green-900/30' : 'bg-green-50', filter: { status: 'active' as StatusFilter } },
        ].map((card, i) => (
          <motion.button
            key={card.label}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => updateQuery(card.filter)}
            className={`rounded-xl border p-4 text-left transition-shadow hover:shadow-sm ${cardBase}`}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${card.bg}`}>
                <card.icon size={20} className={card.color} />
              </div>
              <div>
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                  {card.label}
                </p>
                <p className={isDark ? 'text-white' : 'text-slate-900'} style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>
                  {card.value}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className={`rounded-xl border p-4 ${cardBase}`}>
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Cari nama, email, atau bandara..."
              value={searchQuery}
              onChange={(e) => updateQuery({ q: e.target.value })}
              className={`w-full rounded-xl border py-2.5 pl-9 pr-4 outline-none transition-colors focus:border-blue-500 ${
                isDark
                  ? 'border-slate-600 bg-slate-700 text-slate-200 placeholder-slate-500'
                  : 'border-slate-300 bg-white text-slate-800 placeholder-slate-400'
              }`}
              style={{ fontSize: '0.875rem' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => updateQuery({ q: '' })}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <Filter size={13} className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
            <select
              value={roleFilter}
              onChange={(e) => updateQuery({ role: e.target.value as RoleFilter })}
              className={`rounded-xl border py-2.5 pl-8 pr-4 outline-none transition-colors ${
                isDark
                  ? 'border-slate-600 bg-slate-700 text-slate-200'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
              style={{ fontSize: '0.875rem' }}
            >
              {roleFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => updateQuery({ status: e.target.value as StatusFilter })}
              className={`rounded-xl border px-3 py-2.5 outline-none transition-colors ${
                isDark
                  ? 'border-slate-600 bg-slate-700 text-slate-200'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
              style={{ fontSize: '0.875rem' }}
            >
              {statusFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => updateQuery({ date: e.target.value as DateFilter })}
              className={`rounded-xl border px-3 py-2.5 outline-none transition-colors ${
                isDark
                  ? 'border-slate-600 bg-slate-700 text-slate-200'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
              style={{ fontSize: '0.875rem' }}
            >
              {dateFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all') && (
            <button
              type="button"
              onClick={() => updateQuery({ q: '', role: 'all', status: 'all', date: 'all' })}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 transition-colors ${
                isDark ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-300 text-slate-500 hover:bg-slate-50'
              }`}
              style={{ fontSize: '0.8125rem' }}
            >
              <RefreshCw size={13} />
              Reset
            </button>
          )}
        </div>

        {filtered.length !== visibleUserRows.length && (
          <p className={`mt-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontSize: '0.8125rem' }}>
            Menampilkan <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{filtered.length}</strong> dari {visibleUserRows.length} pengguna
          </p>
        )}
      </div>

      <div className={`overflow-hidden rounded-xl border ${cardBase}`}>
        <div className={`flex flex-col gap-1 border-b px-5 py-4 ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-white'}`}>
          <h3 className={isDark ? 'text-slate-200' : 'text-slate-800'} style={{ fontSize: '1rem', fontWeight: 600 }}>
            Daftar Pengguna Sistem
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-100 bg-slate-50'}`}>
                {['Pengguna', 'Email', 'Password', 'Role', 'Bandara', 'Login Terakhir', 'Status', 'Aksi'].map((heading) => (
                  <th
                    key={heading}
                    className={`px-4 py-3.5 text-left ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((user, i) => {
                  const roleInfo = ROLE_CONFIG[user.role];
                  const RoleIcon = roleInfo.icon;
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`border-b transition-colors last:border-0 ${
                        isDark ? 'border-slate-700/60 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-blue-50/20'
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${AVATAR_COLORS[(user.id - 1) % AVATAR_COLORS.length]}`}>
                            <span className="text-white" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                              {getInitials(user.name)}
                            </span>
                          </div>
                          <span className={isDark ? 'text-slate-200' : 'text-slate-800'} style={{ fontSize: '0.875rem', fontWeight: 600 }}>
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
                        <span className={isDark ? 'font-mono text-slate-400' : 'font-mono text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                          {user.password}
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
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(user)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400'
                          }`}
                          style={{ fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          {user.status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            title="Edit pengguna"
                            className={`rounded-lg p-2 transition-colors ${
                              isDark ? 'text-slate-400 hover:bg-blue-900/30 hover:text-blue-400' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteUser(user)}
                            title="Hapus pengguna"
                            className={`rounded-lg p-2 transition-colors ${
                              isDark ? 'text-slate-400 hover:bg-red-900/30 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'
                            }`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className={`flex flex-col items-center justify-center gap-3 py-16 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <Users size={24} />
              </div>
              <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>Tidak ada pengguna ditemukan</p>
              <p style={{ fontSize: '0.8125rem' }}>Coba ubah filter pencarian atau tambah pengguna baru</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(5px)' }}
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              className={`w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl ${cardBase}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`flex items-center justify-between border-b px-6 py-4 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isDark ? 'bg-blue-900/40' : 'bg-blue-50'}`}>
                    <Users size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className={isDark ? 'text-slate-100' : 'text-slate-800'} style={{ fontSize: '1.0625rem', fontWeight: 700 }}>
                    {modalMode === 'create' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className={`rounded-xl p-2 transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={submitUserForm} className="space-y-4 px-6 py-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <UserInput
                    label="Nama Pengguna"
                    value={form.name}
                    onChange={(value) => setFormValue('name', value)}
                    error={errors.name}
                    isDark={isDark}
                    placeholder="Nama lengkap pengguna"
                  />
                  <UserInput
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(value) => setFormValue('email', value)}
                    error={errors.email}
                    isDark={isDark}
                    placeholder="nama@email.com"
                  />
                  <UserInput
                    label="Password"
                    value={form.password}
                    onChange={(value) => setFormValue('password', value)}
                    error={errors.password}
                    isDark={isDark}
                    placeholder="Minimal 8 karakter"
                  />
                  <div>
                    <label className={isDark ? 'mb-1 block text-slate-300' : 'mb-1 block text-slate-600'} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.role}
                      onChange={(e) => setFormValue('role', e.target.value as User['role'])}
                      className={`w-full rounded-xl border px-3 py-2.5 outline-none transition-colors focus:border-blue-500 ${
                        isDark ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-slate-300 bg-white text-slate-800'
                      }`}
                      style={{ fontSize: '0.875rem' }}
                    >
                      <option value="operator">Operator</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className={isDark ? 'mb-1 block text-slate-300' : 'mb-1 block text-slate-600'} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Bandara <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.airport}
                      onChange={(e) => setFormValue('airport', e.target.value)}
                      className={`w-full rounded-xl border px-3 py-2.5 outline-none transition-colors focus:border-blue-500 ${
                        errors.airport
                          ? 'border-red-500'
                          : isDark
                          ? 'border-slate-600 bg-slate-700 text-slate-200'
                          : 'border-slate-300 bg-white text-slate-800'
                      }`}
                      style={{ fontSize: '0.875rem' }}
                    >
                      {AIRPORT_OPTIONS.map((airport) => (
                        <option key={airport} value={airport}>{airport}</option>
                      ))}
                    </select>
                    {errors.airport && <p className="mt-1 text-red-500 dark:text-red-400" style={{ fontSize: '0.75rem' }}>{errors.airport}</p>}
                  </div>
                  <div>
                    <label className={isDark ? 'mb-1 block text-slate-300' : 'mb-1 block text-slate-600'} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setFormValue('status', e.target.value as User['status'])}
                      className={`w-full rounded-xl border px-3 py-2.5 outline-none transition-colors focus:border-blue-500 ${
                        isDark ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-slate-300 bg-white text-slate-800'
                      }`}
                      style={{ fontSize: '0.875rem' }}
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                    </select>
                  </div>
                </div>

                <div className={`flex gap-3 border-t pt-4 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <button
                    type="button"
                    onClick={closeModal}
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
                    {modalMode === 'create' ? 'Tambah Pengguna' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserInput({
  label,
  type = 'text',
  value,
  onChange,
  error,
  isDark,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isDark: boolean;
  placeholder: string;
}) {
  return (
    <div>
      <label className={isDark ? 'mb-1 block text-slate-300' : 'mb-1 block text-slate-600'} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-3 py-2.5 outline-none transition-colors focus:border-blue-500 ${
          error
            ? 'border-red-500'
            : isDark
            ? 'border-slate-600 bg-slate-700 text-slate-200 placeholder-slate-500'
            : 'border-slate-300 bg-white text-slate-800 placeholder-slate-400'
        }`}
        style={{ fontSize: '0.875rem' }}
      />
      {error && <p className="mt-1 text-red-500 dark:text-red-400" style={{ fontSize: '0.75rem' }}>{error}</p>}
    </div>
  );
}
