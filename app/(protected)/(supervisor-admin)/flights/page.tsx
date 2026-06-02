import type { Metadata } from 'next';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { FlightManagementPage } from '@/components/pages/FlightManagementPage';

export const metadata: Metadata = {
  title: 'Manajemen Penerbangan',
  description: 'Pantau jadwal, status, dan muatan kargo tiap penerbangan.',
};

export default function FlightsRoute() {
  return (
    <RoleGuard allowedRoles={['admin', 'supervisor']} pageName="Manajemen Penerbangan">
      <FlightManagementPage />
    </RoleGuard>
  );
}
