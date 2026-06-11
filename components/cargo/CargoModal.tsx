'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Package,
  Save,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useCargo } from '@/context/CargoContext';
import { flights } from '@/lib/mock-data';
import type { Flight, Shipment, ShipmentStatus } from '@/lib/mock-data';

const AIRPORT_OPTIONS = [
  { code: 'CGK', name: 'Soekarno-Hatta Jakarta', city: 'Jakarta' },
  { code: 'SUB', name: 'Juanda Surabaya', city: 'Surabaya' },
  { code: 'DPS', name: 'Ngurah Rai Bali', city: 'Denpasar' },
  { code: 'UPG', name: 'Hasanuddin Makassar', city: 'Makassar' },
  { code: 'KNO', name: 'Kualanamu Medan', city: 'Medan' },
  { code: 'BPN', name: 'Sultan Aji Muhammad Sulaiman', city: 'Balikpapan' },
  { code: 'SOC', name: 'Adi Soemarmo Solo', city: 'Solo' },
  { code: 'JOG', name: 'Adisutjipto Yogyakarta', city: 'Yogyakarta' },
  { code: 'PLM', name: 'SMB II Palembang', city: 'Palembang' },
  { code: 'SRG', name: 'Ahmad Yani Semarang', city: 'Semarang' },
  { code: 'HLP', name: 'Halim Perdanakusuma', city: 'Jakarta' },
  { code: 'PNK', name: 'Supadio Pontianak', city: 'Pontianak' },
  { code: 'BDJ', name: 'Syamsudin Noor Banjarmasin', city: 'Banjarmasin' },
];

type EditableShipmentStatus = Exclude<ShipmentStatus, 'Sortation'>;

const STATUS_OPTIONS: EditableShipmentStatus[] = [
  'Received',
  'Loaded to Aircraft',
  'Departed',
  'Arrived',
];

const STATUS_LABELS: Record<EditableShipmentStatus, string> = {
  Received: 'Diterima di Gudang',
  'Loaded to Aircraft': 'Dimuat ke Pesawat',
  Departed: 'Pesawat Berangkat',
  Arrived: 'Tiba di Tujuan',
};

const ITEM_TYPE_OPTIONS = [
  'Dokumen', 'Dokumen Keuangan', 'Dokumen Penting',
  'Elektronik', 'Mesin Industri', 'Suku Cadang Industri',
  'Obat-obatan', 'Pakaian Jadi', 'Perhiasan',
  'Produk Pertanian', 'Produk Segar', 'Buah-buahan',
  'Sampel Mineral', 'Spare Parts', 'Tekstil',
  'Perlengkapan Hotel', 'Lainnya',
];

function getTodayDateInput() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function getAirportCity(code: string) {
  return AIRPORT_OPTIONS.find((airport) => airport.code === code)?.city ?? '';
}

function getDateInputFromDisplayDate(value: string) {
  const match = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!match) return '';

  const monthMap: Record<string, string> = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    Mei: '05',
    Jun: '06',
    Jul: '07',
    Agt: '08',
    Sep: '09',
    Okt: '10',
    Nov: '11',
    Des: '12',
  };
  const [, day, month, year] = match;
  const monthNumber = monthMap[month];
  if (!monthNumber) return '';

  return `${year}-${monthNumber}-${day.padStart(2, '0')}`;
}

function isValidPhone(value: string) {
  return /^\d{10,12}$/.test(value.trim());
}

function getDateTimeInputFromDisplayDate(value: string) {
  const match = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4}),\s+(\d{2}):(\d{2})/);
  if (!match) return '';

  const monthMap: Record<string, string> = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    Mei: '05',
    Jun: '06',
    Jul: '07',
    Agt: '08',
    Sep: '09',
    Okt: '10',
    Nov: '11',
    Des: '12',
  };
  const [, day, month, year, hour, minute] = match;
  const monthNumber = monthMap[month];
  if (!monthNumber) return '';

  return `${year}-${monthNumber}-${day.padStart(2, '0')}T${hour}:${minute}`;
}

function formatDateTimeForDisplay(value: string) {
  if (!value) return '';
  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) return value;

  const [year, month, day] = datePart.split('-');
  const monthMap: Record<string, string> = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'Mei',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Agt',
    '09': 'Sep',
    '10': 'Okt',
    '11': 'Nov',
    '12': 'Des',
  };

  return `${day} ${monthMap[month] ?? month} ${year}, ${timePart} WIB`;
}

function combineDateAndTime(dateValue: string, timeValue: string) {
  if (!dateValue || !timeValue) return '';
  return `${dateValue}T${timeValue}`;
}

function getFlightRemainingCapacity(flight: Flight, currentShipment?: Shipment | null) {
  const currentWeight =
    currentShipment?.flightNumber === flight.flightNumber ? currentShipment.weight : 0;
  return flight.cargoCapacity - flight.cargoWeight + currentWeight;
}

interface FormState {
  awb: string;
  shipper: string;
  shipperPhone: string;
  consignee: string;
  consigneePhone: string;
  commodity: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  shippingDate: string;
  weight: string;
  pieces: string;
  itemDescription: string;
  flightNumber: string;
  scheduledDeparture: string;
  currentStatus: ShipmentStatus;
  statusNote: string;
}

const EMPTY_FORM: FormState = {
  awb: '',
  shipper: '',
  shipperPhone: '',
  consignee: '',
  consigneePhone: '',
  commodity: '',
  originCode: '',
  originCity: '',
  destinationCode: '',
  destinationCity: '',
  shippingDate: '',
  weight: '',
  pieces: '',
  itemDescription: '',
  flightNumber: '',
  scheduledDeparture: '',
  currentStatus: 'Received',
  statusNote: '',
};

type FormErrors = Partial<Record<keyof FormState, string>>;

interface CargoModalProps {
  mode: 'create' | 'edit';
  shipment: Shipment | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function CargoModal({ mode, shipment, onClose, onSuccess }: CargoModalProps) {
  const { isDark, currentUser } = useApp();
  const { addShipment, updateShipment, generateAWB } = useCargo();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Populate form
  useEffect(() => {
    queueMicrotask(() => {
      if (mode === 'edit' && shipment) {
        setForm({
          awb: shipment.awb,
          shipper: shipment.shipper,
          shipperPhone: shipment.shipperPhone ?? '',
          consignee: shipment.consignee,
          consigneePhone: shipment.consigneePhone ?? '',
          commodity: shipment.commodity,
          originCode: shipment.origin.code,
          originCity: shipment.originCity ?? getAirportCity(shipment.origin.code),
          destinationCode: shipment.destination.code,
          destinationCity: shipment.destinationCity ?? getAirportCity(shipment.destination.code),
          shippingDate: shipment.shippingDate ?? getDateInputFromDisplayDate(shipment.scheduledDeparture),
          weight: String(shipment.weight),
          pieces: String(shipment.pieces),
          itemDescription: shipment.itemDescription ?? '',
          flightNumber: shipment.flightNumber,
          scheduledDeparture: getDateTimeInputFromDisplayDate(shipment.scheduledDeparture),
          currentStatus: shipment.currentStatus,
          statusNote: '',
        });
      } else if (mode === 'create') {
        setForm({ ...EMPTY_FORM, awb: generateAWB(), shippingDate: getTodayDateInput() });
      }

      setErrors({});
      setApiError('');
    });
  }, [generateAWB, mode, shipment]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  function handleOriginAirportChange(value: string) {
    setForm((prev) => ({ ...prev, originCode: value, originCity: getAirportCity(value) }));
    setErrors((prev) => ({ ...prev, originCode: '', originCity: '' }));
  }

  function handleDestinationAirportChange(value: string) {
    setForm((prev) => ({ ...prev, destinationCode: value, destinationCity: getAirportCity(value) }));
    setErrors((prev) => ({ ...prev, destinationCode: '', destinationCity: '' }));
  }

  function handleFlightChange(value: string) {
    const selectedFlight = flights.find((flight) => flight.flightNumber === value);
    setForm((prev) => ({
      ...prev,
      flightNumber: value,
      scheduledDeparture: selectedFlight
        ? combineDateAndTime(prev.shippingDate || getTodayDateInput(), selectedFlight.scheduledDeparture)
        : '',
    }));
    setErrors((prev) => ({ ...prev, flightNumber: '', scheduledDeparture: '', weight: '' }));
  }

  function handleShippingDateChange(value: string) {
    const selectedFlight = flights.find((flight) => flight.flightNumber === form.flightNumber);
    setForm((prev) => ({
      ...prev,
      shippingDate: value,
      scheduledDeparture:
        selectedFlight && prev.scheduledDeparture
          ? combineDateAndTime(value, selectedFlight.scheduledDeparture)
          : prev.scheduledDeparture,
    }));
    setErrors((prev) => ({ ...prev, shippingDate: '', scheduledDeparture: '' }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.awb.trim()) e.awb = 'Nomor AWB wajib diisi.';
    else if (!/^AT-\d{8,12}$/.test(form.awb.trim().toUpperCase()) && !/^AT-\d{8,}/.test(form.awb.trim().toUpperCase())) {
      if (!form.awb.trim().toUpperCase().startsWith('AT-')) e.awb = 'Format AWB harus dimulai dengan AT-.';
    }
    if (!form.shipper.trim()) e.shipper = 'Nama pengirim wajib diisi.';
    else if (form.shipper.trim().length < 8) e.shipper = 'Nama pengirim minimal 8 karakter.';
    if (!form.shipperPhone.trim()) e.shipperPhone = 'Nomor telepon pengirim wajib diisi.';
    else if (!isValidPhone(form.shipperPhone)) e.shipperPhone = 'Nomor telepon pengirim harus 10 sampai 12 angka.';
    if (!form.consignee.trim()) e.consignee = 'Nama penerima wajib diisi.';
    else if (form.consignee.trim().length < 8) e.consignee = 'Nama penerima minimal 8 karakter.';
    if (!form.consigneePhone.trim()) e.consigneePhone = 'Nomor telepon penerima wajib diisi.';
    else if (!isValidPhone(form.consigneePhone)) e.consigneePhone = 'Nomor telepon penerima harus 10 sampai 12 angka.';
    if (!form.commodity.trim()) e.commodity = 'Jenis barang wajib diisi.';
    if (!form.originCode) e.originCode = 'Bandara asal wajib dipilih.';
    if (!form.originCity.trim()) e.originCity = 'Kota asal wajib diisi.';
    else if (form.originCity.trim().length < 4) e.originCity = 'Kota asal minimal 4 karakter.';
    if (!form.destinationCode) e.destinationCode = 'Bandara tujuan wajib dipilih.';
    if (!form.destinationCity.trim()) e.destinationCity = 'Kota tujuan wajib diisi.';
    else if (form.destinationCity.trim().length < 4) e.destinationCity = 'Kota tujuan minimal 4 karakter.';
    if (form.originCode && form.destinationCode && form.originCode === form.destinationCode) {
      e.destinationCode = 'Bandara tujuan harus berbeda dari asal.';
    }
    if (!form.shippingDate.trim()) e.shippingDate = 'Tanggal kirim wajib diisi.';
    const w = parseFloat(form.weight);
    if (!form.weight.trim()) e.weight = 'Berat wajib diisi.';
    else if (isNaN(w) || w <= 0) e.weight = 'Berat harus lebih dari 0 kg.';
    const p = parseInt(form.pieces);
    if (!form.pieces.trim()) e.pieces = 'Jumlah barang wajib diisi.';
    else if (isNaN(p) || p <= 0 || !Number.isInteger(p)) e.pieces = 'Jumlah barang harus bilangan bulat positif.';
    const selectedFlight = flights.find((flight) => flight.flightNumber === form.flightNumber);
    if (!form.flightNumber.trim()) e.flightNumber = 'Nomor penerbangan wajib dipilih.';
    else if (!selectedFlight) e.flightNumber = 'Nomor penerbangan harus dipilih dari data manajemen penerbangan.';
    if (!form.scheduledDeparture.trim()) e.scheduledDeparture = 'Jadwal keberangkatan wajib diisi.';
    if (selectedFlight && !e.weight) {
      const remainingCapacity = getFlightRemainingCapacity(selectedFlight, mode === 'edit' ? shipment : null);
      if (w > remainingCapacity) {
        e.weight = `Berat melebihi sisa kapasitas ${selectedFlight.flightNumber}. Maksimal ${remainingCapacity.toFixed(1)} kg.`;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');

    // Simulate slight processing delay
    await new Promise((r) => setTimeout(r, 400));

    const originAirport = AIRPORT_OPTIONS.find((a) => a.code === form.originCode);
    const destAirport = AIRPORT_OPTIONS.find((a) => a.code === form.destinationCode);
    const scheduledDeparture = formatDateTimeForDisplay(form.scheduledDeparture);

    if (mode === 'create') {
      const result = await addShipment(
        {
          awb: form.awb.trim().toUpperCase(),
          shipper: form.shipper,
          shipperPhone: form.shipperPhone,
          consignee: form.consignee,
          consigneePhone: form.consigneePhone,
          commodity: form.commodity,
          originCode: form.originCode,
          originName: originAirport?.name ?? form.originCode,
          originCity: form.originCity,
          destinationCode: form.destinationCode,
          destinationName: destAirport?.name ?? form.destinationCode,
          destinationCity: form.destinationCity,
          shippingDate: form.shippingDate,
          weight: parseFloat(form.weight),
          pieces: parseInt(form.pieces),
          itemDescription: form.itemDescription,
          flightNumber: form.flightNumber,
          scheduledDeparture,
          currentStatus: form.currentStatus,
        },
        currentUser.name
      );
      if (!result.ok) {
        setApiError(result.error ?? 'Gagal menambahkan kargo.');
        setLoading(false);
        return;
      }
      onSuccess(`Kargo ${form.awb.toUpperCase()} berhasil ditambahkan ke sistem.`);
    } else if (shipment) {
      const result = await updateShipment(
        shipment.awb,
        {
          shipper: form.shipper,
          shipperPhone: form.shipperPhone,
          consignee: form.consignee,
          consigneePhone: form.consigneePhone,
          commodity: form.commodity,
          originCode: form.originCode,
          originName: originAirport?.name ?? form.originCode,
          originCity: form.originCity,
          destinationCode: form.destinationCode,
          destinationName: destAirport?.name ?? form.destinationCode,
          destinationCity: form.destinationCity,
          shippingDate: form.shippingDate,
          weight: parseFloat(form.weight),
          pieces: parseInt(form.pieces),
          itemDescription: form.itemDescription,
          flightNumber: form.flightNumber,
          scheduledDeparture,
          currentStatus: form.currentStatus,
        },
        currentUser.name
      );
      if (!result.ok) {
        setApiError(result.error ?? 'Gagal memperbarui data kargo.');
        setLoading(false);
        return;
      }
      onSuccess(`Data kargo ${shipment.awb} berhasil diperbarui.`);
    }

    setLoading(false);
    onClose();
  }

  const inputBase = `w-full px-3 py-2.5 rounded-xl border transition-colors outline-none ${
    isDark
      ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-600'
      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'
  }`;

  const labelBase = `block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`;
  const errorCls = 'text-red-500 dark:text-red-400 mt-1';

  const isStatusChanged = mode === 'edit' && shipment && form.currentStatus !== shipment.currentStatus;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(5px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className={`w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0 ${
              isDark ? 'border-slate-700' : 'border-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-blue-900/40' : 'bg-blue-50'
                }`}
              >
                <Package size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3
                  className={`${isDark ? 'text-slate-100' : 'text-slate-800'}`}
                  style={{ fontWeight: 700, fontSize: '1.0625rem' }}
                >
                  {mode === 'create' ? 'Tambah Kargo Baru' : 'Edit Data Kargo'}
                </h3>
                {mode === 'edit' && shipment && (
                  <p
                    className={`font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    {shipment.awb}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body (scrollable) */}
          <form id="cargo-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-5">

              {/* API Error */}
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50"
                >
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 dark:text-red-300" style={{ fontSize: '0.875rem' }}>
                    {apiError}
                  </p>
                </motion.div>
              )}

              {/* Section 1: Identifikasi */}
              <div>
                <p
                  className={`mb-3 pb-2 border-b ${isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-100'}`}
                  style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  Identifikasi Kargo
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* AWB */}
                  <div>
                    <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Nomor AWB <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.awb}
                      readOnly
                      aria-readonly="true"
                      placeholder="AT-YYMMDDXXXX"
                      className={`${inputBase} cursor-not-allowed font-mono opacity-70 ${errors.awb ? 'border-red-500' : ''}`}
                      style={{ fontSize: '0.875rem' }}
                    />
                    {errors.awb && <p className={errorCls} style={{ fontSize: '0.75rem' }}>{errors.awb}</p>}
                    {mode === 'create' && (
                      <p className={`mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontSize: '0.6875rem' }}>
                        Auto-generated - Tidak dapat diubah
                      </p>
                    )}
                  </div>

                  {/* Commodity */}
                  <div>
                    <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Jenis Barang <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={form.commodity}
                        onChange={(e) => set('commodity', e.target.value)}
                        className={`${inputBase} appearance-none pr-8 ${errors.commodity ? 'border-red-500' : ''}`}
                        style={{ fontSize: '0.875rem' }}
                      >
                        <option value="">Pilih jenis barang...</option>
                        {ITEM_TYPE_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
                    </div>
                    {errors.commodity && <p className={errorCls} style={{ fontSize: '0.75rem' }}>{errors.commodity}</p>}
                  </div>

                  {/* Shipping Date */}
                  <div>
                    <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Tanggal Kirim <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.shippingDate}
                      onChange={(e) => handleShippingDateChange(e.target.value)}
                      className={`${inputBase} ${errors.shippingDate ? 'border-red-500' : ''}`}
                      style={{ fontSize: '0.875rem' }}
                    />
                    {errors.shippingDate && <p className={errorCls} style={{ fontSize: '0.75rem' }}>{errors.shippingDate}</p>}
                  </div>
                </div>
              </div>

              {/* Section 2: Pengirim & Penerima */}
              <div>
                <p
                  className={`mb-3 pb-2 border-b ${isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-100'}`}
                  style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  Pengirim & Penerima
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Nama Pengirim <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.shipper}
                      onChange={(e) => set('shipper', e.target.value)}
                      placeholder="PT Nama Perusahaan / Nama Lengkap"
                      className={`${inputBase} ${errors.shipper ? 'border-red-500' : ''}`}
                      style={{ fontSize: '0.875rem' }}
                    />
                    {errors.shipper && <p className={errorCls} style={{ fontSize: '0.75rem' }}>{errors.shipper}</p>}
                  </div>
                  <div>
                    <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Telepon Pengirim <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.shipperPhone}
                      onChange={(e) => set('shipperPhone', e.target.value)}
                      placeholder="081234567890"
                      className={`${inputBase} ${errors.shipperPhone ? 'border-red-500' : ''}`}
                      style={{ fontSize: '0.875rem' }}
                    />
                    {errors.shipperPhone && <p className={errorCls} style={{ fontSize: '0.75rem' }}>{errors.shipperPhone}</p>}
                  </div>
                  <div>
                    <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Nama Penerima <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.consignee}
                      onChange={(e) => set('consignee', e.target.value)}
                      placeholder="PT Nama Perusahaan / Nama Lengkap"
                      className={`${inputBase} ${errors.consignee ? 'border-red-500' : ''}`}
                      style={{ fontSize: '0.875rem' }}
                    />
                    {errors.consignee && <p className={errorCls} style={{ fontSize: '0.75rem' }}>{errors.consignee}</p>}
                  </div>
                  <div>
                    <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Telepon Penerima <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.consigneePhone}
                      onChange={(e) => set('consigneePhone', e.target.value)}
                      placeholder="081234567890"
                      className={`${inputBase} ${errors.consigneePhone ? 'border-red-500' : ''}`}
                      style={{ fontSize: '0.875rem' }}
                    />
                    {errors.consigneePhone && <p className={errorCls} style={{ fontSize: '0.75rem' }}>{errors.consigneePhone}</p>}
                  </div>
                </div>
              </div>

              {/* Section 3: Rute */}
              <div>
                <p
                  className={`mb-3 pb-2 border-b ${isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-100'}`}
                  style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  Rute Pengiriman
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Origin */}
                  <div>
                    <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Bandara Asal <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={form.originCode}
                        onChange={(e) => handleOriginAirportChange(e.target.value)}
                        className={`${inputBase} appearance-none pr-8 ${errors.originCode ? 'border-red-500' : ''}`}
                        style={{ fontSize: '0.875rem' }}
                      >
                        <option value="">Pilih bandara asal...</option>
                        {AIRPORT_OPTIONS.map((a) => (
                          <option key={a.code} value={a.code}>
                            {a.code} - {a.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                    </div>
                    {errors.originCode && <p className={errorCls} style={{ fontSize: '0.75rem' }}>{errors.originCode}</p>}
                  </div>

                  {/* Destination */}
                  <div>
                    <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Bandara Tujuan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={form.destinationCode}
                        onChange={(e) => handleDestinationAirportChange(e.target.value)}
                        className={`${inputBase} appearance-none pr-8 ${errors.destinationCode ? 'border-red-500' : ''}`}
                        style={{ fontSize: '0.875rem' }}
                      >
                        <option value="">Pilih bandara tujuan...</option>
                        {AIRPORT_OPTIONS.filter((a) => a.code !== form.originCode).map((a) => (
                          <option key={a.code} value={a.code}>
                            {a.code} - {a.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                    </div>
                    {errors.destinationCode && <p className={errorCls} style={{ fontSize: '0.75rem' }}>{errors.destinationCode}</p>}
                  </div>

                  {/* Origin City */}
                  <div>
                    <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Kota Asal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.originCity}
                      onChange={(e) => set('originCity', e.target.value)}
                      placeholder="Jakarta"
                      className={`${inputBase} ${errors.originCity ? 'border-red-500' : ''}`}
                      style={{ fontSize: '0.875rem' }}
                    />
                    {errors.originCity && <p className={errorCls} style={{ fontSize: '0.75rem' }}>{errors.originCity}</p>}
                  </div>

                  {/* Destination City */}
                  <div>
                    <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Kota Tujuan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.destinationCity}
                      onChange={(e) => set('destinationCity', e.target.value)}
                      placeholder="Surabaya"
                      className={`${inputBase} ${errors.destinationCity ? 'border-red-500' : ''}`}
                      style={{ fontSize: '0.875rem' }}
                    />
                    {errors.destinationCity && <p className={errorCls} style={{ fontSize: '0.75rem' }}>{errors.destinationCity}</p>}
                  </div>

                  {/* Flight Number */}
                  <div>
                    <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      No. Penerbangan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={form.flightNumber}
                        onChange={(e) => handleFlightChange(e.target.value)}
                        className={`${inputBase} appearance-none pr-8 font-mono ${errors.flightNumber ? 'border-red-500' : ''}`}
                        style={{ fontSize: '0.875rem' }}
                      >
                        <option value="">Pilih penerbangan...</option>
                        {flights.map((flight) => {
                          const remainingCapacity = getFlightRemainingCapacity(
                            flight,
                            mode === 'edit' ? shipment : null
                          );
                          return (
                            <option key={flight.id} value={flight.flightNumber}>
                              {flight.flightNumber} - {flight.origin.code} ke {flight.destination.code} - sisa {remainingCapacity.toFixed(1)} kg
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                    </div>
                    {errors.flightNumber && <p className={errorCls} style={{ fontSize: '0.75rem' }}>{errors.flightNumber}</p>}
                  </div>

                  {/* Scheduled Departure */}
                  <div>
                    <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Jadwal Keberangkatan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={form.scheduledDeparture}
                      onChange={(e) => set('scheduledDeparture', e.target.value)}
                      className={`${inputBase} ${errors.scheduledDeparture ? 'border-red-500' : ''}`}
                      style={{ fontSize: '0.875rem' }}
                    />
                    {errors.scheduledDeparture && <p className={errorCls} style={{ fontSize: '0.75rem' }}>{errors.scheduledDeparture}</p>}
                  </div>
                </div>
              </div>

              {/* Section 4: Detail Fisik */}
              <div>
                <p
                  className={`mb-3 pb-2 border-b ${isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-100'}`}
                  style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  Detail Barang
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Berat (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.weight}
                      onChange={(e) => set('weight', e.target.value)}
                      placeholder="0.0"
                      min="0.1"
                      step="0.1"
                      className={`${inputBase} ${errors.weight ? 'border-red-500' : ''}`}
                      style={{ fontSize: '0.875rem' }}
                    />
                    {errors.weight && <p className={errorCls} style={{ fontSize: '0.75rem' }}>{errors.weight}</p>}
                    {form.flightNumber && !errors.weight && flights.some((flight) => flight.flightNumber === form.flightNumber) && (
                      <p className={`mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} style={{ fontSize: '0.6875rem' }}>
                        Sisa kapasitas: {getFlightRemainingCapacity(
                          flights.find((flight) => flight.flightNumber === form.flightNumber)!,
                          mode === 'edit' ? shipment : null
                        ).toFixed(1)} kg
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      Jumlah Barang <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.pieces}
                      onChange={(e) => set('pieces', e.target.value)}
                      placeholder="1"
                      min="1"
                      step="1"
                      className={`${inputBase} ${errors.pieces ? 'border-red-500' : ''}`}
                      style={{ fontSize: '0.875rem' }}
                    />
                    {errors.pieces && <p className={errorCls} style={{ fontSize: '0.75rem' }}>{errors.pieces}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                    Deskripsi / Catatan Barang
                  </label>
                  <textarea
                    value={form.itemDescription}
                    onChange={(e) => set('itemDescription', e.target.value)}
                    placeholder="Contoh: barang mudah pecah, perlu penanganan khusus, isi paket, atau catatan tambahan"
                    rows={3}
                    className={`${inputBase} resize-none`}
                    style={{ fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              {/* Section 5: Status */}
              <div>
                <p
                  className={`mb-3 pb-2 border-b ${isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-100'}`}
                  style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  Status Pengiriman
                </p>
                <div>
                  <label className={labelBase} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                    Status Saat Ini <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map((status) => {
                      const isSelected = form.currentStatus === status;
                      const statusColors: Record<EditableShipmentStatus, string> = {
                        Received: 'border-slate-400 bg-slate-50 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
                        'Loaded to Aircraft': 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                        Departed: 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
                        Arrived: 'border-green-400 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                      };
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => set('currentStatus', status)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? statusColors[status]
                              : isDark
                              ? 'border-slate-700 bg-slate-700/30 text-slate-400 hover:border-slate-600'
                              : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              isSelected
                                ? status === 'Received' ? 'bg-slate-500'
                                  : status === 'Loaded to Aircraft' ? 'bg-amber-500'
                                  : status === 'Departed' ? 'bg-indigo-500'
                                  : 'bg-green-500'
                                : isDark ? 'bg-slate-600' : 'bg-slate-300'
                            }`}
                          />
                          <span style={{ fontSize: '0.8125rem', fontWeight: isSelected ? 600 : 400 }}>
                            {STATUS_LABELS[status]}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Status change notice */}
                  {isStatusChanged && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/40"
                    >
                      <AlertCircle size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-blue-700 dark:text-blue-300" style={{ fontSize: '0.8125rem' }}>
                        Perubahan status akan otomatis dicatat dalam riwayat tracking AWB sebagai event baru.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

          </form>

          {/* Footer */}
          <div
            className={`flex gap-3 px-6 py-4 border-t flex-shrink-0 ${
              isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-slate-50/50'
            }`}
          >
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2.5 px-4 rounded-xl border transition-colors ${
                  isDark
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
                style={{ fontWeight: 500, fontSize: '0.875rem' }}
              >
                Batal
              </button>
              <button
                type="submit"
                form="cargo-modal-form"
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-colors flex items-center justify-center gap-2"
                style={{ fontWeight: 600, fontSize: '0.875rem' }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {loading
                  ? 'Menyimpan...'
                  : mode === 'create'
                  ? 'Tambah Kargo'
                  : 'Simpan Perubahan'}
              </button>
            </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
