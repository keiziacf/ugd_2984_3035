'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Package,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Truck,
  AlertCircle,
  Search,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { todayShipmentsList, recentActivity } from '@/lib/mock-data';

const STAGE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Received: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-300', dot: 'bg-slate-400' },
  Sortation: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  'Loaded to Aircraft': { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  Departed: { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
  Arrived: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
};

const STAGE_LABELS: Record<string, string> = {
  Received: 'Diterima',
  Sortation: 'Sortasi',
  'Loaded to Aircraft': 'Dimuat',
  Departed: 'Berangkat',
  Arrived: 'Tiba',
};

const ACTIVITY_DOT: Record<string, string> = {
  arrived: 'bg-green-500',
  departed: 'bg-blue-500',
  loaded: 'bg-amber-500',
  sortation: 'bg-purple-500',
  received: 'bg-slate-400',
};

const assignedCargo = todayShipmentsList.slice(0, 5);

type TaskItem = {
  id: number;
  task: string;
  status: 'pending' | 'done';
  priority: 'high' | 'normal';
  time: string;
  href: string;
};

const INITIAL_TASKS: TaskItem[] = [
  { id: 1, task: 'Scan dan terima 12 koli dari GA-632', status: 'pending', priority: 'high', time: '14:00', href: '/cargo?q=GA-632' },
  { id: 2, task: 'Update status sortasi AT-2604120012', status: 'pending', priority: 'normal', time: '15:30', href: '/tracking/AT-2604120012' },
  { id: 3, task: 'Koordinasi muat QG-973 di Gate A2', status: 'done', priority: 'normal', time: '13:00', href: '/cargo?q=QG-973' },
  { id: 4, task: 'Verifikasi manifest JT-539', status: 'done', priority: 'high', time: '12:30', href: '/cargo?q=JT-539' },
  { id: 5, task: 'Input data penerimaan AT-2604120014', status: 'pending', priority: 'normal', time: '16:00', href: '/tracking/AT-2604120014' },
];

export function OperatorDashboard() {
  const { isDark } = useApp();
  const router = useRouter();
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const cardBase = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const completedToday = todayShipmentsList.filter((s) => s.currentStatus === 'Arrived').length;
  const pendingProcess = todayShipmentsList.filter((s) => ['Received', 'Sortation'].includes(s.currentStatus)).length;
  const inFlight = todayShipmentsList.filter((s) => ['Loaded to Aircraft', 'Departed'].includes(s.currentStatus)).length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const progressPct = Math.round((doneCount / tasks.length) * 100);

  function toggleTask(taskId: number) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === 'done' ? 'pending' : 'done' }
          : task
      )
    );
  }

  const quickStats = [
    { label: 'Kargo Ditugaskan', value: assignedCargo.length, icon: Package, color: 'blue', sub: 'hari ini', link: '/cargo' },
    { label: 'Selesai Hari Ini', value: completedToday, icon: CheckCircle2, color: 'green', sub: 'kargo arrived', link: '/cargo?status=Arrived' },
    { label: 'Dalam Proses', value: pendingProcess, icon: Truck, color: 'amber', sub: 'received/sortasi', link: '/cargo?status=Sortation' },
    { label: 'Dalam Penerbangan', value: inFlight, icon: Clock, color: 'indigo', sub: 'loaded/departed', link: '/cargo' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {quickStats.map((stat, i) => {
          const iconBg: Record<string, string> = {
            blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
            amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
            indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
          };

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className={`cursor-pointer rounded-xl border p-4 transition-shadow hover:shadow-md ${cardBase}`}
              onClick={() => router.push(stat.link)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.75rem' }}>
                    {stat.label}
                  </p>
                  <p className={isDark ? 'mt-1 text-white' : 'mt-1 text-slate-900'} style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>
                    {stat.value}
                  </p>
                  <p className={isDark ? 'mt-0.5 text-slate-500' : 'mt-0.5 text-slate-400'} style={{ fontSize: '0.6875rem' }}>
                    {stat.sub}
                  </p>
                </div>
                <div className={`rounded-lg p-2 ${iconBg[stat.color]}`}>
                  <stat.icon size={18} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className={`rounded-xl border xl:col-span-5 ${cardBase}`}
        >
          <div className={`flex items-center justify-between border-b p-5 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <div>
              <h3 className={isDark ? 'text-slate-200' : 'text-slate-800'}>Tugas Hari Ini</h3>
              <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.8125rem' }}>
                {doneCount} dari {tasks.length} selesai
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={isDark ? 'h-1.5 w-24 overflow-hidden rounded-full bg-slate-700' : 'h-1.5 w-24 overflow-hidden rounded-full bg-slate-200'}>
                <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="text-blue-600" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {progressPct}%
              </span>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {tasks.map((task) => (
              <div key={task.id} className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${task.status === 'done' ? 'opacity-70' : ''}`}>
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    task.status === 'done'
                      ? 'border-blue-600 bg-blue-600'
                      : isDark
                      ? 'border-slate-600 hover:border-blue-500'
                      : 'border-slate-300 hover:border-blue-400'
                  }`}
                  title={task.status === 'done' ? 'Tandai belum selesai' : 'Tandai selesai'}
                >
                  {task.status === 'done' && <CheckCircle2 size={11} className="text-white" fill="white" />}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(task.href)}
                  className="flex-1 text-left"
                >
                  <p className={`${task.status === 'done' ? 'line-through ' : ''}${isDark ? 'text-slate-300' : 'text-slate-700'}`} style={{ fontSize: '0.8125rem' }}>
                    {task.task}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Clock size={11} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.6875rem' }}>
                      {task.time} WIB
                    </span>
                    {task.priority === 'high' && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-600 dark:bg-red-900/30 dark:text-red-400" style={{ fontSize: '0.5625rem', fontWeight: 600 }}>
                        PRIORITAS
                      </span>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-5 xl:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.35 }}
            className="relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white"
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
            <div className="relative flex items-center gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Search size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p style={{ fontWeight: 700, fontSize: '1rem' }}>Lacak Kargo</p>
                <p style={{ fontSize: '0.8125rem', opacity: 0.85 }}>Cari dan update status AWB secara real-time</p>
              </div>
              <button
                onClick={() => router.push('/tracking')}
                className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50"
                style={{ fontWeight: 600, fontSize: '0.875rem' }}
              >
                Buka Tracking <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.35 }}
            className={`rounded-xl border ${cardBase}`}
          >
            <div className={`flex items-center justify-between border-b p-5 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <div>
                <h3 className={isDark ? 'text-slate-200' : 'text-slate-800'}>Kargo Ditugaskan</h3>
                <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.8125rem' }}>
                  Kargo yang perlu Anda proses hari ini
                </p>
              </div>
              <Link href="/tracking" className="flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-700" style={{ fontSize: '0.8125rem' }}>
                Semua <ExternalLink size={13} />
              </Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {assignedCargo.map((ship, i) => (
                <motion.div
                  key={ship.awb}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 + i * 0.04 }}
                  onClick={() => router.push(`/tracking/${ship.awb}`)}
                  className={`flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors ${isDark ? 'hover:bg-slate-700/40' : 'hover:bg-blue-50/30'}`}
                >
                  <div className={`h-2 w-2 flex-shrink-0 rounded-full ${STAGE_COLORS[ship.currentStatus].dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={isDark ? 'font-mono text-blue-400' : 'font-mono text-blue-600'} style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {ship.awb}
                      </span>
                      <span className={`rounded-full px-1.5 py-0.5 ${STAGE_COLORS[ship.currentStatus].bg} ${STAGE_COLORS[ship.currentStatus].text}`} style={{ fontSize: '0.625rem', fontWeight: 600 }}>
                        {STAGE_LABELS[ship.currentStatus]}
                      </span>
                    </div>
                    <p className={isDark ? 'truncate text-slate-400' : 'truncate text-slate-500'} style={{ fontSize: '0.75rem' }}>
                      {ship.shipper} → {ship.consignee}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className={isDark ? 'text-slate-300' : 'text-slate-600'} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {ship.origin.code}→{ship.destination.code}
                    </p>
                    <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.6875rem' }}>
                      {ship.weight} kg
                    </p>
                  </div>
                  <ArrowRight size={14} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.35 }}
        className={`rounded-xl border p-5 ${cardBase}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className={isDark ? 'text-slate-200' : 'text-slate-800'}>Aktivitas Terkini</h3>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.75rem' }}>
              Live
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recentActivity.map((act, i) => (
            <motion.div
              key={act.awb + i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.04 }}
              onClick={() => router.push(`/tracking/${act.awb}`)}
              className={`flex cursor-pointer items-start gap-2.5 rounded-lg p-3 transition-colors ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}
            >
              <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${ACTIVITY_DOT[act.type]}`} />
              <div className="min-w-0">
                <span className={isDark ? 'block font-mono text-blue-400' : 'block font-mono text-blue-600'} style={{ fontSize: '0.6875rem', fontWeight: 600 }}>
                  {act.awb}
                </span>
                <p className={isDark ? 'text-slate-300' : 'text-slate-700'} style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                  {act.event}
                </p>
                <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.6875rem' }}>
                  {act.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}
      >
        <AlertCircle size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
        <p className={isDark ? 'text-slate-500' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
          Sebagai <strong>Operator</strong>, Anda memiliki akses ke <strong>Dashboard</strong>, <strong>Tracking AWB</strong>, <strong>Manajemen Kargo</strong>, dan <strong>Pengaturan</strong>. Untuk akses lebih lanjut, hubungi Supervisor atau Administrator.
        </p>
      </motion.div>
    </div>
  );
}
