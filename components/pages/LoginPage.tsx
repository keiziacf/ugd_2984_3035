'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { LOGIN_ACCOUNTS } from '@/lib/auth';
import { HeroSection } from '@/components/login/HeroSection';
import { LoginFormSection } from '@/components/login/LoginFormSection';

const LOGIN_HELP_MESSAGE = LOGIN_ACCOUNTS.map(
  ({ label, email, password }) => `${label}: ${email} / ${password}`
).join(' | ');

export function LoginPage() {
  const router = useRouter();
  const { hydrated, isAuthenticated, login, startNavigationLoading } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    router.prefetch('/');

    if (hydrated && isAuthenticated) {
      startNavigationLoading('Membuka dashboard...');
      router.replace('/');
    }
  }, [hydrated, isAuthenticated, router, startNavigationLoading]);

  async function submitCredentials(nextEmail: string, nextPassword: string) {
    setLoading(true);
    const result = login(nextEmail, nextPassword);

    if (result.ok) {
      startNavigationLoading('Membuka dashboard...');
      router.replace('/');
      return;
    }

    setLoading(false);
    setError(result.error ?? 'Login gagal.');
  }

  function handleForgotPassword() {
    setError('');
    setInfoMessage(`Gunakan akun berikut: ${LOGIN_HELP_MESSAGE}`);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    await submitCredentials(email, password);
  }

  if (!hydrated || isAuthenticated) return null;

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#06121f]">
      <HeroSection />
      <LoginFormSection
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        error={error}
        infoMessage={infoMessage}
        setError={setError}
        setInfoMessage={setInfoMessage}
        loading={loading}
        onSubmit={handleSubmit}
        onForgotPassword={handleForgotPassword}
      />
    </div>
  );
}
