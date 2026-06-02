import type { Metadata } from 'next';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { ReportsPage } from '@/components/pages/ReportsPage';

export const metadata: Metadata = {
  title: 'Laporan & Statistik',
  description: 'Analisis performa shipment, kedatangan, dan ketepatan waktu.',
};

export default function ReportsRoute() {
  return (
    <RoleGuard allowedRoles={['admin', 'supervisor']} pageName="Laporan & Statistik">
      <ReportsPage />
    </RoleGuard>
  );
}
