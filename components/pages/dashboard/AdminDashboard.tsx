'use client';

import { useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Users,
  Package,
  PlaneLanding,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ExternalLink,
  Shield,
  Server,
  Globe,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useApp } from '@/context/AppContext';
import { todayShipmentsList, weeklyStats, recentActivity, users, flights } from '@/lib/mock-data';
import { ROLE_META } from '@/lib/permissions';

const ACTIVITY_DOT: Record<string, string> = {
  arrived: 'bg-green-500',
  departed: 'bg-blue-500',
  loaded: 'bg-amber-500',
  sortation: 'bg-purple-500',
  received: 'bg-slate-400',
};

const usersByRole = {
  admin: users.filter((u) => u.role === 'admin').length,
  supervisor: users.filter((u) => u.role === 'supervisor').length,
  operator: users.filter((u) => u.role === 'operator').length,
};

const activeUsers = users.filter((u) => u.status === 'active').length;
const inactiveUsers = users.filter((u) => u.status === 'inactive').length;

const airportActivity = [
  { airport: 'CGK', cargo: 89, flights: 6 },
  { airport: 'SUB', cargo: 34, flights: 3 },
  { airport: 'DPS', cargo: 28, flights: 2 },
  { airport: 'UPG', cargo: 21, flights: 2 },
  { airport: 'KNO', cargo: 18, flights: 2 },
  { airport: 'BPN', cargo: 15, flights: 2 },
];

export function AdminDashboard() {
  const { isDark } = useApp();
  const router = useRouter();
  const uid = useId().replace(/:/g, '');
  const gradShipped = `${uid}-admin-shipped`;
  const gradArrived = `${uid}-admin-arrived`;

  const cardBase = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tickColor = isDark ? '#94a3b8' : '#64748b';

  const arrivedCount = todayShipmentsList.filter((s) => s.currentStatus === 'Arrived').length;
  const delayedFlights = flights.filter((f) => f.status === 'delayed').length;
  const systemStats = [
    {
      label: 'Total Pengguna Aktif',
      value: activeUsers,
      sub: `${inactiveUsers} tidak aktif`,
      icon: Users,
      color: 'violet',
      trend: `${users.length} total akun`,
      trendUp: true,
      link: '/users?status=active',
    },
    {
      label: 'Total Kargo Hari Ini',
      value: 248,
      sub: `${todayShipmentsList.length} kargo aktif`,
      icon: Package,
      color: 'blue',
      trend: '+12% dari kemarin',
      trendUp: true,
      link: '/cargo',
    },
    {
      label: 'Kargo Tiba',
      value: arrivedCount,
      sub: `dari ${todayShipmentsList.length} kargo`,
      icon: PlaneLanding,
      color: 'green',
      trend: 'Selesai hari ini',
      trendUp: true,
      link: '/cargo?status=Arrived',
    },
    {
      label: 'Penerbangan Delay',
      value: delayedFlights,
      sub: `dari ${flights.length} penerbangan`,
      icon: AlertTriangle,
      color: 'amber',
      trend: 'Perlu perhatian',
      trendUp: false,
      link: '/flights?status=delayed',
    },
  ];

  const iconBg: Record<string, string> = {
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div className="space-y-6">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {systemStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className={`rounded-xl border p-5 ${cardBase} ${stat.link ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={() => stat.link && router.push(stat.link)}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontSize: '0.8125rem' }}>
                  {stat.label}
                </p>
                <p className={`mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: 1 }}>
                  {stat.value}
                </p>
                <p className={`mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontSize: '0.75rem' }}>
                  {stat.sub}
                </p>
              </div>
              <div className={`p-2.5 rounded-lg ${iconBg[stat.color]}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center gap-1.5`}>
              <ArrowUpRight size={13} className={stat.trendUp ? 'text-green-500' : 'text-amber-500'} style={{ transform: stat.trendUp ? '' : 'rotate(90deg)' }} />
              <span className={stat.trendUp ? 'text-green-600' : 'text-amber-600'} style={{ fontSize: '0.75rem' }}>
                {stat.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Chart + User Management */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Weekly Cargo Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className={`xl:col-span-8 rounded-xl border p-5 ${cardBase}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Tren Kargo Mingguan</h3>
              <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontSize: '0.8125rem' }}>
                Semua bandara · 6 Apr — 12 Apr 2026
              </p>
            </div>
            <Link href="/reports" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors" style={{ fontSize: '0.8125rem' }}>
              Lihat Laporan <ExternalLink size={12} />
            </Link>
          </div>
          <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
            <defs>
              <linearGradient id={gradShipped} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a56db" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1a56db" stopOpacity={0} />
              </linearGradient>
              <linearGradient id={gradArrived} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
          </svg>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyStats} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: 8, fontSize: 13, color: isDark ? '#e2e8f0' : '#1e293b' }} />
              <Legend wrapperStyle={{ fontSize: 12, color: tickColor, paddingTop: 8 }} />
              <Area type="monotone" dataKey="shipped" name="Kargo Dikirim" stroke="#1a56db" strokeWidth={2} fill={`url(#${gradShipped})`} dot={false} />
              <Area type="monotone" dataKey="arrived" name="Kargo Tiba" stroke="#16a34a" strokeWidth={2} fill={`url(#${gradArrived})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          className={`xl:col-span-4 rounded-xl border p-5 ${cardBase}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Ringkasan Pengguna</h3>
            <Link href="/users" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors" style={{ fontSize: '0.75rem' }}>
              Kelola <ExternalLink size={11} />
            </Link>
          </div>

          {/* Role breakdown */}
          <div className="space-y-3 mb-4">
            {(Object.entries(usersByRole) as [string, number][]).map(([role, count]) => {
              const meta = ROLE_META[role as 'admin' | 'supervisor' | 'operator'];
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => router.push(`/users?role=${role}`)}
                  className={`flex w-full items-center gap-3 rounded-lg px-1 py-1 transition-colors ${
                    isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`px-2 py-0.5 rounded-md border ${meta.bgClass} ${meta.borderClass}`}>
                    <span className={`${meta.textClass}`} style={{ fontSize: '0.6875rem', fontWeight: 600 }}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className={`h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'} overflow-hidden`}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(count / users.length) * 100}%`, backgroundColor: meta.color }}
                      />
                    </div>
                  </div>
                  <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`} style={{ fontSize: '0.8125rem', fontWeight: 600, minWidth: 24, textAlign: 'right' }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active/Inactive */}
          <button
            type="button"
            onClick={() => router.push('/users?status=active')}
            className={`mb-4 flex w-full items-center justify-between rounded-lg p-3 transition-colors ${isDark ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-500" />
              <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '0.8125rem' }}>Aktif</span>
            </div>
            <span className="text-green-600" style={{ fontWeight: 700, fontSize: '1rem' }}>{activeUsers}</span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/users?status=inactive')}
            className={`flex w-full items-center justify-between rounded-lg p-3 transition-colors ${isDark ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'}`}
          >
            <div className="flex items-center gap-2">
              <XCircle size={14} className="text-red-400" />
              <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '0.8125rem' }}>Tidak Aktif</span>
            </div>
            <span className="text-red-500" style={{ fontWeight: 700, fontSize: '1rem' }}>{inactiveUsers}</span>
          </button>

          {/* Recent users */}
          <div className="mt-4">
            <p className={`mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontSize: '0.75rem', fontWeight: 500 }}>Login Terakhir</p>
            {users.filter((u) => u.status === 'active').slice(0, 3).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => router.push(`/users?q=${encodeURIComponent(u.name)}`)}
                className={`flex w-full items-center gap-2.5 rounded-lg py-1.5 text-left transition-colors ${
                  isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white" style={{ fontSize: '0.5625rem', fontWeight: 700 }}>
                    {u.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{u.name}</p>
                  <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontSize: '0.6875rem' }}>{u.lastLogin}</p>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-xs ${ROLE_META[u.role].bgClass} ${ROLE_META[u.role].textClass}`} style={{ fontSize: '0.625rem', fontWeight: 600 }}>
                  {u.role.charAt(0).toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Airport Activity + System Health */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Airport Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.35 }}
          className={`xl:col-span-7 rounded-xl border p-5 ${cardBase}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Aktivitas per Bandara</h3>
              <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontSize: '0.8125rem' }}>Distribusi kargo hari ini</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
              <span className={`${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontSize: '0.75rem' }}>27 bandara aktif</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={airportActivity} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="airport" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: 8, fontSize: 13, color: isDark ? '#e2e8f0' : '#1e293b' }} />
              <Bar dataKey="cargo" name="Kargo" fill="#1a56db" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.35 }}
          className={`xl:col-span-5 rounded-xl border p-5 ${cardBase}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Status Sistem</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-600" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Semua Online</span>
            </div>
          </div>
          {[
            { label: 'API Gateway', status: 'online', uptime: '99.98%', icon: Server },
            { label: 'Database Primer', status: 'online', uptime: '99.97%', icon: Server },
            { label: 'Tracking Service', status: 'online', uptime: '99.95%', icon: Activity },
            { label: 'Auth Service', status: 'online', uptime: '100%', icon: Shield },
            { label: 'Notifikasi Push', status: 'online', uptime: '99.82%', icon: TrendingUp },
          ].map((svc) => (
            <div key={svc.label} className={`flex items-center gap-3 py-2.5 border-b last:border-0 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <svc.icon size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{svc.label}</p>
              </div>
              <span className="text-green-500" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{svc.uptime}</span>
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.35 }}
        className={`rounded-xl border p-5 ${cardBase}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Aktivitas Kargo Terkini</h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.75rem' }}>Live</span>
            <Link href="/tracking" className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors ml-2" style={{ fontSize: '0.75rem' }}>
              Lihat semua <ExternalLink size={11} />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recentActivity.slice(0, 4).map((act, i) => (
            <motion.div
              key={act.awb + i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.05 }}
              onClick={() => router.push(`/tracking/${act.awb}`)}
              className={`flex items-start gap-2.5 p-3 rounded-lg cursor-pointer transition-colors ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${ACTIVITY_DOT[act.type]}`} />
              <div className="min-w-0">
                <span className={`font-mono block ${isDark ? 'text-blue-400' : 'text-blue-600'}`} style={{ fontSize: '0.75rem', fontWeight: 600 }}>{act.awb}</span>
                <p className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{act.event}</p>
                <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontSize: '0.6875rem' }}>{act.location}</p>
                <p className={`${isDark ? 'text-slate-600' : 'text-slate-400'}`} style={{ fontSize: '0.6875rem' }}>{act.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
