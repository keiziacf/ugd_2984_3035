'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  Search,
  X,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  User,
  FileText,
  Package,
  PackageSearch,
  PlaneTakeoff,
  PlaneLanding,
  GitBranch,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useCargo } from '@/context/CargoContext';
import { TRACKING_STAGE_INFO, STAGE_ORDER } from '@/lib/mock-data';
import type { ShipmentStatus, Shipment } from '@/lib/mock-data';

const STAGE_ICONS: Record<ShipmentStatus, LucideIcon> = {
  'Received': Package,
  'Sortation': GitBranch,
  'Loaded to Aircraft': Package,
  'Departed': PlaneTakeoff,
  'Arrived': PlaneLanding,
};

const STATUS_COLOR: Record<ShipmentStatus, { bg: string; text: string; ring: string }> = {
  'Received': { bg: 'bg-slate-500', text: 'text-slate-500', ring: 'ring-slate-200' },
  'Sortation': { bg: 'bg-blue-500', text: 'text-blue-500', ring: 'ring-blue-100' },
  'Loaded to Aircraft': { bg: 'bg-amber-500', text: 'text-amber-500', ring: 'ring-amber-100' },
  'Departed': { bg: 'bg-indigo-500', text: 'text-indigo-500', ring: 'ring-indigo-100' },
  'Arrived': { bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-100' },
};

function TrackingTimeline({ shipment }: { shipment: Shipment }) {
  const { isDark } = useApp();
  const currentStageIndex = STAGE_ORDER.indexOf(shipment.currentStatus);

  return (
    <div className="relative">
      {STAGE_ORDER.map((stage, i) => {
        const event = shipment.tracking.find((t) => t.status === stage);
        const isCompleted = i <= currentStageIndex;
        const isActive = i === currentStageIndex;
        const isPending = i > currentStageIndex;
        const StageIcon = STAGE_ICONS[stage];
        const color = STATUS_COLOR[stage];

        return (
          <motion.div
            key={stage}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-5 relative"
          >
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                  ${isCompleted ? `${color.bg} ring-4 ${color.ring}` : isDark ? 'bg-slate-700 ring-4 ring-slate-700' : 'bg-slate-100 ring-4 ring-slate-50'}
                `}
              >
                {isCompleted ? (
                  isActive ? (
                    <StageIcon size={18} className="text-white" />
                  ) : (
                    <CheckCircle2 size={18} className="text-white" />
                  )
                ) : (
                  <Circle size={18} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
                )}
                {isActive && (
                  <span className={`absolute inset-0 rounded-full ${color.bg} animate-ping opacity-25`} />
                )}
              </div>
              {i < STAGE_ORDER.length - 1 && (
                <div
                  className={`w-0.5 flex-1 my-2 min-h-[40px] rounded-full transition-all ${
                    isCompleted && i < currentStageIndex
                      ? color.bg
                      : isDark
                      ? 'bg-slate-700'
                      : 'bg-slate-200'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-8 ${i === STAGE_ORDER.length - 1 ? 'pb-0' : ''}`}>
              <div className="flex items-center gap-3 mb-1">
                <h4
                  className={`${
                    isCompleted
                      ? isDark ? 'text-slate-100' : 'text-slate-800'
                      : isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                  style={{ fontWeight: isCompleted ? 600 : 400 }}
                >
                  {TRACKING_STAGE_INFO[stage].label}
                </h4>
                {isActive && (
                  <span
                    className={`px-2 py-0.5 rounded-full ${color.bg} text-white`}
                    style={{ fontSize: '0.6875rem', fontWeight: 600 }}
                  >
                    SAAT INI
                  </span>
                )}
                {isPending && (
                  <span
                    className={`px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'}`}
                    style={{ fontSize: '0.6875rem' }}
                  >
                    Menunggu
                  </span>
                )}
              </div>

              {event ? (
                <div
                  className={`rounded-xl border p-4 space-y-2.5 mt-2 ${
                    isDark ? 'bg-slate-700/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={13} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    <span
                      className={`${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                      style={{ fontSize: '0.875rem', fontWeight: 500 }}
                    >
                      {event.timestamp}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className={`mt-0.5 flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '0.875rem' }}>
                      {event.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={13} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                      Petugas: <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{event.officer}</span>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText size={13} className={`mt-0.5 flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                      {event.note}
                    </span>
                  </div>
                </div>
              ) : (
                <p
                  className={`mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
                  style={{ fontSize: '0.8125rem' }}
                >
                  {TRACKING_STAGE_INFO[stage].description}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function ShipmentDetail({ shipment }: { shipment: Shipment }) {
  const { isDark } = useApp();
  const currentStageIndex = STAGE_ORDER.indexOf(shipment.currentStatus);
  const progressPct = ((currentStageIndex + 1) / STAGE_ORDER.length) * 100;
  const color = STATUS_COLOR[shipment.currentStatus];

  const cardBase = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* AWB Header Card */}
      <div className={`rounded-xl border p-6 ${cardBase}`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PackageSearch size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                No. Airway Bill
              </span>
            </div>
            <p
              className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}
              style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.04em' }}
            >
              {shipment.awb}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${color.bg} text-white`}
              style={{ fontSize: '0.8125rem', fontWeight: 600 }}
            >
              <CheckCircle2 size={14} />
              {TRACKING_STAGE_INFO[shipment.currentStatus].label}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between mb-1.5">
            {STAGE_ORDER.map((stage, i) => (
              <span
                key={stage}
                className={`${
                  i <= currentStageIndex
                    ? isDark ? 'text-slate-300' : 'text-slate-700'
                    : isDark ? 'text-slate-600' : 'text-slate-400'
                }`}
                style={{ fontSize: '0.625rem', fontWeight: i <= currentStageIndex ? 600 : 400 }}
              >
                {i + 1}
              </span>
            ))}
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
            <motion.div
              className={`h-full rounded-full ${color.bg}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {STAGE_ORDER.map((stage, i) => (
              <span
                key={stage}
                className={isDark ? 'text-slate-600' : 'text-slate-400'}
                style={{ fontSize: '0.5625rem' }}
              >
                {i === 0 ? 'Mulai' : i === STAGE_ORDER.length - 1 ? 'Selesai' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shipment Info */}
        <div className={`rounded-xl border p-5 ${cardBase}`}>
          <h3 className={`mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Detail Pengiriman</h3>
          <div className="space-y-3">
            {[
              { label: 'Pengirim', value: shipment.shipper },
              { label: 'Penerima', value: shipment.consignee },
              { label: 'Komoditi', value: shipment.commodity },
              { label: 'Berat', value: `${shipment.weight} kg` },
              { label: 'Jumlah Kolli', value: `${shipment.pieces} koli` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.875rem' }}>
                  {label}
                </span>
                <span
                  className={`text-right ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                  style={{ fontSize: '0.875rem', fontWeight: 500 }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Route & Flight Info */}
        <div className={`rounded-xl border p-5 ${cardBase}`}>
          <h3 className={`mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Info Rute & Penerbangan</h3>
          {/* Route visual */}
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-blue-600 text-white">
            <div className="text-center">
              <p style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace' }}>{shipment.origin.code}</p>
              <p style={{ fontSize: '0.6875rem', opacity: 0.8 }}>{shipment.origin.name}</p>
            </div>
            <div className="flex-1 flex items-center">
              <div className="flex-1 border-t-2 border-dashed border-white/40" />
              <ArrowRight size={18} className="flex-shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-white/40" />
            </div>
            <div className="text-center">
              <p style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace' }}>{shipment.destination.code}</p>
              <p style={{ fontSize: '0.6875rem', opacity: 0.8 }}>{shipment.destination.name}</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'No. Penerbangan', value: shipment.flightNumber },
              { label: 'Jadwal Berangkat', value: shipment.scheduledDeparture },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.875rem' }}>
                  {label}
                </span>
                <span
                  className={isDark ? 'text-slate-200' : 'text-slate-700'}
                  style={{ fontSize: '0.875rem', fontWeight: 500, fontFamily: label === 'No. Penerbangan' ? 'monospace' : 'inherit' }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className={`rounded-xl border p-6 ${cardBase}`}>
        <h3 className={`mb-6 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Riwayat Pelacakan</h3>
        <TrackingTimeline shipment={shipment} />
      </div>
    </motion.div>
  );
}

function AWBNotFound({ awb, onReset }: { awb: string; onReset: () => void }) {
  const { isDark } = useApp();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-xl border p-10 text-center max-w-lg mx-auto ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}
    >
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
        isDark ? 'bg-amber-900/30' : 'bg-amber-50'
      }`}>
        <AlertCircle size={32} className="text-amber-500" />
      </div>
      <h2 className={`mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>AWB Tidak Ditemukan</h2>
      <p className={`mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontSize: '0.875rem' }}>
        Nomor AWB <span className="font-mono font-semibold">{awb}</span> tidak ditemukan dalam sistem kami.
      </p>
      <p className={`mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontSize: '0.875rem' }}>
        Pastikan nomor yang Anda masukkan sudah benar.
      </p>
      <div className={`text-left rounded-lg p-4 mb-6 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
        <p className={`mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
          Kemungkinan penyebab:
        </p>
        <ul className="space-y-1">
          {[
            'Nomor AWB tidak valid atau salah ketik',
            'Data kargo belum terinput dalam sistem',
            'Kargo baru saja masuk — coba beberapa menit lagi',
            'AWB mungkin sudah kadaluarsa dari periode ini',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 flex-shrink-0" style={{ fontSize: '0.875rem' }}>•</span>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        style={{ fontSize: '0.875rem', fontWeight: 500 }}
      >
        <Search size={16} /> Coba Nomor AWB Lain
      </button>
      <p className={`mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontSize: '0.8125rem' }}>
        Butuh bantuan? Hubungi supervisor Anda atau hubungi{' '}
        <span className="text-blue-500">helpdesk@aerotrack.co.id</span>
      </p>
    </motion.div>
  );
}

export function AWBTrackingPage() {
  const params = useParams<{ awb?: string | string[] }>();
  const awbParam = Array.isArray(params.awb) ? params.awb[0] : params.awb;
  const router = useRouter();
  const { isDark } = useApp();
  const { shipments: cargoShipments } = useCargo();
  const inputRef = useRef<HTMLInputElement>(null);

  const findShipment = useCallback((awbKey: string): Shipment | undefined => {
    return cargoShipments.find(
      (s) => s.awb.toUpperCase() === awbKey.toUpperCase()
    );
  }, [cargoShipments]);

  const [searchValue, setSearchValue] = useState(awbParam ?? '');
  const [result, setResult] = useState<Shipment | null | undefined>(
    awbParam ? (findShipment(awbParam) ?? null) : undefined
  );
  const [searched, setSearched] = useState(Boolean(awbParam));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      if (!awbParam) {
        setSearchValue('');
        setResult(undefined);
        setSearched(false);
        return;
      }

      setSearchValue(awbParam);
      setResult(findShipment(awbParam) ?? null);
      setSearched(true);
    });
  }, [awbParam, findShipment]);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    setIsLoading(true);
    setSearched(false);
    await new Promise((r) => setTimeout(r, 600));
    const found = findShipment(searchValue.trim());
    setResult(found ?? null);
    setSearched(true);
    setIsLoading(false);
    router.replace(`/tracking/${searchValue.trim().toUpperCase()}`);
  };

  const handleReset = () => {
    setSearchValue('');
    setResult(undefined);
    setSearched(false);
    router.replace('/tracking');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (!awbParam) {
      inputRef.current?.focus();
    }
  }, [awbParam]);

  // Keyboard: Enter to search
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const cardBase = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Panel */}
      <div className={`rounded-xl border p-6 ${cardBase}`}>
        <div className="flex items-start gap-4 mb-5">
          <div className={`p-2.5 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <PackageSearch size={22} className="text-blue-600" />
          </div>
          <div>
            <h2 className={`${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Pelacakan Airway Bill (AWB)</h2>
            <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontSize: '0.875rem' }}>
              Masukkan nomor AWB untuk melihat status dan riwayat pengiriman kargo
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search
              size={17}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
            />
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
              onKeyDown={onKeyDown}
              placeholder="Contoh: EP-2604120001"
              className={`w-full pl-10 pr-10 py-3 rounded-lg border font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue('')}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchValue.trim() || isLoading}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
            style={{ fontWeight: 500 }}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Mencari...
              </>
            ) : (
              <>
                <Search size={17} /> Lacak
              </>
            )}
          </button>
        </div>

        {/* Quick example AWBs */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.75rem' }}>
            Coba contoh:
          </span>
          {['AT-2604120001', 'AT-2604120003', 'AT-2604120006'].map((ex) => (
            <button
              key={ex}
              onClick={() => setSearchValue(ex)}
              className={`px-2.5 py-0.5 rounded border font-mono transition-colors ${
                isDark
                  ? 'border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-400'
                  : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
              }`}
              style={{ fontSize: '0.75rem' }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl border p-6 ${cardBase}`}
          >
            <div className="space-y-4 animate-pulse">
              <div className={`h-8 rounded-lg w-64 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />
              <div className={`h-4 rounded w-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />
              <div className={`h-4 rounded w-3/4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />
              <div className={`h-4 rounded w-1/2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {!isLoading && searched && result && (
          <ShipmentDetail key={result.awb} shipment={result} />
        )}
        {!isLoading && searched && result === null && (
          <AWBNotFound key="notfound" awb={searchValue} onReset={handleReset} />
        )}
      </AnimatePresence>

      {/* Initial state hint */}
      {!searched && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`rounded-xl border border-dashed p-12 text-center ${
            isDark ? 'border-slate-700' : 'border-slate-200'
          }`}
        >
          <PackageSearch size={44} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.875rem' }}>
            Masukkan nomor AWB di atas untuk mulai melacak kargo Anda
          </p>
          <p className={isDark ? 'text-slate-600' : 'text-slate-300'} style={{ fontSize: '0.8125rem' }}>
            Format: AT-XXXXXXXXXX
          </p>
        </motion.div>
      )}
    </div>
  );
}
