import type { Metadata } from 'next';
import { LoginPage } from '@/components/pages/LoginPage';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Masuk sebagai admin, supervisor, atau operator Aero Track.',
};

export default function LoginRoute() {
  return <LoginPage />;
}
