import type { Metadata } from 'next';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { UsersPage } from '@/components/pages/UsersPage';

export const metadata: Metadata = {
  title: 'Manajemen Pengguna',
  description: 'Kelola akun dan akses pengguna Aero Track.',
};

export default function UsersRoute() {
  return (
    <RoleGuard allowedRoles={['admin']} pageName="Manajemen Pengguna">
      <UsersPage />
    </RoleGuard>
  );
}
