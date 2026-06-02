import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AWBTrackingPage } from '@/components/pages/AWBTrackingPage';

export const metadata: Metadata = {
  title: 'Tracking AWB',
  description: 'Cari dan pantau riwayat tracking kargo berdasarkan nomor AWB.',
};

export default function TrackingRoute() {
  return (
    <Suspense fallback={null}>
      <AWBTrackingPage />
    </Suspense>
  );
}
