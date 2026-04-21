'use client';

import type { ReactNode } from 'react';
import { useApp } from '@/context/AppContext';
import { AccessDenied } from '../ui/AccessDenied';
import type { UserRole } from '@/lib/permissions';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  pageName?: string;
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, pageName, children }: RoleGuardProps) {
  const { currentUser, hydrated, isAuthenticated } = useApp();

  if (!hydrated || !isAuthenticated) return null;

  if (!allowedRoles.includes(currentUser.role)) {
    const requiredLabel = allowedRoles
      .map((r) => ({ admin: 'Administrator', supervisor: 'Supervisor', operator: 'Operator' }[r]))
      .join(' atau ');
    return <AccessDenied requiredRole={requiredLabel} pageName={pageName} />;
  }

  return <>{children}</>;
}
