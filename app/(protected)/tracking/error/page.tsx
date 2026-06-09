import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AWBTrackingErrorPage } from '@/components/pages/AWBTrackingErrorPage';

export const metadata: Metadata = {
  title: 'Tracking AWB Tidak Ditemukan',
  description: 'Halaman informasi ketika AWB atau kata kunci tracking tidak ditemukan.',
};

export default function TrackingErrorRoute() {
  return (
    <Suspense fallback={null}>
      <AWBTrackingErrorPage />
    </Suspense>
  );
}
