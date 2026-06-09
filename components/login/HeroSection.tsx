'use client';

import { motion } from 'motion/react';
import { Plane, Package, Shield, Clock, ChevronRight } from 'lucide-react';
import { AeroTrackIcon } from '../icons/AeroTrackLogo';

const BG_IMG =
  'https://images.unsplash.com/photo-1646114879518-5a9a8869d169?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWdodCUyMGFpcnBvcnQlMjBydW53YXklMjBsaWdodHMlMjBibHVlJTIwYWVyaWFsfGVufDF8fHx8MTc3NjAwNDQzM3ww&ixlib=rb-4.1.0&q=80&w=1080';

const FEATURES = [
  { icon: Plane, text: 'Tracking AWB & penerbangan real-time' },
  { icon: Package, text: 'Manajemen kargo 27 bandara nasional' },
  { icon: Shield, text: 'Keamanan data berlapis & akses berbasis peran' },
  { icon: Clock, text: 'Monitoring operasional 24/7 non-stop' },
];

function PlanePath({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" fill="none" className={className} aria-hidden="true">
      <path
        d="M2 20 Q30 2 60 20 Q90 38 118 20"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 3"
        opacity="0.4"
      />
      <polygon points="118,20 108,14 108,26" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function HeroSection() {
  return (
    <div className="relative hidden flex-col lg:flex lg:w-[62%]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${BG_IMG}")` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#06121f]/95 via-[#0B2447]/85 to-[#0B2447]/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#06121f]/80 via-transparent to-transparent" />
      <div className="absolute -left-16 top-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col px-12 py-10 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3.5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500 shadow-lg shadow-blue-500/30">
            <AeroTrackIcon size={22} className="text-white" />
          </div>
          <div>
            <p
              className="text-white"
              style={{ fontSize: '1.1875rem', fontWeight: 700, letterSpacing: '-0.01em' }}
            >
              Aero Track
            </p>
            <p
              className="text-blue-400"
              style={{
                fontSize: '0.6875rem',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Air Cargo Management System
            </p>
          </div>
        </motion.div>

        <div className="flex flex-1 flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            className="mb-6"
          >
            <PlanePath className="w-28 text-blue-400" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}
          >
            <h1
              className="mb-3 text-white"
              style={{
                fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              Fast, Accurate, and
              <br />
              <span className="text-blue-400">Reliable</span> Air Cargo
              <br />
              Tracking
            </h1>
            <p className="max-w-md text-slate-300" style={{ fontSize: '0.9375rem', lineHeight: 1.75 }}>
              Platform manajemen kargo udara terpadu untuk operator bandara profesional.
              Pantau setiap pengiriman dari penerimaan hingga tiba di tujuan.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 space-y-3.5"
          >
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-500/20">
                  <feature.icon size={15} className="text-blue-400" />
                </div>
                <span className="text-slate-300" style={{ fontSize: '0.875rem' }}>
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-10 flex items-center gap-8"
          >
            {[
              { val: '27', lbl: 'Bandara' },
              { val: '2.4M+', lbl: 'Kargo/tahun' },
              { val: '99.2%', lbl: 'On-Time' },
            ].map((stat) => (
              <div key={stat.lbl}>
                <p
                  className="text-white"
                  style={{ fontSize: '1.375rem', fontWeight: 700, lineHeight: 1 }}
                >
                  {stat.val}
                </p>
                <p className="text-slate-400" style={{ fontSize: '0.75rem', marginTop: 2 }}>
                  {stat.lbl}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {['CGK', 'SUB', 'DPS', 'UPG', 'KNO', 'BPN', 'SRG', 'JOG'].map((code, index) => (
              <span
                key={code}
                className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-mono text-blue-300"
                style={{ fontSize: '0.6875rem', fontWeight: 700, opacity: 0.6 + index * 0.05 }}
              >
                {code}
              </span>
            ))}
            <ChevronRight size={13} className="text-slate-600" />
          </div>
          <p className="text-slate-600" style={{ fontSize: '0.75rem' }}>
            © 2026 Aero Track Indonesia · IATA Certified · ISO 9001:2015
          </p>
        </motion.div>
      </div>
    </div>
  );
}
