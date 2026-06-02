import type { Metadata } from 'next';
import { SettingsPage } from '@/components/pages/SettingsPage';

export const metadata: Metadata = {
  title: 'Pengaturan',
  description: 'Atur preferensi akun dan konfigurasi tampilan Aero Track.',
};

export default function SettingsRoute() {
  return <SettingsPage />;
}
