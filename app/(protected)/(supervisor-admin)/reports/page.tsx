import { RoleGuard } from '@/components/layout/RoleGuard';
import { ReportsPage } from '@/components/pages/ReportsPage';

export default function ReportsRoute() {
  return (
    <RoleGuard allowedRoles={['admin', 'supervisor']} pageName="Laporan & Statistik">
      <ReportsPage />
    </RoleGuard>
  );
}
