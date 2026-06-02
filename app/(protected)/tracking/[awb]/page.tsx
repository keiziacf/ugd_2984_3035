import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AWBTrackingPage } from '@/components/pages/AWBTrackingPage';

export const metadata: Metadata = {
  title: 'Detail Tracking AWB',
  description: 'Detail perjalanan dan status terbaru kargo berdasarkan AWB.',
};

export default function TrackingDetailRoute() {
  return (
    <Suspense fallback={null}>
      <AWBTrackingPage />
    </Suspense>
  );
}
