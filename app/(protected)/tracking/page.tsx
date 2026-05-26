import { Suspense } from 'react';
import { AWBTrackingPage } from '@/components/pages/AWBTrackingPage';

export default function TrackingRoute() {
  return (
    <Suspense fallback={null}>
      <AWBTrackingPage />
    </Suspense>
  );
}
