import { RoleGuard } from '@/components/layout/RoleGuard';
import { UsersPage } from '@/components/pages/UsersPage';

export default function UsersRoute() {
  return (
    <RoleGuard allowedRoles={['admin']} pageName="Manajemen Pengguna">
      <UsersPage />
    </RoleGuard>
  );
}
