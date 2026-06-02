import type { Metadata } from 'next';
import { LandingPage } from '@/components/pages/LandingPage';

export const metadata: Metadata = {
  title: 'Landing',
  description: 'Halaman pengantar sistem Aero Track.',
};

export default function LandingRoute() {
  return <LandingPage />;
}
