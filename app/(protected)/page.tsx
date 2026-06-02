import type { Metadata } from 'next';
import { DashboardPage } from '@/components/pages/DashboardPage';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Ringkasan operasional kargo dan penerbangan Aero Track.',
};

export default function DashboardRoute() {
  return <DashboardPage />;
}
