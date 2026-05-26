export type ShipmentStatus = 'Received' | 'Sortation' | 'Loaded to Aircraft' | 'Departed' | 'Arrived';

export interface TrackingEvent {
  status: ShipmentStatus;
  timestamp: string;
  location: string;
  officer: string;
  note: string;
}

export interface Shipment {
  awb: string;
  shipper: string;
  shipperPhone?: string;
  consignee: string;
  consigneePhone?: string;
  origin: { code: string; name: string };
  originCity?: string;
  destination: { code: string; name: string };
  destinationCity?: string;
  shippingDate?: string;
  weight: number;
  pieces: number;
  commodity: string;
  itemDescription?: string;
  flightNumber: string;
  scheduledDeparture: string;
  currentStatus: ShipmentStatus;
  tracking: TrackingEvent[];
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  origin: { code: string; name: string };
  destination: { code: string; name: string };
  scheduledDeparture: string;
  actualDeparture: string | null;
  status: 'on-time' | 'delayed' | 'departed' | 'cancelled';
  cargoCount: number;
  cargoWeight: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'supervisor';
  airport: string;
  lastLogin: string;
  status: 'active' | 'inactive';
}

export interface DailyStats {
  date: string;
  shipped: number;
  arrived: number;
  onTime: number;
  delayed: number;
}

export const TRACKING_STAGE_INFO: Record<ShipmentStatus, { label: string; description: string }> = {
  'Received': { label: 'Diterima di Gudang', description: 'Kargo telah diterima di gudang keberangkatan' },
  'Sortation': { label: 'Proses Sortasi', description: 'Kargo sedang dalam proses sortasi dan pengelompokan' },
  'Loaded to Aircraft': { label: 'Dimuat ke Pesawat', description: 'Kargo telah berhasil dimuat ke dalam pesawat' },
  'Departed': { label: 'Pesawat Berangkat', description: 'Pesawat telah berangkat dari bandara asal' },
  'Arrived': { label: 'Tiba di Tujuan', description: 'Kargo telah tiba dengan selamat di bandara tujuan' },
};

export const STAGE_ORDER: ShipmentStatus[] = [
  'Received', 'Sortation', 'Loaded to Aircraft', 'Departed', 'Arrived'
];

export const shipments: Record<string, Shipment> = {
  'AT-2604120001': {
    awb: 'AT-2604120001',
    shipper: 'PT Maju Jaya Tekstil',
    consignee: 'CV Bintang Abadi',
    origin: { code: 'CGK', name: 'Soekarno-Hatta' },
    destination: { code: 'SUB', name: 'Juanda' },
    weight: 125.5,
    pieces: 4,
    commodity: 'Tekstil',
    flightNumber: 'GA-412',
    scheduledDeparture: '12 Apr 2026, 13:00 WIB',
    currentStatus: 'Arrived',
    tracking: [
      { status: 'Received', timestamp: '12 Apr 2026, 07:30 WIB', location: 'CGK - Gudang Penerimaan, Terminal 2D', officer: 'Ahmad Saputra', note: 'Kargo diterima dalam kondisi baik, dokumen lengkap' },
      { status: 'Sortation', timestamp: '12 Apr 2026, 09:15 WIB', location: 'CGK - Area Sortasi Utara', officer: 'Dewi Rahayu', note: 'Kargo telah disortasi sesuai manifest, diprioritaskan untuk GA-412' },
      { status: 'Loaded to Aircraft', timestamp: '12 Apr 2026, 11:30 WIB', location: 'CGK - Gate B7, Penerbangan GA-412', officer: 'Rudi Hartono', note: 'Kargo tersegel dan terpasang dengan baik di kompartmen bawah' },
      { status: 'Departed', timestamp: '12 Apr 2026, 13:05 WIB', location: 'CGK - Runway 25L', officer: 'Sistem Otomatis', note: 'Penerbangan GA-412 berangkat, keterlambatan 5 menit dari jadwal' },
      { status: 'Arrived', timestamp: '12 Apr 2026, 14:20 WIB', location: 'SUB - Bandara Internasional Juanda, Terminal 2', officer: 'Siti Nurhaliza', note: 'Kargo tiba dalam kondisi baik, siap untuk diambil' },
    ],
  },
  'AT-2604120002': {
    awb: 'AT-2604120002',
    shipper: 'PT Sumber Makmur Elektronik',
    consignee: 'Toko Elektronik Jaya',
    origin: { code: 'CGK', name: 'Soekarno-Hatta' },
    destination: { code: 'DPS', name: 'Ngurah Rai' },
    weight: 78.2,
    pieces: 2,
    commodity: 'Elektronik',
    flightNumber: 'QG-682',
    scheduledDeparture: '12 Apr 2026, 15:30 WIB',
    currentStatus: 'Departed',
    tracking: [
      { status: 'Received', timestamp: '12 Apr 2026, 08:00 WIB', location: 'CGK - Gudang Penerimaan, Terminal 3', officer: 'Bambang Susilo', note: 'Kargo elektronik diterima, pengecekan keamanan selesai' },
      { status: 'Sortation', timestamp: '12 Apr 2026, 10:45 WIB', location: 'CGK - Area Sortasi Selatan', officer: 'Maya Indah', note: 'Penanganan khusus untuk barang elektronik fragile' },
      { status: 'Loaded to Aircraft', timestamp: '12 Apr 2026, 13:45 WIB', location: 'CGK - Gate C12, Penerbangan QG-682', officer: 'Hendra Setiawan', note: 'Kargo dimuat dengan penanganan khusus, bubble wrap terpasang' },
      { status: 'Departed', timestamp: '12 Apr 2026, 15:40 WIB', location: 'CGK - Runway 25R', officer: 'Sistem Otomatis', note: 'Penerbangan QG-682 berangkat, keterlambatan 10 menit' },
    ],
  },
  'AT-2604120003': {
    awb: 'AT-2604120003',
    shipper: 'PT Garuda Logistik',
    consignee: 'CV Anugerah Nusantara',
    origin: { code: 'CGK', name: 'Soekarno-Hatta' },
    destination: { code: 'UPG', name: 'Hasanuddin' },
    weight: 210.0,
    pieces: 8,
    commodity: 'Spare Parts',
    flightNumber: 'GA-632',
    scheduledDeparture: '12 Apr 2026, 17:00 WIB',
    currentStatus: 'Loaded to Aircraft',
    tracking: [
      { status: 'Received', timestamp: '12 Apr 2026, 09:30 WIB', location: 'CGK - Gudang Penerimaan, Terminal 2D', officer: 'Fajar Nugroho', note: 'Total 8 barang spare parts diterima, dokumen lengkap' },
      { status: 'Sortation', timestamp: '12 Apr 2026, 11:00 WIB', location: 'CGK - Area Sortasi Utara', officer: 'Rina Marlina', note: 'Kargo disortasi sesuai rute UPG, penanganan heavy cargo' },
      { status: 'Loaded to Aircraft', timestamp: '12 Apr 2026, 15:30 WIB', location: 'CGK - Gate A3, Penerbangan GA-632', officer: 'Dedi Kurniawan', note: 'Kargo dimuat ke kompartmen kargo bawah, posisi dikonfirmasi' },
    ],
  },
  'AT-2604120004': {
    awb: 'AT-2604120004',
    shipper: 'UD Wahyu Jaya Trading',
    consignee: 'PT Nusantara Commerce',
    origin: { code: 'SUB', name: 'Juanda' },
    destination: { code: 'CGK', name: 'Soekarno-Hatta' },
    weight: 45.0,
    pieces: 1,
    commodity: 'Dokumen Penting',
    flightNumber: 'JT-711',
    scheduledDeparture: '12 Apr 2026, 16:45 WIB',
    currentStatus: 'Sortation',
    tracking: [
      { status: 'Received', timestamp: '12 Apr 2026, 10:00 WIB', location: 'SUB - Gudang Penerimaan, Terminal Kargo', officer: 'Agus Santoso', note: 'Dokumen penting diterima, penanganan prioritas' },
      { status: 'Sortation', timestamp: '12 Apr 2026, 12:30 WIB', location: 'SUB - Area Sortasi', officer: 'Lina Permata', note: 'Sedang dalam proses sortasi untuk penerbangan JT-711' },
    ],
  },
  'AT-2604120005': {
    awb: 'AT-2604120005',
    shipper: 'PT Bali Fresh Produce',
    consignee: 'Pasar Segar Jakarta',
    origin: { code: 'DPS', name: 'Ngurah Rai' },
    destination: { code: 'CGK', name: 'Soekarno-Hatta' },
    weight: 320.5,
    pieces: 12,
    commodity: 'Produk Segar',
    flightNumber: 'GA-440',
    scheduledDeparture: '12 Apr 2026, 18:00 WIB',
    currentStatus: 'Received',
    tracking: [
      { status: 'Received', timestamp: '12 Apr 2026, 14:00 WIB', location: 'DPS - Gudang Kargo, Terminal Internasional', officer: 'Wayan Sudana', note: 'Produk segar diterima, penyimpanan di cold storage' },
    ],
  },
  'AT-2604120006': {
    awb: 'AT-2604120006',
    shipper: 'PT Kimia Farma Tbk',
    consignee: 'Apotek Sehat Sejahtera',
    origin: { code: 'CGK', name: 'Soekarno-Hatta' },
    destination: { code: 'KNO', name: 'Kualanamu' },
    weight: 89.0,
    pieces: 3,
    commodity: 'Obat-obatan',
    flightNumber: 'ID-6580',
    scheduledDeparture: '12 Apr 2026, 09:00 WIB',
    currentStatus: 'Arrived',
    tracking: [
      { status: 'Received', timestamp: '12 Apr 2026, 05:30 WIB', location: 'CGK - Gudang Penerimaan, Terminal 2D', officer: 'Endah Susanti', note: 'Obat-obatan diterima, penyimpanan suhu terkontrol' },
      { status: 'Sortation', timestamp: '12 Apr 2026, 06:45 WIB', location: 'CGK - Area Sortasi Farmasi', officer: 'Teguh Prasetyo', note: 'Disortasi dengan penanganan cold chain' },
      { status: 'Loaded to Aircraft', timestamp: '12 Apr 2026, 07:30 WIB', location: 'CGK - Gate D8, Penerbangan ID-6580', officer: 'Yuni Astuti', note: 'Dimuat ke kompartmen khusus obat-obatan' },
      { status: 'Departed', timestamp: '12 Apr 2026, 09:00 WIB', location: 'CGK - Runway 25L', officer: 'Sistem Otomatis', note: 'Penerbangan ID-6580 berangkat tepat waktu' },
      { status: 'Arrived', timestamp: '12 Apr 2026, 11:15 WIB', location: 'KNO - Bandara Kualanamu, Terminal Kargo', officer: 'Harun Nasution', note: 'Kargo tiba dalam kondisi baik, cold chain terjaga' },
    ],
  },
  'AT-2604120007': {
    awb: 'AT-2604120007',
    shipper: 'PT Bank BNI',
    consignee: 'PT Bank BNI Cabang PLM',
    origin: { code: 'CGK', name: 'Soekarno-Hatta' },
    destination: { code: 'PLM', name: 'SMB II Palembang' },
    weight: 15.0,
    pieces: 1,
    commodity: 'Dokumen Keuangan',
    flightNumber: 'SJ-201',
    scheduledDeparture: '12 Apr 2026, 08:30 WIB',
    currentStatus: 'Arrived',
    tracking: [
      { status: 'Received', timestamp: '12 Apr 2026, 05:00 WIB', location: 'CGK - Gudang Penerimaan, Terminal 2D', officer: 'Ratna Dewi', note: 'Dokumen keuangan diterima, keamanan tinggi' },
      { status: 'Sortation', timestamp: '12 Apr 2026, 06:00 WIB', location: 'CGK - Area Sortasi', officer: 'Wahyu Santoso', note: 'Prioritas penanganan tinggi' },
      { status: 'Loaded to Aircraft', timestamp: '12 Apr 2026, 07:15 WIB', location: 'CGK - Gate B4', officer: 'Irwan Setiawan', note: 'Dokumen diamankan di kompartmen khusus' },
      { status: 'Departed', timestamp: '12 Apr 2026, 08:35 WIB', location: 'CGK - Runway 25R', officer: 'Sistem Otomatis', note: 'Penerbangan SJ-201 berangkat' },
      { status: 'Arrived', timestamp: '12 Apr 2026, 09:45 WIB', location: 'PLM - Bandara SMB II, Terminal Kargo', officer: 'Amir Hamzah', note: 'Dokumen tiba dalam kondisi tersegel dan aman' },
    ],
  },
  'AT-2604120008': {
    awb: 'AT-2604120008',
    shipper: 'PT Sumatra Raya Trading',
    consignee: 'PT Jaya Retail Indonesia',
    origin: { code: 'KNO', name: 'Kualanamu' },
    destination: { code: 'CGK', name: 'Soekarno-Hatta' },
    weight: 156.0,
    pieces: 6,
    commodity: 'Produk Pertanian',
    flightNumber: 'GA-181',
    scheduledDeparture: '12 Apr 2026, 14:00 WIB',
    currentStatus: 'Departed',
    tracking: [
      { status: 'Received', timestamp: '12 Apr 2026, 08:30 WIB', location: 'KNO - Gudang Kargo', officer: 'Benny Siagian', note: 'Kargo pertanian diterima' },
      { status: 'Sortation', timestamp: '12 Apr 2026, 10:00 WIB', location: 'KNO - Area Sortasi', officer: 'Dina Saragih', note: 'Kargo disortasi untuk penerbangan GA-181' },
      { status: 'Loaded to Aircraft', timestamp: '12 Apr 2026, 12:30 WIB', location: 'KNO - Gate A1, Penerbangan GA-181', officer: 'Maruli Situmorang', note: 'Kargo dimuat ke pesawat' },
      { status: 'Departed', timestamp: '12 Apr 2026, 14:10 WIB', location: 'KNO - Runway 05', officer: 'Sistem Otomatis', note: 'Penerbangan GA-181 berangkat' },
    ],
  },
  'AT-2604120009': {
    awb: 'AT-2604120009',
    shipper: 'PT Mesin Industri Makmur',
    consignee: 'PT Adi Karya Konstruksi',
    origin: { code: 'CGK', name: 'Soekarno-Hatta' },
    destination: { code: 'SOC', name: 'Adi Soemarmo Solo' },
    weight: 450.0,
    pieces: 3,
    commodity: 'Mesin Industri',
    flightNumber: 'GA-222',
    scheduledDeparture: '12 Apr 2026, 16:00 WIB',
    currentStatus: 'Departed',
    tracking: [
      { status: 'Received', timestamp: '12 Apr 2026, 10:00 WIB', location: 'CGK - Gudang Kargo Berat, Terminal 2D', officer: 'Sudarman Joko', note: 'Mesin industri diterima, heavy cargo handler diperlukan' },
      { status: 'Sortation', timestamp: '12 Apr 2026, 12:00 WIB', location: 'CGK - Area Sortasi Heavy Cargo', officer: 'Puji Lestari', note: 'Dikategorikan heavy cargo, penanganan khusus' },
      { status: 'Loaded to Aircraft', timestamp: '12 Apr 2026, 14:30 WIB', location: 'CGK - Gate A1, Penerbangan GA-222', officer: 'Syaiful Bahri', note: 'Mesin dimuat dengan crane, dikonfirmasi aman' },
      { status: 'Departed', timestamp: '12 Apr 2026, 16:00 WIB', location: 'CGK - Runway 25L', officer: 'Sistem Otomatis', note: 'GA-222 berangkat tepat waktu' },
    ],
  },
  'AT-2604120010': {
    awb: 'AT-2604120010',
    shipper: 'PT Perhiasan Nusantara',
    consignee: 'Toko Emas Abadi Yogyakarta',
    origin: { code: 'CGK', name: 'Soekarno-Hatta' },
    destination: { code: 'JOG', name: 'Adisutjipto Yogyakarta' },
    weight: 5.5,
    pieces: 1,
    commodity: 'Perhiasan',
    flightNumber: 'JT-539',
    scheduledDeparture: '12 Apr 2026, 17:30 WIB',
    currentStatus: 'Loaded to Aircraft',
    tracking: [
      { status: 'Received', timestamp: '12 Apr 2026, 12:00 WIB', location: 'CGK - Gudang Penerimaan, Terminal 3', officer: 'Kartini Sari', note: 'Perhiasan diterima, valuables handler diperlukan' },
      { status: 'Sortation', timestamp: '12 Apr 2026, 13:30 WIB', location: 'CGK - Area Valuables', officer: 'Anton Wijaya', note: 'Kargo berharga disortasi dengan pengamanan tinggi' },
      { status: 'Loaded to Aircraft', timestamp: '12 Apr 2026, 16:00 WIB', location: 'CGK - Gate C5, Penerbangan JT-539', officer: 'Rizal Fadillah', note: 'Dimuat ke kompartmen khusus barang berharga' },
    ],
  },
  'AT-2604120011': {
    awb: 'AT-2604120011',
    shipper: 'PT Makassar Agro',
    consignee: 'PT Segar Nusantara Jakarta',
    origin: { code: 'UPG', name: 'Hasanuddin' },
    destination: { code: 'CGK', name: 'Soekarno-Hatta' },
    weight: 280.0,
    pieces: 10,
    commodity: 'Buah-buahan',
    flightNumber: 'GA-672',
    scheduledDeparture: '12 Apr 2026, 10:00 WIB',
    currentStatus: 'Arrived',
    tracking: [
      { status: 'Received', timestamp: '12 Apr 2026, 05:00 WIB', location: 'UPG - Gudang Kargo', officer: 'Syahrial Wahid', note: 'Buah-buahan segar diterima, cold storage tersedia' },
      { status: 'Sortation', timestamp: '12 Apr 2026, 06:30 WIB', location: 'UPG - Area Sortasi', officer: 'Hasna Muhajir', note: 'Kargo disortasi, penyimpanan suhu dingin aktif' },
      { status: 'Loaded to Aircraft', timestamp: '12 Apr 2026, 08:30 WIB', location: 'UPG - Gate B2, Penerbangan GA-672', officer: 'Rahmat Hidayat', note: 'Dimuat ke kompartmen dingin' },
      { status: 'Departed', timestamp: '12 Apr 2026, 10:05 WIB', location: 'UPG - Runway 13', officer: 'Sistem Otomatis', note: 'GA-672 berangkat, on-time' },
      { status: 'Arrived', timestamp: '12 Apr 2026, 13:20 WIB', location: 'CGK - Terminal Kargo Internasional', officer: 'Bambang Sutrisno', note: 'Buah-buahan tiba segar dalam kondisi baik' },
    ],
  },
  'AT-2604120012': {
    awb: 'AT-2604120012',
    shipper: 'PT Fashion House Indonesia',
    consignee: 'Matahari Dept. Store Semarang',
    origin: { code: 'CGK', name: 'Soekarno-Hatta' },
    destination: { code: 'SRG', name: 'Ahmad Yani Semarang' },
    weight: 95.0,
    pieces: 5,
    commodity: 'Pakaian Jadi',
    flightNumber: 'GA-238',
    scheduledDeparture: '12 Apr 2026, 18:30 WIB',
    currentStatus: 'Sortation',
    tracking: [
      { status: 'Received', timestamp: '12 Apr 2026, 13:00 WIB', location: 'CGK - Gudang Penerimaan, Terminal 3', officer: 'Indah Kusuma', note: 'Pakaian jadi diterima dalam 5 barang' },
      { status: 'Sortation', timestamp: '12 Apr 2026, 15:00 WIB', location: 'CGK - Area Sortasi', officer: 'Budi Santoso', note: 'Sedang dalam proses sortasi untuk penerbangan GA-238' },
    ],
  },
  'AT-2604120013': {
    awb: 'AT-2604120013',
    shipper: 'PT Kaltim Mining Corp',
    consignee: 'PT National Resources Jakarta',
    origin: { code: 'BPN', name: 'Sultan Aji Muhammad Sulaiman' },
    destination: { code: 'CGK', name: 'Soekarno-Hatta' },
    weight: 175.0,
    pieces: 4,
    commodity: 'Sampel Mineral',
    flightNumber: 'QG-972',
    scheduledDeparture: '12 Apr 2026, 11:00 WIB',
    currentStatus: 'Arrived',
    tracking: [
      { status: 'Received', timestamp: '12 Apr 2026, 06:00 WIB', location: 'BPN - Gudang Kargo', officer: 'Irfan Hakim', note: 'Sampel mineral diterima' },
      { status: 'Sortation', timestamp: '12 Apr 2026, 07:30 WIB', location: 'BPN - Area Sortasi', officer: 'Novi Rahayu', note: 'Kargo disortasi, dokumentasi lengkap' },
      { status: 'Loaded to Aircraft', timestamp: '12 Apr 2026, 09:15 WIB', location: 'BPN - Gate A1, Penerbangan QG-972', officer: 'Eko Prasetyo', note: 'Kargo dimuat ke pesawat' },
      { status: 'Departed', timestamp: '12 Apr 2026, 11:05 WIB', location: 'BPN - Runway 07', officer: 'Sistem Otomatis', note: 'QG-972 berangkat tepat waktu' },
      { status: 'Arrived', timestamp: '12 Apr 2026, 13:50 WIB', location: 'CGK - Terminal Kargo Internasional', officer: 'Wulandari Sari', note: 'Kargo tiba, proses dokumentasi berjalan' },
    ],
  },
  'AT-2604120014': {
    awb: 'AT-2604120014',
    shipper: 'PT Pertamina Tbk',
    consignee: 'PT Pertamina Kaltim',
    origin: { code: 'CGK', name: 'Soekarno-Hatta' },
    destination: { code: 'BPN', name: 'Sultan Aji Muhammad Sulaiman' },
    weight: 55.0,
    pieces: 2,
    commodity: 'Suku Cadang Industri',
    flightNumber: 'QG-973',
    scheduledDeparture: '12 Apr 2026, 19:00 WIB',
    currentStatus: 'Received',
    tracking: [
      { status: 'Received', timestamp: '12 Apr 2026, 15:30 WIB', location: 'CGK - Gudang Penerimaan, Terminal 2D', officer: 'Arif Budiman', note: 'Suku cadang industri diterima, dokumen perlu diverifikasi' },
    ],
  },
  'AT-2604120015': {
    awb: 'AT-2604120015',
    shipper: 'PT Surya Mandiri Travel',
    consignee: 'Bali Indah Resort & Spa',
    origin: { code: 'SUB', name: 'Juanda' },
    destination: { code: 'DPS', name: 'Ngurah Rai' },
    weight: 38.0,
    pieces: 2,
    commodity: 'Perlengkapan Hotel',
    flightNumber: 'JT-846',
    scheduledDeparture: '12 Apr 2026, 15:00 WIB',
    currentStatus: 'Departed',
    tracking: [
      { status: 'Received', timestamp: '12 Apr 2026, 10:30 WIB', location: 'SUB - Gudang Kargo, Terminal Domestik', officer: 'Aditya Eka', note: 'Perlengkapan hotel diterima' },
      { status: 'Sortation', timestamp: '12 Apr 2026, 12:00 WIB', location: 'SUB - Area Sortasi', officer: 'Tri Wahyuni', note: 'Kargo disortasi untuk JT-846' },
      { status: 'Loaded to Aircraft', timestamp: '12 Apr 2026, 13:30 WIB', location: 'SUB - Gate B3, Penerbangan JT-846', officer: 'Dony Setiawan', note: 'Kargo dimuat ke pesawat' },
      { status: 'Departed', timestamp: '12 Apr 2026, 15:00 WIB', location: 'SUB - Runway 10', officer: 'Sistem Otomatis', note: 'JT-846 berangkat tepat waktu' },
    ],
  },
};

export const todayShipmentsList: Shipment[] = Object.values(shipments);

export const flights: Flight[] = [
  { id: 'f1', flightNumber: 'GA-412', airline: 'Garuda Indonesia', origin: { code: 'CGK', name: 'Soekarno-Hatta' }, destination: { code: 'SUB', name: 'Juanda' }, scheduledDeparture: '13:00', actualDeparture: '13:05', status: 'departed', cargoCount: 4, cargoWeight: 125.5 },
  { id: 'f2', flightNumber: 'QG-682', airline: 'Citilink', origin: { code: 'CGK', name: 'Soekarno-Hatta' }, destination: { code: 'DPS', name: 'Ngurah Rai' }, scheduledDeparture: '15:30', actualDeparture: '15:40', status: 'departed', cargoCount: 2, cargoWeight: 78.2 },
  { id: 'f3', flightNumber: 'GA-632', airline: 'Garuda Indonesia', origin: { code: 'CGK', name: 'Soekarno-Hatta' }, destination: { code: 'UPG', name: 'Hasanuddin' }, scheduledDeparture: '17:00', actualDeparture: null, status: 'on-time', cargoCount: 8, cargoWeight: 210.0 },
  { id: 'f4', flightNumber: 'JT-711', airline: 'Lion Air', origin: { code: 'SUB', name: 'Juanda' }, destination: { code: 'CGK', name: 'Soekarno-Hatta' }, scheduledDeparture: '16:45', actualDeparture: null, status: 'delayed', cargoCount: 1, cargoWeight: 45.0 },
  { id: 'f5', flightNumber: 'GA-440', airline: 'Garuda Indonesia', origin: { code: 'DPS', name: 'Ngurah Rai' }, destination: { code: 'CGK', name: 'Soekarno-Hatta' }, scheduledDeparture: '18:00', actualDeparture: null, status: 'on-time', cargoCount: 12, cargoWeight: 320.5 },
  { id: 'f6', flightNumber: 'ID-6580', airline: 'Batik Air', origin: { code: 'CGK', name: 'Soekarno-Hatta' }, destination: { code: 'KNO', name: 'Kualanamu' }, scheduledDeparture: '09:00', actualDeparture: '09:00', status: 'departed', cargoCount: 3, cargoWeight: 89.0 },
  { id: 'f7', flightNumber: 'SJ-201', airline: 'Sriwijaya Air', origin: { code: 'CGK', name: 'Soekarno-Hatta' }, destination: { code: 'PLM', name: 'SMB II Palembang' }, scheduledDeparture: '08:30', actualDeparture: '08:35', status: 'departed', cargoCount: 1, cargoWeight: 15.0 },
  { id: 'f8', flightNumber: 'GA-181', airline: 'Garuda Indonesia', origin: { code: 'KNO', name: 'Kualanamu' }, destination: { code: 'CGK', name: 'Soekarno-Hatta' }, scheduledDeparture: '14:00', actualDeparture: '14:10', status: 'departed', cargoCount: 6, cargoWeight: 156.0 },
  { id: 'f9', flightNumber: 'GA-222', airline: 'Garuda Indonesia', origin: { code: 'CGK', name: 'Soekarno-Hatta' }, destination: { code: 'SOC', name: 'Adi Soemarmo Solo' }, scheduledDeparture: '16:00', actualDeparture: '16:00', status: 'departed', cargoCount: 3, cargoWeight: 450.0 },
  { id: 'f10', flightNumber: 'JT-539', airline: 'Lion Air', origin: { code: 'CGK', name: 'Soekarno-Hatta' }, destination: { code: 'JOG', name: 'Adisutjipto Yogyakarta' }, scheduledDeparture: '17:30', actualDeparture: null, status: 'on-time', cargoCount: 1, cargoWeight: 5.5 },
  { id: 'f11', flightNumber: 'GA-672', airline: 'Garuda Indonesia', origin: { code: 'UPG', name: 'Hasanuddin' }, destination: { code: 'CGK', name: 'Soekarno-Hatta' }, scheduledDeparture: '10:00', actualDeparture: '10:05', status: 'departed', cargoCount: 10, cargoWeight: 280.0 },
  { id: 'f12', flightNumber: 'GA-238', airline: 'Garuda Indonesia', origin: { code: 'CGK', name: 'Soekarno-Hatta' }, destination: { code: 'SRG', name: 'Ahmad Yani Semarang' }, scheduledDeparture: '18:30', actualDeparture: null, status: 'delayed', cargoCount: 5, cargoWeight: 95.0 },
  { id: 'f13', flightNumber: 'QG-972', airline: 'Citilink', origin: { code: 'BPN', name: 'Sultan Aji Muhammad Sulaiman' }, destination: { code: 'CGK', name: 'Soekarno-Hatta' }, scheduledDeparture: '11:00', actualDeparture: '11:05', status: 'departed', cargoCount: 4, cargoWeight: 175.0 },
  { id: 'f14', flightNumber: 'QG-973', airline: 'Citilink', origin: { code: 'CGK', name: 'Soekarno-Hatta' }, destination: { code: 'BPN', name: 'Sultan Aji Muhammad Sulaiman' }, scheduledDeparture: '19:00', actualDeparture: null, status: 'on-time', cargoCount: 2, cargoWeight: 55.0 },
  { id: 'f15', flightNumber: 'JT-846', airline: 'Lion Air', origin: { code: 'SUB', name: 'Juanda' }, destination: { code: 'DPS', name: 'Ngurah Rai' }, scheduledDeparture: '15:00', actualDeparture: '15:00', status: 'departed', cargoCount: 2, cargoWeight: 38.0 },
];

export const users: User[] = [
  { id: 1, name: 'Supervisor Operasional', email: 'supervisor@gmail.com', role: 'supervisor', airport: 'CGK', lastLogin: '12 Apr 2026, 07:00 WIB', status: 'active' },
  { id: 2, name: 'Operator Kargo', email: 'operator@gmail.com', role: 'operator', airport: 'CGK', lastLogin: '12 Apr 2026, 07:25 WIB', status: 'active' },
  { id: 3, name: 'Dewi Rahayu', email: 'dewi.rahayu@aerotrack.co.id', role: 'operator', airport: 'CGK', lastLogin: '12 Apr 2026, 08:30 WIB', status: 'active' },
  { id: 4, name: 'Hendra Setiawan', email: 'hendra.setiawan@aerotrack.co.id', role: 'operator', airport: 'CGK', lastLogin: '12 Apr 2026, 09:00 WIB', status: 'active' },
  { id: 5, name: 'Siti Nurhaliza', email: 'siti.nurhaliza@aerotrack.co.id', role: 'operator', airport: 'SUB', lastLogin: '12 Apr 2026, 06:45 WIB', status: 'active' },
  { id: 6, name: 'Agus Santoso', email: 'agus.santoso@aerotrack.co.id', role: 'operator', airport: 'SUB', lastLogin: '12 Apr 2026, 09:50 WIB', status: 'active' },
  { id: 7, name: 'Wayan Sudana', email: 'wayan.sudana@aerotrack.co.id', role: 'supervisor', airport: 'DPS', lastLogin: '12 Apr 2026, 13:30 WIB', status: 'active' },
  { id: 8, name: 'Harun Nasution', email: 'harun.nasution@aerotrack.co.id', role: 'operator', airport: 'KNO', lastLogin: '12 Apr 2026, 10:00 WIB', status: 'active' },
  { id: 9, name: 'Syahrial Wahid', email: 'syahrial.wahid@aerotrack.co.id', role: 'supervisor', airport: 'UPG', lastLogin: '11 Apr 2026, 17:00 WIB', status: 'inactive' },
  { id: 10, name: 'Admin Sistem', email: 'admin@gmail.com', role: 'admin', airport: 'HQ', lastLogin: '12 Apr 2026, 06:00 WIB', status: 'active' },
];

export const weeklyStats: DailyStats[] = [
  { date: '6 Apr', shipped: 52, arrived: 48, onTime: 10, delayed: 2 },
  { date: '7 Apr', shipped: 45, arrived: 41, onTime: 9, delayed: 1 },
  { date: '8 Apr', shipped: 67, arrived: 61, onTime: 13, delayed: 3 },
  { date: '9 Apr', shipped: 73, arrived: 70, onTime: 14, delayed: 2 },
  { date: '10 Apr', shipped: 58, arrived: 55, onTime: 11, delayed: 1 },
  { date: '11 Apr', shipped: 81, arrived: 75, onTime: 15, delayed: 3 },
  { date: '12 Apr', shipped: 48, arrived: 38, onTime: 12, delayed: 3 },
];

export const recentActivity = [
  { awb: 'AT-2604120001', event: 'Tiba di Tujuan', location: 'SUB - Juanda', time: '14:20 WIB', type: 'arrived' as const },
  { awb: 'AT-2604120013', event: 'Tiba di Tujuan', location: 'CGK - Soekarno-Hatta', time: '13:50 WIB', type: 'arrived' as const },
  { awb: 'AT-2604120011', event: 'Tiba di Tujuan', location: 'CGK - Soekarno-Hatta', time: '13:20 WIB', type: 'arrived' as const },
  { awb: 'AT-2604120009', event: 'Pesawat Berangkat', location: 'CGK - Soekarno-Hatta', time: '16:00 WIB', type: 'departed' as const },
  { awb: 'AT-2604120010', event: 'Dimuat ke Pesawat', location: 'CGK - Gate C5', time: '16:00 WIB', type: 'loaded' as const },
  { awb: 'AT-2604120012', event: 'Proses Sortasi', location: 'CGK - Area Sortasi', time: '15:00 WIB', type: 'sortation' as const },
  { awb: 'AT-2604120014', event: 'Diterima di Gudang', location: 'CGK - Terminal 2D', time: '15:30 WIB', type: 'received' as const },
];
