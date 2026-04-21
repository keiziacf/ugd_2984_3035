'use client';

import { useId } from 'react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Package, CheckCircle2, AlertTriangle, Plane } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { weeklyStats } from '@/lib/mock-data';

const commodityData = [
  { name: 'Tekstil', value: 38 },
  { name: 'Elektronik', value: 24 },
  { name: 'Dokumen', value: 18 },
  { name: 'Produk Segar', value: 32 },
  { name: 'Obat-obatan', value: 15 },
  { name: 'Lainnya', value: 25 },
];

const PIE_COLORS = ['#1a56db', '#16a34a', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

const routeData = [
  { route: 'CGK→SUB', count: 42, weight: 3200 },
  { route: 'CGK→DPS', count: 38, weight: 2800 },
  { route: 'CGK→UPG', count: 29, weight: 4100 },
  { route: 'CGK→KNO', count: 25, weight: 1900 },
  { route: 'UPG→CGK', count: 22, weight: 2600 },
];

export function ReportsPage() {
  const { isDark } = useApp();
  const uid = useId().replace(/:/g, '');
  const rg1 = `${uid}-rg1`;
  const rg2 = `${uid}-rg2`;
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const cardBase = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

  const weekTotal = weeklyStats.reduce((s, d) => s + d.shipped, 0);
  const weekArrived = weeklyStats.reduce((s, d) => s + d.arrived, 0);
  const weekOnTime = weeklyStats.reduce((s, d) => s + d.onTime, 0);
  const weekDelayed = weeklyStats.reduce((s, d) => s + d.delayed, 0);

  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: 8,
    fontSize: 13,
    color: isDark ? '#e2e8f0' : '#1e293b',
  };

  const summaryCards = [
    { label: 'Total Kargo (7 hari)', value: weekTotal, icon: Package, color: 'text-blue-600', bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50' },
    { label: 'Kargo Tiba (7 hari)', value: weekArrived, icon: CheckCircle2, color: 'text-green-600', bg: isDark ? 'bg-green-900/30' : 'bg-green-50' },
    { label: 'Penerbangan On-Time', value: weekOnTime, icon: Plane, color: 'text-indigo-600', bg: isDark ? 'bg-indigo-900/30' : 'bg-indigo-50' },
    { label: 'Penerbangan Delay', value: weekDelayed, icon: AlertTriangle, color: 'text-amber-600', bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-xl border p-5 ${cardBase}`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                {card.label}
              </p>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon size={16} className={card.color} />
              </div>
            </div>
            <p
              className={isDark ? 'text-white' : 'text-slate-900'}
              style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}
            >
              {card.value}
            </p>
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp size={13} className="text-green-500" />
              <span className="text-green-600" style={{ fontSize: '0.75rem' }}>
                Periode 6–12 Apr 2026
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Weekly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`xl:col-span-8 rounded-xl border p-5 ${cardBase}`}
        >
          <div className="mb-4">
            <h3 className={isDark ? 'text-slate-200' : 'text-slate-800'}>Tren Kargo Mingguan</h3>
            <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.8125rem' }}>
              Volume kargo dikirim vs tiba (7 hari terakhir)
            </p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyStats} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={rg1} x1="0" y1="0" x2="0" y2="1">
                  <stop key="top" offset="5%" stopColor="#1a56db" stopOpacity={0.18} />
                  <stop key="bot" offset="95%" stopColor="#1a56db" stopOpacity={0} />
                </linearGradient>
                <linearGradient id={rg2} x1="0" y1="0" x2="0" y2="1">
                  <stop key="top" offset="5%" stopColor="#16a34a" stopOpacity={0.18} />
                  <stop key="bot" offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: tickColor, paddingTop: 8 }} />
              <Area key="area-shipped" type="monotone" dataKey="shipped" name="Dikirim" stroke="#1a56db" strokeWidth={2} fill={`url(#${rg1})`} dot={false} />
              <Area key="area-arrived" type="monotone" dataKey="arrived" name="Tiba" stroke="#16a34a" strokeWidth={2} fill={`url(#${rg2})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Commodity Pie */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`xl:col-span-4 rounded-xl border p-5 ${cardBase}`}
        >
          <div className="mb-4">
            <h3 className={isDark ? 'text-slate-200' : 'text-slate-800'}>Komoditi Kargo</h3>
            <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.8125rem' }}>
              Distribusi berdasarkan jenis
            </p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={commodityData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {commodityData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-1">
            {commodityData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.6875rem' }}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Daily bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`xl:col-span-7 rounded-xl border p-5 ${cardBase}`}
        >
          <div className="mb-4">
            <h3 className={isDark ? 'text-slate-200' : 'text-slate-800'}>Penerbangan Harian</h3>
            <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.8125rem' }}>
              On-time vs delay per hari
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyStats} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: tickColor }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: tickColor, paddingTop: 8 }} />
              <Bar key="bar-ontime" dataKey="onTime" name="On-Time" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar key="bar-delayed" dataKey="delayed" name="Delay" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Routes */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`xl:col-span-5 rounded-xl border p-5 ${cardBase}`}
        >
          <div className="mb-4">
            <h3 className={isDark ? 'text-slate-200' : 'text-slate-800'}>Top Rute</h3>
            <p className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.8125rem' }}>
              Berdasarkan volume kargo
            </p>
          </div>
          <div className="space-y-3">
            {routeData.map((route, i) => {
              const maxCount = routeData[0].count;
              const pct = (route.count / maxCount) * 100;
              return (
                <div key={route.route}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-mono ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                      style={{ fontSize: '0.875rem', fontWeight: 600 }}
                    >
                      {route.route}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                        {route.count} kargo
                      </span>
                      <span className={isDark ? 'text-slate-500' : 'text-slate-400'} style={{ fontSize: '0.75rem' }}>
                        {route.weight} kg
                      </span>
                    </div>
                  </div>
                  <div className={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <motion.div
                      className="h-full rounded-full bg-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}