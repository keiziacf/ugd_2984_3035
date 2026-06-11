'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Package,
  Plane,
  RefreshCw,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { flights } from '@/lib/mock-data';

type FlightStatus = 'all' | 'on-time' | 'delayed' | 'departed' | 'cancelled';
type DateFilter = 'all' | '3d' | '7d' | '30d';

const FLIGHT_DATE = new Date(2026, 3, 12);

const STATUS_CONFIG: Record<Exclude<FlightStatus, 'all'>, {
  label: string;
  cls: string;
  icon: LucideIcon;
}> = {
  'on-time': {
    label: 'On-Time',
    cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    icon: CheckCircle2,
  },
  delayed: {
    label: 'Delay',
    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    icon: AlertTriangle,
  },
  departed: {
    label: 'Berangkat',
    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    icon: Plane,
  },
  cancelled: {
    label: 'Dibatalkan',
    cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    icon: XCircle,
  },
};

const AIRLINES: Record<string, string> = {
  'Garuda Indonesia': 'GA',
  Citilink: 'QG',
  'Lion Air': 'JT',
  'Batik Air': 'ID',
  'Sriwijaya Air': 'SJ',
};

function isInDateRange(filter: DateFilter) {
  if (filter === 'all') return true;
  const rangeDays = filter === '3d' ? 3 : filter === '7d' ? 7 : 30;
  const latestDate = FLIGHT_DATE.getTime();
  const minDate = latestDate - (rangeDays - 1) * 24 * 60 * 60 * 1000;
  return FLIGHT_DATE.getTime() >= minDate && FLIGHT_DATE.getTime() <= latestDate;
}

export function FlightManagementPage() {
  const { isDark } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const validStatuses: FlightStatus[] = ['all', 'on-time', 'delayed', 'departed', 'cancelled'];
  const validDateFilters: DateFilter[] = ['all', '3d', '7d', '30d'];
  const requestedStatus = (searchParams.get('status') as FlightStatus | null) ?? 'all';
  const requestedDate = (searchParams.get('periode') as DateFilter | null) ?? 'all';
  const statusFilter = validStatuses.includes(requestedStatus) ? requestedStatus : 'all';
  const dateFilter = validDateFilters.includes(requestedDate) ? requestedDate : 'all';
  const searchQuery = searchParams.get('q') ?? '';

  const cardBase = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return flights.filter((flight) => {
      const matchStatus = statusFilter === 'all' || flight.status === statusFilter;
      const matchDate = isInDateRange(dateFilter);
      const matchSearch =
        !q ||
        flight.flightNumber.toLowerCase().includes(q) ||
        flight.airline.toLowerCase().includes(q) ||
        flight.origin.code.toLowerCase().includes(q) ||
        flight.destination.code.toLowerCase().includes(q);
      return matchStatus && matchDate && matchSearch;
    });
  }, [dateFilter, searchQuery, statusFilter]);

  const counts = {
    all: flights.length,
    'on-time': flights.filter((flight) => flight.status === 'on-time').length,
    delayed: flights.filter((flight) => flight.status === 'delayed').length,
    departed: flights.filter((flight) => flight.status === 'departed').length,
    cancelled: flights.filter((flight) => flight.status === 'cancelled').length,
  };

  const totalWeight = filtered.reduce((sum, flight) => sum + flight.cargoWeight, 0);
  const totalCargo = filtered.reduce((sum, flight) => sum + flight.cargoCount, 0);

  function updateQuery(next: { status?: FlightStatus; date?: DateFilter; q?: string }) {
    const params = new URLSearchParams(searchParams.toString());

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

  const statCards = [
    { label: 'Total Penerbangan', value: counts.all, icon: Plane, color: 'text-blue-600', filter: 'all' as FlightStatus },
    { label: 'On-Time', value: counts['on-time'], icon: CheckCircle2, color: 'text-green-600', filter: 'on-time' as FlightStatus },
    { label: 'Delay', value: counts.delayed, icon: AlertTriangle, color: 'text-amber-600', filter: 'delayed' as FlightStatus },
    { label: 'Berangkat', value: counts.departed, icon: Clock, color: 'text-blue-600', filter: 'departed' as FlightStatus },
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1 flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? 'bg-blue-900/40' : 'bg-blue-50'}`}>
            <Plane size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className={isDark ? 'text-white' : 'text-slate-900'} style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Manajemen Penerbangan
          </h1>
        </div>
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.875rem' }}>
          Pantau jadwal, status, rute, dan muatan kargo penerbangan.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.button
            key={card.label}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => updateQuery({ status: card.filter })}
            className={`rounded-xl border p-4 text-left transition-shadow hover:shadow-sm ${cardBase}`}
          >
            <div className="flex items-center gap-3">
              <card.icon size={20} className={card.color} />
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
              placeholder="Cari nomor penerbangan, maskapai, atau rute..."
              value={searchQuery}
              onChange={(e) => updateQuery({ q: e.target.value })}
              className={`w-full rounded-xl border py-2.5 pl-9 pr-9 outline-none transition-colors focus:border-blue-500 ${
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
            <Filter size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => updateQuery({ status: e.target.value as FlightStatus })}
              className={`rounded-xl border py-2.5 pl-8 pr-4 outline-none transition-colors ${
                isDark ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-slate-300 bg-white text-slate-700'
              }`}
              style={{ fontSize: '0.875rem' }}
            >
              <option value="all">Semua Status</option>
              <option value="on-time">On-Time</option>
              <option value="delayed">Delay</option>
              <option value="departed">Berangkat</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => updateQuery({ date: e.target.value as DateFilter })}
              className={`rounded-xl border px-3 py-2.5 outline-none transition-colors ${
                isDark ? 'border-slate-600 bg-slate-700 text-slate-200' : 'border-slate-300 bg-white text-slate-700'
              }`}
              style={{ fontSize: '0.875rem' }}
            >
              <option value="all">Semua Tanggal</option>
              <option value="3d">3 Hari Terakhir</option>
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all') && (
            <button
              type="button"
              onClick={() => updateQuery({ q: '', status: 'all', date: 'all' })}
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

        {filtered.length !== flights.length && (
          <p className={`mt-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontSize: '0.8125rem' }}>
            Menampilkan <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{filtered.length}</strong> dari {flights.length} penerbangan
          </p>
        )}
      </div>

      <div className={`overflow-hidden rounded-xl border ${cardBase}`}>
        <div className={`border-b px-5 py-4 ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-white'}`}>
          <h3 className={isDark ? 'text-slate-200' : 'text-slate-800'} style={{ fontSize: '1rem', fontWeight: 600 }}>
            Daftar Penerbangan Hari Ini
          </h3>
          <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.8125rem' }}>
            Minggu, 12 April 2026 - Total berat kargo: {totalWeight.toFixed(1)} kg ({totalCargo} barang)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-100 bg-slate-50'}`}>
                {['No. Penerbangan', 'Maskapai', 'Rute', 'Jadwal', 'Aktual', 'Status', 'Kargo', 'Berat Total'].map((heading) => (
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
              {filtered.map((flight, i) => {
                const cfg = STATUS_CONFIG[flight.status];
                const StatusIcon = cfg.icon;
                return (
                  <motion.tr
                    key={flight.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b transition-colors last:border-0 ${
                      isDark ? 'border-slate-700/60 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-blue-50/20'
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <span className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                        {flight.flightNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-blue-600 text-white" style={{ fontSize: '0.5625rem', fontWeight: 700, fontFamily: 'monospace' }}>
                          {AIRLINES[flight.airline] || flight.flightNumber.substring(0, 2)}
                        </div>
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '0.8125rem' }}>
                          {flight.airline}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`rounded px-1.5 py-0.5 font-mono ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700'}`} style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          {flight.origin.code}
                        </span>
                        <span className={isDark ? 'text-slate-600' : 'text-slate-400'} style={{ fontSize: '0.75rem' }}>-</span>
                        <span className={`rounded px-1.5 py-0.5 font-mono ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700'}`} style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          {flight.destination.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={isDark ? 'font-mono text-slate-300' : 'font-mono text-slate-600'} style={{ fontSize: '0.875rem' }}>
                        {flight.scheduledDeparture}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {flight.actualDeparture ? (
                        <span className={`font-mono ${flight.status === 'delayed' ? 'text-amber-600' : isDark ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontSize: '0.875rem' }}>
                          {flight.actualDeparture}
                        </span>
                      ) : (
                        <span className={isDark ? 'text-slate-600' : 'text-slate-400'} style={{ fontSize: '0.875rem' }}>-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${cfg.cls}`} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        <StatusIcon size={12} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Package size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '0.875rem' }}>
                          {flight.cargoCount} barang
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
            <div className={`flex flex-col items-center justify-center gap-3 py-16 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <Plane size={24} />
              </div>
              <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>Tidak ada penerbangan ditemukan</p>
              <p style={{ fontSize: '0.8125rem' }}>Coba ubah filter pencarian atau periode tanggal</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
