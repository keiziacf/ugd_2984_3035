import { Suspense } from 'react';
import { AWBTrackingPage } from '@/components/pages/AWBTrackingPage';

export default function TrackingDetailRoute() {
  return (
    <Suspense fallback={null}>
      <AWBTrackingPage />
    </Suspense>
  );
}
