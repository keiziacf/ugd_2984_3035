'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Box,
  ChevronRight,
  Clock3,
  Plane,
  Shield,
} from 'lucide-react';
import { AeroTrackIcon } from '@/components/icons/AeroTrackLogo';

const FEATURES: { icon: LucideIcon; text: string }[] = [
  { icon: Plane, text: 'Tracking AWB & penerbangan real-time' },
  { icon: Box, text: 'Manajemen kargo 27 bandara nasional' },
  { icon: Shield, text: 'Keamanan data berlapis & akses berbasis peran' },
  { icon: Clock3, text: 'Monitoring operasional 24/7 non-stop' },
];

const BG_IMG =
  'https://images.unsplash.com/photo-1646114879518-5a9a8869d169?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMGFpcnBvcnQlMjBydW53YXklMjBsaWdodHMlMjBibHVlJTIwYWVyaWFsfGVufDF8fHx8MTc3NjAwNDQzM3ww&ixlib=rb-4.1.0&q=80&w=1600';

const AIRPORTS = ['CGK', 'SUB', 'DPS', 'UPG', 'KNO', 'BPN', 'SRG', 'JOG'];

const STATS = [
  { value: '27', label: 'Bandara' },
  { value: '2.4M+', label: 'Kargo/tahun' },
  { value: '99.2%', label: 'On-Time' },
];

const MISSIONS = [
  'Menyediakan sistem pelacakan kargo yang cepat dan real-time',
  'Meningkatkan efisiensi operasional logistik udara',
  'Menjamin keamanan dan transparansi data pengiriman',
  'Mendukung transformasi digital industri kargo dan transportasi',
];

const fadeBase: CSSProperties = {
  transition:
    'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
};

export function LandingPage() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 70);
    router.prefetch('/login');

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#081a36] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-cover opacity-70 brightness-[1.08] contrast-[1.08] saturate-[1.2] [background-position:center_-140px] sm:[background-position:center_-180px] lg:[background-position:center_-280px]"
        style={{ backgroundImage: `url("${BG_IMG}")` }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          background:
            'radial-gradient(circle at 50% 11%, rgba(118,181,255,0.34) 0%, rgba(88,155,255,0.16) 22%, transparent 48%), linear-gradient(180deg, rgba(4,14,28,0.42) 0%, rgba(7,24,49,0.74) 52%, rgba(8,22,44,0.94) 100%)',
        }}
      />
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#4d97ff]/30 blur-3xl" />
      <div className="pointer-events-none absolute right-[-2rem] top-[22%] h-64 w-64 rounded-full bg-cyan-300/16 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-400/16 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#143878]/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#08152a] via-[#08152a]/76 to-transparent opacity-90" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1080px] flex-col px-6 pb-24 pt-10 sm:px-10 lg:px-14">
        <header
          style={{
            ...fadeBase,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
          }}
          className="flex flex-col items-center text-center"
        >
          <div className="mb-8 flex h-[74px] w-[74px] items-center justify-center rounded-[22px] border border-blue-400/20 bg-gradient-to-br from-[#3a7dff] to-[#2e5fe6] shadow-[0_20px_50px_rgba(46,95,230,0.35)]">
            <AeroTrackIcon size={34} className="text-white" />
          </div>
          <h1
            className="text-[clamp(2.3rem,5vw,4rem)] font-extrabold leading-none tracking-[-0.04em]"
            style={{ textShadow: '0 12px 44px rgba(38,101,255,0.12)' }}
          >
            <span className="text-white">Aero </span>
            <span
              className="bg-gradient-to-b from-[#8fc3ff] to-[#4d97ff] bg-clip-text text-transparent"
              style={{ WebkitTextFillColor: 'transparent' }}
            >
              Track
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] font-medium text-slate-400 sm:text-[17px]">
            Smart Cargo Tracking for Modern Logistics
          </p>
        </header>

        <section className="mt-16 grid gap-14 lg:mt-24 lg:grid-cols-[minmax(0,1.25fr)_minmax(290px,0.72fr)] lg:items-start">
          <div
            style={{
              ...fadeBase,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transitionDelay: '90ms',
            }}
          >
            <h2 className="max-w-[680px] text-[clamp(2.6rem,5vw,4.8rem)] font-extrabold leading-[0.95] tracking-[-0.055em]">
              <span className="block">Fast, Accurate, and</span>
              <span className="block">
                <span className="bg-gradient-to-b from-[#74b4ff] to-[#3f8cff] bg-clip-text text-transparent">
                  Reliable
                </span>{' '}
                <span className="text-white">Air Cargo</span>
              </span>
              <span className="block">Tracking</span>
            </h2>

            <p className="mt-6 max-w-[680px] text-[18px] leading-[1.85] text-slate-300/95 sm:text-[20px]">
              Platform manajemen kargo udara terpadu untuk operator bandara profesional.
              Pantau setiap pengiriman dari penerimaan hingga tiba di tujuan.
            </p>

            <div className="mt-10 space-y-4">
              {FEATURES.map(({ icon: Icon, text }, index) => (
                <div
                  key={text}
                  className="flex items-center gap-4"
                  style={{
                    ...fadeBase,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateX(0)' : 'translateX(-14px)',
                    transitionDelay: `${160 + index * 70}ms`,
                  }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2c67cb] bg-[rgba(34,74,145,0.56)] shadow-[inset_0_1px_0_rgba(128,178,255,0.12)]">
                    <Icon size={16} className="text-[#63a4ff]" strokeWidth={2} />
                  </div>
                  <span className="text-[18px] font-medium text-slate-200 sm:text-[19px]">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="pt-2 lg:pt-[8.4rem]"
            style={{
              ...fadeBase,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transitionDelay: '150ms',
            }}
          >
            <div className="flex flex-wrap gap-x-10 gap-y-5 sm:gap-x-14">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-[34px] font-bold leading-none tracking-[-0.04em] text-white">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-[15px] font-medium text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-2">
              {AIRPORTS.map((code) => (
                <div
                  key={code}
                  className="rounded-md border border-[#234f98] bg-[rgba(20,52,105,0.45)] px-3 py-1.5 text-[12px] font-semibold tracking-[0.02em] text-[#82b3ff]"
                >
                  {code}
                </div>
              ))}
              <div className="ml-1 flex h-7 w-7 items-center justify-center text-slate-500">
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </section>

        <section
          className="mt-20 lg:mt-24"
          style={{
            ...fadeBase,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(28px)',
            transitionDelay: '220ms',
          }}
        >
          <p className="text-[15px] font-bold uppercase tracking-[0.16em] text-[#4f98ff]">About Us</p>
          <p className="mt-5 max-w-[980px] text-[23px] font-medium leading-[1.75] text-slate-300 sm:text-[26px]">
            Aero Track adalah platform manajemen kargo udara modern yang dirancang untuk
            membantu operator bandara dan logistik dalam memantau, mengelola, dan
            mengoptimalkan pengiriman secara real-time dengan akurasi tinggi dan sistem
            yang andal.
          </p>

          <div className="mt-10 grid gap-7 lg:grid-cols-2">
            <article className="rounded-[22px] border border-[#173f80] bg-[rgba(20,48,96,0.75)] px-6 py-7 shadow-[0_20px_60px_rgba(4,13,31,0.18)] backdrop-blur-sm sm:px-7">
              <h3 className="text-[28px] font-bold tracking-[-0.03em] text-white">Visi</h3>
              <p className="mt-5 text-[18px] leading-[1.8] text-slate-300">
                Menjadi solusi digital terdepan dalam sistem pelacakan kargo udara yang
                inovatif, efisien, dan terpercaya di tingkat nasional maupun global.
              </p>
            </article>

            <article className="rounded-[22px] border border-[#173f80] bg-[rgba(20,48,96,0.75)] px-6 py-7 shadow-[0_20px_60px_rgba(4,13,31,0.18)] backdrop-blur-sm sm:px-7">
              <h3 className="text-[28px] font-bold tracking-[-0.03em] text-white">Misi</h3>
              <ul className="mt-5 space-y-4">
                {MISSIONS.map((item) => (
                  <li key={item} className="flex gap-3 text-[18px] leading-[1.7] text-slate-300">
                    <span className="mt-[0.58rem] h-2 w-2 flex-shrink-0 rounded-full bg-[#4e97ff]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <footer className="mt-14 text-center text-[14px] font-medium text-slate-400 sm:mt-16">
          © 2026 Aero Track Indonesia · IATA Certified · ISO 9001:2015
        </footer>
      </div>

      <div
        className="fixed bottom-4 left-4 right-4 z-20 sm:left-auto sm:right-6 sm:w-auto"
        style={{
          ...fadeBase,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(18px)',
          transitionDelay: '260ms',
        }}
      >
        <button
          type="button"
          onClick={() => router.push('/login')}
          title="Masuk ke halaman login"
          className="flex w-full items-center justify-center gap-3 rounded-[18px] border border-[#3d79ff]/20 bg-gradient-to-r from-[#2d67e8]/85 to-[#3b79ff]/85 px-8 py-4 text-[17px] font-bold text-white shadow-[0_18px_45px_rgba(36,95,238,0.28)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(36,95,238,0.34)] sm:w-auto sm:min-w-[172px]"
        >
          <AeroTrackIcon size={16} className="text-white/95" />
          <span>Login</span>
          <ArrowRight size={17} className="text-white/85" />
        </button>
      </div>
    </main>
  );
}
