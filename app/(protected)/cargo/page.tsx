import type { Metadata } from 'next';
import { CargoPage } from '@/components/pages/CargoPage';

export const metadata: Metadata = {
  title: 'Manajemen Kargo',
  description: 'Kelola data shipment, status, rute, dan AWB kargo.',
};

export default function CargoRoute() {
  return <CargoPage />;
}
