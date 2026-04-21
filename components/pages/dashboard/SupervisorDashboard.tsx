'use client';

import { useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  PlaneLanding,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ExternalLink,
  Clock,
  Users,
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
} from 'recharts';
import { useApp } from '@/context/AppContext';
import { todayShipmentsList, weeklyStats, flights, users } from '@/lib/mock-data';

const FLIGHT_STATUS: Record<string, { label: string; dot: string }> = {
  'on-time': { label: 'Tepat Waktu', dot: 'bg-green-500' },
  delayed: { label: 'Terlambat', dot: 'bg-amber-500' },
  departed: { label: 'Berangkat', dot: 'bg-blue-500' },
  cancelled: { label: 'Dibatalkan', dot: 'bg-red-500' },
};

export function SupervisorDashboard() {
  const { isDark, currentUser } = useApp();
  const router = useRouter();
  const uid = useId().replace(/:/g, '');
  const gradShipped = `${uid}-sup-shipped`;
  const gradArrived = `${uid}-sup-arrived`;

  const cardBase = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tickColor = isDark ? '#94a3b8' : '#64748b';

  const airport = currentUser.airport;
  const arrivedCount = todayShipmentsList.filter((s) => s.currentStatus === 'Arrived').length;
  const delayedFlights = flights.filter((f) => f.status === 'delayed').length;
  const inTransit = todayShipmentsList.filter((s) => s.currentStatus !== 'Arrived').length;
  const teamSize = users.filter((u) => u.airport === airport && u.status === 'active').length;

  const stats = [
    {
      label: 'Kargo Aktif',
      value: inTransit,
      sub: 'dalam perjalanan',
      icon: Activity,
      color: 'indigo',
      trend: 'Dipantau real-time',
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
      label: 'Flight Delay',
      value: delayedFlights,
      sub: `dari ${flights.length} penerbangan`,
      icon: AlertTriangle,
      color: 'amber',
      trend: 'Perlu monitoring',
      trendUp: false,
      link: '/flights?status=delayed',
    },
    {
      label: 'Tim Aktif',
      value: teamSize,
      sub: `di bandara ${airport}`,
      icon: Users,
      color: 'blue',
      trend: 'Shift berjalan',
      trendUp: true,
      link: '/reports',
    },
  ];

  const iconBg: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };

  const pendingActions = [
    { awb: 'AT-2604120003', action: 'Konfirmasi pemuatan GA-632', urgent: false },
    { awb: 'AT-2604120012', action: 'Approve delay GA-238', urgent: true },
    { awb: 'AT-2604120014', action: 'Verifikasi dokumen QG-973', urgent: false },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className={`cursor-pointer rounded-xl border p-5 transition-shadow hover:shadow-md ${cardBase}`}
            onClick={() => router.push(stat.link)}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                  {stat.label}
                </p>
                <p className={isDark ? 'mt-1 text-white' : 'mt-1 text-slate-900'} style={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: 1 }}>
                  {stat.value}
                </p>
                <p className={isDark ? 'mt-1 text-slate-500' : 'mt-1 text-slate-400'} style={{ fontSize: '0.75rem' }}>
                  {stat.sub}
                </p>
              </div>
              <div className={`rounded-lg p-2.5 ${iconBg[stat.color]}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className={`mt-3 flex items-center gap-1.5 border-t pt-3 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <ArrowUpRight size={13} className={stat.trendUp ? 'text-green-500' : 'text-amber-500'} style={{ transform: stat.trendUp ? '' : 'rotate(90deg)' }} />
              <span className={stat.trendUp ? 'text-green-600' : 'text-amber-600'} style={{ fontSize: '0.75rem' }}>
                {stat.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className={`rounded-xl border p-5 xl:col-span-7 ${cardBase}`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className={isDark ? 'text-slate-200' : 'text-slate-800'}>Tren Kargo Mingguan</h3>
              <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.8125rem' }}>
                6 Apr - 12 Apr 2026
              </p>
            </div>
            <Link href="/reports" className="flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-700" style={{ fontSize: '0.8125rem' }}>
              Laporan <ExternalLink size={12} />
            </Link>
          </div>
          <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
            <defs>
              <linearGradient id={gradShipped} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
              <Area type="monotone" dataKey="shipped" name="Dikirim" stroke="#f59e0b" strokeWidth={2} fill={`url(#${gradShipped})`} dot={false} />
              <Area type="monotone" dataKey="arrived" name="Tiba" stroke="#16a34a" strokeWidth={2} fill={`url(#${gradArrived})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          className={`rounded-xl border p-5 xl:col-span-5 ${cardBase}`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className={isDark ? 'text-slate-200' : 'text-slate-800'}>Perlu Persetujuan</h3>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {pendingActions.length} pending
            </span>
          </div>
          <div className="space-y-3">
            {pendingActions.map((action) => (
              <button
                key={action.awb}
                type="button"
                onClick={() => router.push(`/tracking/${action.awb}`)}
                className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                  action.urgent
                    ? 'border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/10'
                    : isDark
                    ? 'border-slate-700 bg-slate-700/30 hover:bg-slate-700/50'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${action.urgent ? 'bg-red-500' : 'bg-amber-500'}`} />
                <div className="min-w-0 flex-1">
                  <span className={isDark ? 'block font-mono text-blue-400' : 'block font-mono text-blue-600'} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {action.awb}
                  </span>
                  <p className={isDark ? 'text-slate-300' : 'text-slate-700'} style={{ fontSize: '0.8125rem' }}>
                    {action.action}
                  </p>
                  {action.urgent && (
                    <span className="text-red-600 dark:text-red-400" style={{ fontSize: '0.6875rem', fontWeight: 600 }}>
                      Urgent
                    </span>
                  )}
                </div>
                <span className="rounded-lg bg-blue-600 px-2 py-1 text-white" style={{ fontSize: '0.6875rem', fontWeight: 600 }}>
                  Review
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <p className={isDark ? 'mb-3 text-slate-400' : 'mb-3 text-slate-500'} style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Performa Tim Hari Ini
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Kargo Diproses', value: '87', unit: 'unit', color: 'text-blue-600' },
                { label: 'On-Time Rate', value: '94%', unit: '', color: 'text-green-600' },
                { label: 'Avg. Process', value: '2.3', unit: 'jam', color: 'text-amber-600' },
              ].map((m) => (
                <div key={m.label} className={isDark ? 'rounded-lg bg-slate-700/50 p-2.5 text-center' : 'rounded-lg bg-slate-50 p-2.5 text-center'}>
                  <p className={m.color} style={{ fontWeight: 700, fontSize: '1.25rem', lineHeight: 1 }}>
                    {m.value}
                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.625rem', fontWeight: 400 }}>
                      {m.unit}
                    </span>
                  </p>
                  <p className={isDark ? 'mt-0.5 text-slate-500' : 'mt-0.5 text-slate-500'} style={{ fontSize: '0.625rem' }}>
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.35 }}
        className={`rounded-xl border ${cardBase}`}
      >
        <div className={`flex items-center justify-between border-b p-5 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <div>
            <h3 className={isDark ? 'text-slate-200' : 'text-slate-800'}>Monitor Penerbangan</h3>
            <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.8125rem' }}>
              Status penerbangan aktif hari ini
            </p>
          </div>
          <Link href="/flights" className="flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-700" style={{ fontSize: '0.8125rem' }}>
            Lihat semua <ExternalLink size={13} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'}`}>
                {['Penerbangan', 'Maskapai', 'Rute', 'Jadwal', 'Status', 'Kargo'].map((h) => (
                  <th key={h} className={isDark ? 'px-4 py-3 text-left text-slate-400' : 'px-4 py-3 text-left text-slate-500'} style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flights.slice(0, 6).map((f) => (
                <tr
                  key={f.id}
                  onClick={() => router.push(`/cargo?q=${encodeURIComponent(f.flightNumber)}`)}
                  className={`cursor-pointer border-b transition-colors last:border-0 ${
                    isDark ? 'border-slate-700/50 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-blue-50/30'
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className={isDark ? 'font-mono text-blue-400' : 'font-mono text-blue-600'} style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                      {f.flightNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '0.8125rem' }}>
                      {f.airline}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className={isDark ? 'rounded bg-slate-700 px-1.5 py-0.5 font-mono text-slate-300' : 'rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600'} style={{ fontSize: '0.6875rem', fontWeight: 700 }}>
                        {f.origin.code}
                      </span>
                      <span className={isDark ? 'text-slate-600' : 'text-slate-400'} style={{ fontSize: '0.6875rem' }}>
                        →
                      </span>
                      <span className={isDark ? 'rounded bg-slate-700 px-1.5 py-0.5 font-mono text-slate-300' : 'rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600'} style={{ fontSize: '0.6875rem', fontWeight: 700 }}>
                        {f.destination.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '0.8125rem' }}>
                        {f.scheduledDeparture}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${FLIGHT_STATUS[f.status].dot}`} />
                      <span className={`${f.status === 'delayed' ? 'text-amber-600' : f.status === 'cancelled' ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'}`} style={{ fontSize: '0.8125rem' }}>
                        {FLIGHT_STATUS[f.status].label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '0.8125rem' }}>
                      {f.cargoCount} koli · {f.cargoWeight} kg
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
