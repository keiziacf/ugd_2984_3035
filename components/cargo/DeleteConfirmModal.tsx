'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Shipment } from '@/lib/mock-data';

interface DeleteConfirmModalProps {
  shipment: Shipment | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ shipment, onConfirm, onCancel }: DeleteConfirmModalProps) {
  const { isDark } = useApp();

  return (
    <AnimatePresence>
      {shipment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            className={`w-full max-w-md rounded-2xl border shadow-2xl ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between p-5 border-b ${
                isDark ? 'border-slate-700' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                </div>
                <h3
                  className={`${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                  style={{ fontWeight: 600, fontSize: '1.0625rem' }}
                >
                  Hapus Data Kargo
                </h3>
              </div>
              <button
                onClick={onCancel}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {/* Warning Banner */}
              <div
                className={`flex items-start gap-3 p-4 rounded-xl border mb-5 ${
                  isDark
                    ? 'bg-red-900/15 border-red-800/40'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className={`${isDark ? 'text-red-300' : 'text-red-700'}`} style={{ fontSize: '0.875rem' }}>
                  Tindakan ini <strong>tidak dapat dibatalkan</strong>. Seluruh data kargo termasuk riwayat tracking akan dihapus permanen.
                </p>
              </div>

              {/* Shipment Summary */}
              <div
                className={`rounded-xl border p-4 space-y-2.5 ${
                  isDark ? 'border-slate-700 bg-slate-700/40' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                    Nomor AWB
                  </span>
                  <span
                    className={`font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                    style={{ fontSize: '0.8125rem', fontWeight: 700 }}
                  >
                    {shipment.awb}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                    Pengirim
                  </span>
                  <span
                    className={`${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                    style={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  >
                    {shipment.shipper}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                    Penerima
                  </span>
                  <span
                    className={`${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                    style={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  >
                    {shipment.consignee}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                    Rute
                  </span>
                  <span
                    className={`${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                    style={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  >
                    {shipment.origin.code} → {shipment.destination.code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '0.8125rem' }}>
                    Status Saat Ini
                  </span>
                  <span
                    className={`${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                    style={{ fontSize: '0.8125rem', fontWeight: 500 }}
                  >
                    {shipment.currentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className={`flex gap-3 p-5 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
            >
              <button
                onClick={onCancel}
                className={`flex-1 py-2.5 px-4 rounded-xl border transition-colors ${
                  isDark
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
                style={{ fontWeight: 500, fontSize: '0.875rem' }}
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center gap-2"
                style={{ fontWeight: 600, fontSize: '0.875rem' }}
              >
                <Trash2 size={15} />
                Hapus Permanen
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
