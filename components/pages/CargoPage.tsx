'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  ExternalLink,
  Package,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useCargo } from '@/context/CargoContext';
import {
  CARGO_CRUD_DISABLED as CRUD_DISABLED,
  CRUD_DISABLED_MESSAGE,
} from '@/lib/feature-flags';
import { hasFeature } from '@/lib/permissions';
import { ROLE_META } from '@/lib/permissions';
import { CargoModal } from '@/components/cargo/CargoModal';
import { DeleteConfirmModal } from '@/components/cargo/DeleteConfirmModal';
import type { Shipment, ShipmentStatus } from '@/lib/mock-data';

const PAGE_SIZE = 10;

type SortKey = 'awb' | 'shipper' | 'weight' | 'status' | 'departure' | 'destination';
type SortDir = 'asc' | 'desc';
type DateFilter = 'all' | '3d' | '7d' | '30d';

const STATUS_BADGE: Record<ShipmentStatus, { label: string; dot: string; cls: string }> = {
  Received: {
    label: 'Diterima',
    dot: 'bg-slate-400',
    cls: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
  },
  Sortation: {
    label: 'Sortasi',
    dot: 'bg-blue-500',
    cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50',
  },
  'Loaded to Aircraft': {
    label: 'Dimuat',
    dot: 'bg-amber-500',
    cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50',
  },
  Departed: {
    label: 'Berangkat',
    dot: 'bg-indigo-500',
    cls: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/50',
  },
  Arrived: {
    label: 'Tiba',
    dot: 'bg-green-500',
    cls: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50',
  },
};

function parseDisplayDate(value: string) {
  const match = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
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
  const [, day, month, year] = match;
  const monthIndex = monthMap[month];
  if (monthIndex === undefined) return null;
  return new Date(Number(year), monthIndex, Number(day));
}

function parseShipmentDate(shipment: Shipment) {
  if (shipment.shippingDate) {
    const parsed = new Date(`${shipment.shippingDate}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return parseDisplayDate(shipment.scheduledDeparture);
}

function csvCell(value: string | number | undefined | null) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export function CargoPage() {
  const { isDark, currentUser } = useApp();
  const { shipments, deleteShipment } = useCargo();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // RBAC
  const crudDisabled = CRUD_DISABLED;
  const canCreate = hasFeature(currentUser.role, 'canUpdateCargoStatus') && currentUser.role !== 'supervisor';
  const canEdit = hasFeature(currentUser.role, 'canUpdateCargoStatus') && currentUser.role !== 'supervisor';
  const canDelete = currentUser.role === 'admin';
  const canExport = hasFeature(currentUser.role, 'canExportData');

  // State
  const [sortKey, setSortKey] = useState<SortKey>('awb');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  // Modals
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [deletingShipment, setDeletingShipment] = useState<Shipment | null>(null);
  const [toast, setToast] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'delete' | 'info'>('success');

  const validStatuses: Array<ShipmentStatus | 'all'> = ['all', 'Received', 'Sortation', 'Loaded to Aircraft', 'Departed', 'Arrived'];
  const validDateFilters: DateFilter[] = ['all', '3d', '7d', '30d'];
  const search = searchParams.get('q') ?? '';
  const requestedStatus = (searchParams.get('status') as ShipmentStatus | 'all' | null) ?? 'all';
  const requestedDate = (searchParams.get('periode') as DateFilter | null) ?? 'all';
  const filterStatus = validStatuses.includes(requestedStatus) ? requestedStatus : 'all';
  const filterDate = validDateFilters.includes(requestedDate) ? requestedDate : 'all';
  const filterRoute = searchParams.get('route') ?? 'all';

  // Derived stats
  const stats = useMemo(() => {
    const total = shipments.length;
    const byStatus = shipments.reduce<Record<string, number>>(
      (acc, s) => ({ ...acc, [s.currentStatus]: (acc[s.currentStatus] || 0) + 1 }),
      {}
    );
    const totalWeight = shipments.reduce((sum, s) => sum + s.weight, 0);
    return { total, byStatus, totalWeight };
  }, [shipments]);

  // Available routes for filter
  const routes = useMemo(() => {
    const pairs = new Set(shipments.map((s) => `${s.origin.code}→${s.destination.code}`));
    return ['all', ...Array.from(pairs).sort()];
  }, [shipments]);

  const latestShipmentDate = useMemo(() => {
    const times = shipments
      .map((shipment) => parseShipmentDate(shipment)?.getTime())
      .filter((time): time is number => typeof time === 'number' && Number.isFinite(time));
    return times.length ? Math.max(...times) : Date.now();
  }, [shipments]);

  // Filter + Search + Sort
  const filtered = useMemo(() => {
    let list = [...shipments];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.awb.toLowerCase().includes(q) ||
          s.shipper.toLowerCase().includes(q) ||
          s.consignee.toLowerCase().includes(q) ||
          s.flightNumber.toLowerCase().includes(q) ||
          s.commodity.toLowerCase().includes(q) ||
          (s.originCity ?? '').toLowerCase().includes(q) ||
          (s.destinationCity ?? '').toLowerCase().includes(q)
      );
    }

    if (filterStatus !== 'all') {
      list = list.filter((s) => s.currentStatus === filterStatus);
    }

    if (filterRoute !== 'all') {
      const [orig, dest] = filterRoute.split('→');
      list = list.filter(
        (s) => s.origin.code === orig && s.destination.code === dest
      );
    }

    if (filterDate !== 'all') {
      const rangeDays = filterDate === '3d' ? 3 : filterDate === '7d' ? 7 : 30;
      const minDate = latestShipmentDate - (rangeDays - 1) * 24 * 60 * 60 * 1000;
      list = list.filter((shipment) => {
        const time = parseShipmentDate(shipment)?.getTime();
        return typeof time === 'number' && time >= minDate && time <= latestShipmentDate;
      });
    }

    list.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';
      if (sortKey === 'awb') { valA = a.awb; valB = b.awb; }
      else if (sortKey === 'shipper') { valA = a.shipper; valB = b.shipper; }
      else if (sortKey === 'weight') { valA = a.weight; valB = b.weight; }
      else if (sortKey === 'status') { valA = a.currentStatus; valB = b.currentStatus; }
      else if (sortKey === 'departure') { valA = a.scheduledDeparture; valB = b.scheduledDeparture; }
      else if (sortKey === 'destination') { valA = a.destination.code; valB = b.destination.code; }

      if (typeof valA === 'number') {
        return sortDir === 'asc' ? valA - (valB as number) : (valB as number) - valA;
      }
      const cmp = String(valA).localeCompare(String(valB));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [shipments, search, filterStatus, filterRoute, filterDate, latestShipmentDate, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  function updateQuery(next: { q?: string; status?: ShipmentStatus | 'all'; route?: string; date?: DateFilter }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.q !== undefined) {
      if (next.q.trim()) params.set('q', next.q);
      else params.delete('q');
    }

    if (next.status !== undefined) {
      if (next.status !== 'all') params.set('status', next.status);
      else params.delete('status');
    }

    if (next.route !== undefined) {
      if (next.route !== 'all') params.set('route', next.route);
      else params.delete('route');
    }

    if (next.date !== undefined) {
      if (next.date !== 'all') params.set('periode', next.date);
      else params.delete('periode');
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleSearchChange(v: string) {
    updateQuery({ q: v });
    setPage(1);
  }

  function handleFilterStatus(v: ShipmentStatus | 'all') {
    updateQuery({ status: v });
    setPage(1);
  }

  function handleFilterDate(v: DateFilter) {
    updateQuery({ date: v });
    setPage(1);
  }

  function showToast(msg: string, type: 'success' | 'delete' | 'info' = 'success') {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 4000);
  }

  function handleExport() {
    if (filtered.length === 0) {
      showToast('Tidak ada data kargo untuk diexport.', 'info');
      return;
    }

    const headers = [
      'AWB',
      'Pengirim',
      'Penerima',
      'Asal',
      'Tujuan',
      'Rute',
      'Berat (kg)',
      'Koli',
      'Komoditas',
      'Nomor Penerbangan',
      'Jadwal Berangkat',
      'Status',
    ];

    const rows = filtered.map((shipment) => [
      shipment.awb,
      shipment.shipper,
      shipment.consignee,
      `${shipment.origin.name} (${shipment.origin.code})`,
      `${shipment.destination.name} (${shipment.destination.code})`,
      `${shipment.origin.code}-${shipment.destination.code}`,
      shipment.weight,
      shipment.pieces,
      shipment.commodity,
      shipment.flightNumber,
      shipment.scheduledDeparture,
      STATUS_BADGE[shipment.currentStatus].label,
    ]);

    const csv = [
      headers.map(csvCell).join(','),
      ...rows.map((row) => row.map(csvCell).join(',')),
    ].join('\r\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `data-kargo-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(`${filtered.length} data kargo berhasil diexport.`, 'success');
  }

  async function handleDelete() {
    if (!deletingShipment) return;
    const result = await deleteShipment(deletingShipment.awb);
    if (!result.ok) {
      showToast(result.error ?? CRUD_DISABLED_MESSAGE, 'info');
      setDeletingShipment(null);
      return;
    }
    showToast(`Kargo ${deletingShipment.awb} berhasil dihapus.`, 'delete');
    setDeletingShipment(null);
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown size={13} className="opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp size={13} className="text-blue-500" /> : <ArrowDown size={13} className="text-blue-500" />;
  }

  const cardBase = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const roleMeta = ROLE_META[currentUser.role];

  return (
    <div className="space-y-5">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-5 left-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border ${
              toastType === 'delete'
                ? 'bg-red-600 text-white border-red-500'
                : toastType === 'info'
                ? 'bg-amber-400 text-slate-900 border-amber-300'
                : 'bg-green-600 text-white border-green-500'
            }`}
          >
            {toastType === 'delete' ? <Trash2 size={15} /> : toastType === 'info' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast}</span>
            <button onClick={() => setToast('')}><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-900/40' : 'bg-blue-50'}`}>
              <Package size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className={`${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Manajemen Kargo
            </h1>
            <span
              className={`px-2 py-0.5 rounded-full border ${roleMeta.bgClass} ${roleMeta.textClass} ${roleMeta.borderClass}`}
              style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase' }}
            >
              {roleMeta.label}
            </span>
          </div>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontSize: '0.875rem' }}>
            {crudDisabled
              ? 'Data kargo tetap bisa dipantau, tetapi aksi tambah, edit, dan hapus sedang dinonaktifkan.'
              : currentUser.role === 'supervisor'
              ? 'Mode hanya baca — Anda dapat memantau data kargo tanpa mengubahnya.'
              : 'Kelola data kargo: tambah, edit, dan hapus shipment.'}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {canExport && (
            <button
              type="button"
              onClick={handleExport}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-colors ${
                isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
              style={{ fontSize: '0.875rem', fontWeight: 500 }}
            >
              <Download size={15} />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
          {canCreate && (
            <button
              onClick={() => {
                if (!crudDisabled) {
                  setEditingShipment(null);
                  setModalMode('create');
                }
              }}
              disabled={crudDisabled}
              title={crudDisabled ? CRUD_DISABLED_MESSAGE : 'Tambah kargo'}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white transition-colors ${
                crudDisabled
                  ? 'cursor-not-allowed bg-slate-400 shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
              }`}
              style={{ fontSize: '0.875rem', fontWeight: 600 }}
            >
              <Plus size={16} />
              Tambah Kargo
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {[
          { label: 'Total Kargo', value: stats.total, color: 'slate', filter: 'all' as const },
          { label: 'Diterima', value: stats.byStatus['Received'] || 0, color: 'slate', filter: 'Received' as ShipmentStatus },
          { label: 'Dimuat', value: stats.byStatus['Loaded to Aircraft'] || 0, color: 'amber', filter: 'Loaded to Aircraft' as ShipmentStatus },
          { label: 'Berangkat', value: stats.byStatus['Departed'] || 0, color: 'indigo', filter: 'Departed' as ShipmentStatus },
          { label: 'Tiba', value: stats.byStatus['Arrived'] || 0, color: 'green', filter: 'Arrived' as ShipmentStatus },
        ].map((s) => {
          const isActive = filterStatus === s.filter;
          const colorMap: Record<string, string> = {
            slate: 'text-slate-600 dark:text-slate-300',
            blue: 'text-blue-600 dark:text-blue-400',
            amber: 'text-amber-600 dark:text-amber-400',
            indigo: 'text-indigo-600 dark:text-indigo-400',
            green: 'text-green-600 dark:text-green-400',
          };
          return (
            <button
              key={s.label}
              onClick={() => handleFilterStatus(s.filter)}
              className={`rounded-xl border p-3.5 text-left transition-all ${
                isActive
                  ? isDark ? 'bg-blue-900/30 border-blue-700 ring-1 ring-blue-600' : 'bg-blue-50 border-blue-300 ring-1 ring-blue-400'
                  : `${cardBase} hover:shadow-sm`
              }`}
            >
              <p className={`${colorMap[s.color]}`} style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>
                {s.value}
              </p>
              <p className={`mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`} style={{ fontSize: '0.6875rem', fontWeight: 500 }}>
                {s.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className={`rounded-xl border p-4 ${cardBase}`}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari AWB, pengirim, penerima, nama barang..."
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border transition-colors outline-none ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500 focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'
              }`}
              style={{ fontSize: '0.875rem' }}
            />
            {search && (
              <button
                onClick={() => handleSearchChange('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
            <select
              value={filterStatus}
              onChange={(e) => handleFilterStatus(e.target.value as ShipmentStatus | 'all')}
              className={`pl-8 pr-4 py-2.5 rounded-xl border appearance-none outline-none transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-700 focus:border-blue-500'
              }`}
              style={{ fontSize: '0.875rem' }}
            >
              <option value="all">Semua Status</option>
              <option value="Received">Diterima</option>
              <option value="Sortation">Sortasi</option>
              <option value="Loaded to Aircraft">Dimuat</option>
              <option value="Departed">Berangkat</option>
              <option value="Arrived">Tiba</option>
            </select>
          </div>

          {/* Route Filter */}
          <div className="relative">
            <select
              value={filterRoute}
              onChange={(e) => {
                updateQuery({ route: e.target.value });
                setPage(1);
              }}
              className={`px-3 py-2.5 rounded-xl border appearance-none outline-none transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-700 focus:border-blue-500'
              }`}
              style={{ fontSize: '0.875rem' }}
            >
              {routes.map((r) => (
                <option key={r} value={r}>{r === 'all' ? 'Semua Rute' : r}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <select
              value={filterDate}
              onChange={(e) => handleFilterDate(e.target.value as DateFilter)}
              className={`px-3 py-2.5 rounded-xl border appearance-none outline-none transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-700 focus:border-blue-500'
              }`}
              style={{ fontSize: '0.875rem' }}
            >
              <option value="all">Semua Tanggal</option>
              <option value="3d">3 Hari Terakhir</option>
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
            </select>
          </div>

          {/* Reset */}
          {(search || filterStatus !== 'all' || filterRoute !== 'all' || filterDate !== 'all') && (
            <button
              onClick={() => {
                updateQuery({ q: '', status: 'all', route: 'all', date: 'all' });
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-colors ${
                isDark ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-300 text-slate-500 hover:bg-slate-50'
              }`}
              style={{ fontSize: '0.8125rem' }}
            >
              <RefreshCw size={13} />
              Reset
            </button>
          )}
        </div>

        {/* Results count */}
        {filtered.length !== shipments.length && (
          <p className={`mt-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontSize: '0.8125rem' }}>
            Menampilkan <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{filtered.length}</strong> dari {shipments.length} kargo
          </p>
        )}
      </div>

      {/* Table */}
      <div className={`rounded-xl border overflow-hidden ${cardBase}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-100 bg-slate-50'}`}>
                {[
                  { key: 'awb' as SortKey, label: 'Nomor AWB', w: 'w-36' },
                  { key: 'shipper' as SortKey, label: 'Pengirim', w: 'w-40' },
                  { key: null, label: 'Penerima', w: 'w-40' },
                  { key: 'weight' as SortKey, label: 'Berat / Barang', w: 'w-28' },
                  { key: 'destination' as SortKey, label: 'Rute', w: 'w-28' },
                  { key: null, label: 'Penerbangan', w: 'w-32' },
                  { key: 'status' as SortKey, label: 'Status', w: 'w-32' },
                  { key: 'departure' as SortKey, label: 'Jadwal', w: 'w-40' },
                  { key: null, label: 'Aksi', w: 'w-24' },
                ].map((col, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3.5 text-left ${col.w} ${
                      col.key ? 'cursor-pointer select-none hover:opacity-80' : ''
                    } ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                    onClick={() => col.key && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {col.key && <SortIcon col={col.key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <Package size={24} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        </div>
                        <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
                          Tidak ada kargo ditemukan
                        </p>
                        <p className={`${isDark ? 'text-slate-600' : 'text-slate-400'}`} style={{ fontSize: '0.8125rem' }}>
                          {crudDisabled ? 'Coba ubah filter pencarian untuk melihat data yang tersedia' : 'Coba ubah filter pencarian atau tambah kargo baru'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((ship, rowIdx) => {
                    const badge = STATUS_BADGE[ship.currentStatus];
                    return (
                      <motion.tr
                        key={ship.awb}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: rowIdx * 0.03 }}
                        className={`border-b last:border-0 transition-colors ${
                          isDark
                            ? 'border-slate-700/60 hover:bg-slate-700/30'
                            : 'border-slate-100 hover:bg-blue-50/20'
                        }`}
                      >
                        {/* AWB */}
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => router.push(`/tracking/${ship.awb}`)}
                            className="flex items-center gap-1.5 group"
                          >
                            <span
                              className={`font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'} group-hover:underline`}
                              style={{ fontSize: '0.8125rem', fontWeight: 700 }}
                            >
                              {ship.awb}
                            </span>
                            <ExternalLink size={11} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                          </button>
                          <p className={`mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} style={{ fontSize: '0.6875rem' }}>
                            {ship.commodity}
                          </p>
                        </td>

                        {/* Shipper */}
                        <td className="px-4 py-3.5">
                          <p className={`truncate max-w-[10rem] ${isDark ? 'text-slate-200' : 'text-slate-700'}`} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                            {ship.shipper}
                          </p>
                        </td>

                        {/* Consignee */}
                        <td className="px-4 py-3.5">
                          <p className={`truncate max-w-[10rem] ${isDark ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontSize: '0.8125rem' }}>
                            {ship.consignee}
                          </p>
                        </td>

                        {/* Weight / Pieces */}
                        <td className="px-4 py-3.5">
                          <p className={`${isDark ? 'text-slate-200' : 'text-slate-700'}`} style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                            {ship.weight} kg
                          </p>
                          <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontSize: '0.6875rem' }}>
                            {ship.pieces} barang
                          </p>
                        </td>

                        {/* Route */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                              style={{ fontSize: '0.6875rem', fontWeight: 700 }}
                            >
                              {ship.origin.code}
                            </span>
                            <span className={isDark ? 'text-slate-600' : 'text-slate-300'} style={{ fontSize: '0.625rem' }}>→</span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                              style={{ fontSize: '0.6875rem', fontWeight: 700 }}
                            >
                              {ship.destination.code}
                            </span>
                          </div>
                        </td>

                        {/* Flight */}
                        <td className="px-4 py-3.5">
                          <p className={`font-mono ${isDark ? 'text-slate-200' : 'text-slate-700'}`} style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                            {ship.flightNumber}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${badge.cls}`}
                            style={{ fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badge.dot}`} />
                            {badge.label}
                          </div>
                        </td>

                        {/* Scheduled */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <span className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontSize: '0.8125rem' }}>
                              {ship.scheduledDeparture}
                            </span>
                          </div>
                          <p className={`mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} style={{ fontSize: '0.6875rem' }}>
                            {ship.tracking.length} event log
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            {/* View */}
                            <button
                              onClick={() => router.push(`/tracking/${ship.awb}`)}
                              title="Lihat tracking"
                              className={`p-2 rounded-lg transition-colors ${
                                isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              <Eye size={15} />
                            </button>

                            {/* Edit */}
                            {canEdit && (
                              <button
                                onClick={() => {
                                  if (!crudDisabled) {
                                    setEditingShipment(ship);
                                    setModalMode('edit');
                                  }
                                }}
                                disabled={crudDisabled}
                                title={crudDisabled ? CRUD_DISABLED_MESSAGE : 'Edit kargo'}
                                className={`p-2 rounded-lg transition-colors ${
                                  crudDisabled
                                    ? isDark
                                      ? 'cursor-not-allowed text-slate-600'
                                      : 'cursor-not-allowed text-slate-300'
                                    : isDark
                                    ? 'hover:bg-blue-900/30 text-slate-400 hover:text-blue-400'
                                    : 'hover:bg-blue-50 text-slate-400 hover:text-blue-600'
                                }`}
                              >
                                <Edit2 size={15} />
                              </button>
                            )}

                            {/* Delete */}
                            {canDelete && (
                              <button
                                onClick={() => {
                                  if (!crudDisabled) {
                                    setDeletingShipment(ship);
                                  }
                                }}
                                disabled={crudDisabled}
                                title={crudDisabled ? CRUD_DISABLED_MESSAGE : 'Hapus kargo'}
                                className={`p-2 rounded-lg transition-colors ${
                                  crudDisabled
                                    ? isDark
                                      ? 'cursor-not-allowed text-slate-600'
                                      : 'cursor-not-allowed text-slate-300'
                                    : isDark
                                    ? 'hover:bg-red-900/30 text-slate-400 hover:text-red-400'
                                    : 'hover:bg-red-50 text-slate-400 hover:text-red-500'
                                }`}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div
            className={`flex items-center justify-between px-5 py-3.5 border-t ${
              isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'
            }`}
          >
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontSize: '0.8125rem' }}>
              Hal. <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{page}</strong> dari {totalPages} &bull;{' '}
              {filtered.length} total kargo
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5) {
                  if (page <= 3) p = i + 1;
                  else if (page >= totalPages - 2) p = totalPages - 4 + i;
                  else p = page - 2 + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg transition-colors ${
                      page === p
                        ? 'bg-blue-600 text-white'
                        : isDark
                        ? 'text-slate-400 hover:bg-slate-700'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                    style={{ fontSize: '0.875rem', fontWeight: page === p ? 700 : 400 }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role-based notice */}
      {!crudDisabled && currentUser.role === 'supervisor' && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
            isDark ? 'border-slate-700 bg-slate-800/50' : 'border-amber-200 bg-amber-50'
          }`}
        >
          <Eye size={15} className={isDark ? 'text-slate-500' : 'text-amber-600'} />
          <p className={`${isDark ? 'text-slate-500' : 'text-amber-700'}`} style={{ fontSize: '0.8125rem' }}>
            <strong>Supervisor</strong> memiliki akses <em>hanya baca</em> pada halaman ini. Untuk mengubah data kargo, hubungi Operator atau Admin.
          </p>
        </div>
      )}
      {!crudDisabled && currentUser.role === 'operator' && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
            isDark ? 'border-slate-700 bg-slate-800/50' : 'border-blue-200 bg-blue-50'
          }`}
        >
          <AlertTriangle size={15} className="text-blue-500" />
          <p className={`${isDark ? 'text-slate-500' : 'text-blue-700'}`} style={{ fontSize: '0.8125rem' }}>
            <strong>Operator</strong>: Anda dapat menambah dan mengedit data kargo. Penghapusan data hanya dapat dilakukan oleh <strong>Admin</strong>.
          </p>
        </div>
      )}

      {/* Modals */}
      {!crudDisabled && modalMode && (
        <CargoModal
          mode={modalMode}
          shipment={editingShipment}
          onClose={() => { setModalMode(null); setEditingShipment(null); }}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}

      <DeleteConfirmModal
        shipment={crudDisabled ? null : deletingShipment}
        onConfirm={handleDelete}
        onCancel={() => setDeletingShipment(null)}
      />
    </div>
  );
}
