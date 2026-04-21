'use client';

import { useApp } from '@/context/AppContext';
import { AdminDashboard } from './dashboard/AdminDashboard';
import { SupervisorDashboard } from './dashboard/SupervisorDashboard';
import { OperatorDashboard } from './dashboard/OperatorDashboard';

export function DashboardPage() {
  const { currentUser } = useApp();

  if (currentUser.role === 'admin') return <AdminDashboard />;
  if (currentUser.role === 'supervisor') return <SupervisorDashboard />;
  return <OperatorDashboard />;
}
