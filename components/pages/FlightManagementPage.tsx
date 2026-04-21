'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  Plane,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  Package,
  Search,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { flights } from '@/lib/mock-data';

type FlightStatus = 'all' | 'on-time' | 'delayed' | 'departed' | 'cancelled';

const STATUS_CONFIG: Record<Exclude<FlightStatus, 'all'>, {
  label: string;
  cls: string;
  icon: LucideIcon;
  dot: string;
}> = {
  'on-time': {
    label: 'On-Time',
    cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    icon: CheckCircle2,
    dot: 'bg-green-500',
  },
  'delayed': {
    label: 'Delay',
    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    icon: AlertTriangle,
    dot: 'bg-amber-500',
  },
  'departed': {
    label: 'Berangkat',
    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    icon: Plane,
    dot: 'bg-blue-500',
  },
  'cancelled': {
    label: 'Dibatalkan',
    cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    icon: XCircle,
    dot: 'bg-red-500',
  },
};

const AIRLINES: Record<string, string> = {
  'Garuda Indonesia': 'GA',
  'Citilink': 'QG',
  'Lion Air': 'JT',
  'Batik Air': 'ID',
  'Sriwijaya Air': 'SJ',
};

export function FlightManagementPage() {
  const { isDark } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const validStatuses: FlightStatus[] = ['all', 'on-time', 'delayed', 'departed', 'cancelled'];
  const requestedStatus = (searchParams.get('status') as FlightStatus | null) ?? 'all';
  const statusFilter = validStatuses.includes(requestedStatus) ? requestedStatus : 'all';
  const searchQuery = searchParams.get('q') ?? '';

  const cardBase = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

  const filtered = flights.filter((f) => {
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      f.flightNumber.toLowerCase().includes(q) ||
      f.airline.toLowerCase().includes(q) ||
      f.origin.code.toLowerCase().includes(q) ||
      f.destination.code.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    all: flights.length,
    'on-time': flights.filter((f) => f.status === 'on-time').length,
    delayed: flights.filter((f) => f.status === 'delayed').length,
    departed: flights.filter((f) => f.status === 'departed').length,
    cancelled: flights.filter((f) => f.status === 'cancelled').length,
  };

  const totalWeight = filtered.reduce((sum, f) => sum + f.cargoWeight, 0);
  const totalCargo = filtered.reduce((sum, f) => sum + f.cargoCount, 0);

  const filterTabs: { key: FlightStatus; label: string; count: number }[] = [
    { key: 'all', label: 'Semua', count: counts.all },
    { key: 'on-time', label: 'On-Time', count: counts['on-time'] },
    { key: 'delayed', label: 'Delay', count: counts.delayed },
    { key: 'departed', label: 'Berangkat', count: counts.departed },
  ];

  function updateQuery(next: { status?: FlightStatus; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());

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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Penerbangan', value: flights.length, icon: Plane, color: 'text-blue-600' },
          { label: 'On-Time', value: counts['on-time'], icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Delayed', value: counts.delayed, icon: AlertTriangle, color: 'text-amber-600' },
          { label: 'Berangkat', value: counts.departed, icon: Clock, color: 'text-blue-600' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`cursor-pointer rounded-xl border p-4 transition-shadow hover:shadow-md ${cardBase}`}
            onClick={() =>
              router.push(
                item.label === 'Total Penerbangan'
                  ? '/flights'
                  : item.label === 'On-Time'
                  ? '/flights?status=on-time'
                  : item.label === 'Delayed'
                  ? '/flights?status=delayed'
                  : '/flights?status=departed'
              )
            }
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className={item.color} />
              <div>
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                  {item.label}
                </p>
                <p
                  className={isDark ? 'text-white' : 'text-slate-900'}
                  style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}
                >
                  {item.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className={`rounded-xl border ${cardBase}`}
      >
        {/* Table Header */}
        <div className={`p-5 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                Daftar Penerbangan Hari Ini
              </h3>
              <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.8125rem' }}>
                Minggu, 12 April 2026 — Total berat kargo: {totalWeight.toFixed(1)} kg ({totalCargo} kolli)
              </p>
            </div>
            <div className="relative">
              <Search
                size={15}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
              />
              <input
                type="text"
                placeholder="Cari nomor penerbangan..."
                value={searchQuery}
                onChange={(e) => updateQuery({ q: e.target.value })}
                className={`pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500'
                    : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => updateQuery({ status: tab.key })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : isDark
                    ? 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
                style={{ fontSize: '0.8125rem' }}
              >
                {tab.key !== 'all' && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      statusFilter === tab.key
                        ? 'bg-white'
                        : STATUS_CONFIG[tab.key as Exclude<FlightStatus, 'all'>].dot
                    }`}
                  />
                )}
                {tab.label}
                <span
                  className={`px-1.5 py-0.5 rounded-full ${
                    statusFilter === tab.key
                      ? 'bg-white/20'
                      : isDark ? 'bg-slate-700' : 'bg-slate-100'
                  }`}
                  style={{ fontSize: '0.6875rem', fontWeight: 600 }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-700 bg-slate-800/60' : 'border-slate-100 bg-slate-50'}`}>
                {[
                  'No. Penerbangan',
                  'Maskapai',
                  'Rute',
                  'Jadwal',
                  'Aktual',
                  'Status',
                  'Kargo (Kolli)',
                  'Berat Total',
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-left ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((flight, i) => {
                const cfg = STATUS_CONFIG[flight.status];
                const StatusIcon = cfg.icon;
                return (
                  <motion.tr
                    key={flight.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.03 }}
                    className={`border-b last:border-0 transition-colors ${
                      isDark
                        ? 'border-slate-700/50 hover:bg-slate-700/30'
                        : 'border-slate-100 hover:bg-blue-50/20'
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <span
                        className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}
                        style={{ fontSize: '0.9375rem', fontWeight: 700 }}
                      >
                        {flight.flightNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center bg-blue-600 text-white flex-shrink-0"
                          style={{ fontSize: '0.5625rem', fontWeight: 700, fontFamily: 'monospace' }}
                        >
                          {AIRLINES[flight.airline] || flight.flightNumber.substring(0, 2)}
                        </div>
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '0.8125rem' }}>
                          {flight.airline}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
                          style={{ fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          {flight.origin.code}
                        </span>
                        <span className={isDark ? 'text-slate-600' : 'text-slate-400'} style={{ fontSize: '0.75rem' }}>→</span>
                        <span
                          className={`font-mono px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
                          style={{ fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          {flight.destination.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                        {flight.scheduledDeparture}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {flight.actualDeparture ? (
                        <span
                          className={`font-mono ${
                            flight.status === 'delayed'
                              ? 'text-amber-600'
                              : isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}
                          style={{ fontSize: '0.875rem' }}
                        >
                          {flight.actualDeparture}
                        </span>
                      ) : (
                        <span className={isDark ? 'text-slate-600' : 'text-slate-400'} style={{ fontSize: '0.875rem' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.cls}`}
                        style={{ fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        <StatusIcon size={12} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Package size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '0.875rem' }}>
                          {flight.cargoCount} kolli
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        {flight.cargoWeight.toFixed(1)} kg
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className={`py-12 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <Plane size={40} className="mx-auto mb-3 opacity-30" />
              <p>Tidak ada penerbangan yang sesuai filter</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
