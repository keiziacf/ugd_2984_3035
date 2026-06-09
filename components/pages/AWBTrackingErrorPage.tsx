'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AWBNotFound } from '@/components/pages/AWBTrackingPage';

export function AWBTrackingErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.trim() || 'data yang dicari';

  return (
    <div className="max-w-4xl mx-auto">
      <AWBNotFound query={query} onReset={() => router.replace('/tracking')} />
    </div>
  );
}
