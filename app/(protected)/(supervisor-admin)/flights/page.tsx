import { RoleGuard } from '@/components/layout/RoleGuard';
import { FlightManagementPage } from '@/components/pages/FlightManagementPage';

export default function FlightsRoute() {
  return (
    <RoleGuard allowedRoles={['admin', 'supervisor']} pageName="Manajemen Penerbangan">
      <FlightManagementPage />
    </RoleGuard>
  );
}
