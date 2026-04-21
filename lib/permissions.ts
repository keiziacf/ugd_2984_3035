export type UserRole = 'admin' | 'operator' | 'supervisor';

export interface Permission {
  routes: string[];
  features: {
    canManageUsers: boolean;
    canManageFlights: boolean;
    canViewReports: boolean;
    canExportData: boolean;
    canUpdateCargoStatus: boolean;
    canApproveActions: boolean;
    canViewSystemSettings: boolean;
    canManageSystemSettings: boolean;
    canViewAllAirports: boolean;
  };
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  admin: {
    routes: ['/', '/tracking', '/cargo', '/flights', '/reports', '/users', '/settings'],
    features: {
      canManageUsers: true,
      canManageFlights: true,
      canViewReports: true,
      canExportData: true,
      canUpdateCargoStatus: true,
      canApproveActions: true,
      canViewSystemSettings: true,
      canManageSystemSettings: true,
      canViewAllAirports: true,
    },
  },
  supervisor: {
    routes: ['/', '/tracking', '/cargo', '/flights', '/reports', '/settings'],
    features: {
      canManageUsers: false,
      canManageFlights: true,
      canViewReports: true,
      canExportData: true,
      canUpdateCargoStatus: false,
      canApproveActions: true,
      canViewSystemSettings: false,
      canManageSystemSettings: false,
      canViewAllAirports: false,
    },
  },
  operator: {
    routes: ['/', '/tracking', '/cargo', '/settings'],
    features: {
      canManageUsers: false,
      canManageFlights: false,
      canViewReports: false,
      canExportData: false,
      canUpdateCargoStatus: true,
      canApproveActions: false,
      canViewSystemSettings: false,
      canManageSystemSettings: false,
      canViewAllAirports: false,
    },
  },
};

export function hasRouteAccess(role: UserRole, path: string): boolean {
  const allowed = ROLE_PERMISSIONS[role].routes;
  if (allowed.includes(path)) return true;
  return allowed.some((r) => r !== '/' && path.startsWith(r));
}

export function hasFeature(role: UserRole, feature: keyof Permission['features']): boolean {
  return ROLE_PERMISSIONS[role].features[feature];
}

export const ROLE_META: Record<UserRole, {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  description: string;
}> = {
  admin: {
    label: 'Administrator',
    color: '#ef4444',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-400',
    borderClass: 'border-red-200 dark:border-red-800',
    description: 'Akses penuh ke seluruh sistem',
  },
  supervisor: {
    label: 'Supervisor',
    color: '#f59e0b',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-200 dark:border-amber-800',
    description: 'Pengawasan operasional & laporan',
  },
  operator: {
    label: 'Operator',
    color: '#1a56db',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-400',
    borderClass: 'border-blue-200 dark:border-blue-800',
    description: 'Operasional kargo harian',
  },
};

// All possible nav items (for displaying locked state)
export const ALL_NAV_ITEMS: { icon: string; label: string; path: string }[] = [
  { icon: 'LayoutDashboard', label: 'Dashboard', path: '/' },
  { icon: 'Search', label: 'Tracking AWB', path: '/tracking' },
  { icon: 'Package', label: 'Manajemen Kargo', path: '/cargo' },
  { icon: 'Plane', label: 'Manajemen Penerbangan', path: '/flights' },
  { icon: 'BarChart2', label: 'Laporan & Statistik', path: '/reports' },
  { icon: 'Users', label: 'Manajemen Pengguna', path: '/users' },
  { icon: 'Settings', label: 'Pengaturan', path: '/settings' },
];

export const NAV_ITEMS_BY_ROLE: Record<UserRole, { icon: string; label: string; path: string; description: string }[]> = {
  admin: [
    { icon: 'LayoutDashboard', label: 'Dashboard Sistem', path: '/', description: 'Overview seluruh sistem' },
    { icon: 'Search', label: 'Tracking AWB', path: '/tracking', description: 'Lacak kargo real-time' },
    { icon: 'Package', label: 'Manajemen Kargo', path: '/cargo', description: 'CRUD data shipment' },
    { icon: 'Plane', label: 'Manajemen Penerbangan', path: '/flights', description: 'Monitor semua penerbangan' },
    { icon: 'BarChart2', label: 'Laporan & Statistik', path: '/reports', description: 'Analisis & export data' },
    { icon: 'Users', label: 'Manajemen Pengguna', path: '/users', description: 'Kelola akun & hak akses' },
    { icon: 'Settings', label: 'Pengaturan Sistem', path: '/settings', description: 'Konfigurasi sistem' },
  ],
  supervisor: [
    { icon: 'LayoutDashboard', label: 'Dashboard', path: '/', description: 'Overview bandara' },
    { icon: 'Search', label: 'Tracking AWB', path: '/tracking', description: 'Lacak kargo real-time' },
    { icon: 'Package', label: 'Manajemen Kargo', path: '/cargo', description: 'Monitor data kargo' },
    { icon: 'Plane', label: 'Manajemen Penerbangan', path: '/flights', description: 'Monitor penerbangan' },
    { icon: 'BarChart2', label: 'Laporan & Statistik', path: '/reports', description: 'Analisis performa' },
    { icon: 'Settings', label: 'Pengaturan', path: '/settings', description: 'Preferensi akun' },
  ],
  operator: [
    { icon: 'LayoutDashboard', label: 'Dashboard', path: '/', description: 'Tugas hari ini' },
    { icon: 'Search', label: 'Tracking AWB', path: '/tracking', description: 'Lacak & update kargo' },
    { icon: 'Package', label: 'Manajemen Kargo', path: '/cargo', description: 'Input & update kargo' },
    { icon: 'Settings', label: 'Pengaturan', path: '/settings', description: 'Preferensi akun' },
  ],
};
