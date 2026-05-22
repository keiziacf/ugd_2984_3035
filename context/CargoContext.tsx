'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  CARGO_CRUD_DISABLED as CRUD_DISABLED,
  CRUD_DISABLED_MESSAGE,
} from '@/lib/feature-flags';
import { shipments as initialShipmentsMap } from '@/lib/mock-data';
import type { Shipment, ShipmentStatus, TrackingEvent } from '@/lib/mock-data';

export interface CargoFormData {
  awb: string;
  shipper: string;
  consignee: string;
  commodity: string;
  originCode: string;
  originName: string;
  destinationCode: string;
  destinationName: string;
  weight: number;
  pieces: number;
  flightNumber: string;
  scheduledDeparture: string;
  currentStatus: ShipmentStatus;
}

interface CargoContextType {
  shipments: Shipment[];
  addShipment: (data: CargoFormData, officerName: string) => { ok: boolean; error?: string };
  updateShipment: (awb: string, data: Partial<CargoFormData>, officerName: string) => { ok: boolean; error?: string };
  deleteShipment: (awb: string) => { ok: boolean; error?: string };
  generateAWB: () => string;
}

const CargoContext = createContext<CargoContextType | null>(null);
const CARGO_STORAGE_KEY = 'aero_track_shipments';

function nowTimestamp(): string {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  const d = String(now.getDate()).padStart(2, '0');
  const m = months[now.getMonth()];
  const y = now.getFullYear();
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${d} ${m} ${y}, ${h}:${min} WIB`;
}

function getInitialShipments(): Shipment[] {
  return Object.values(initialShipmentsMap);
}

function readStoredShipments(): Shipment[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem(CARGO_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;

    return parsed.filter((item): item is Shipment => {
      return (
        item &&
        typeof item.awb === 'string' &&
        typeof item.shipper === 'string' &&
        typeof item.consignee === 'string' &&
        typeof item.currentStatus === 'string' &&
        Array.isArray(item.tracking)
      );
    });
  } catch {
    return null;
  }
}

export function CargoProvider({ children }: { children: ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>(getInitialShipments);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const storedShipments = readStoredShipments();
    if (storedShipments !== null) {
      setShipments(storedShipments);
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(CARGO_STORAGE_KEY, JSON.stringify(shipments));
  }, [shipments, storageReady]);

  const generateAWB = useCallback((): string => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const base = `AT-${yy}${mm}${dd}`;

    const existing = shipments
      .filter((s) => s.awb.startsWith(base))
      .map((s) => parseInt(s.awb.replace(base, '')))
      .filter((n) => !isNaN(n));

    const next = existing.length > 0 ? Math.max(...existing) + 1 : 16;
    return `${base}${String(next).padStart(4, '0')}`;
  }, [shipments]);

  const addShipment = useCallback(
    (data: CargoFormData, officerName: string): { ok: boolean; error?: string } => {
      if (CRUD_DISABLED) {
        return { ok: false, error: CRUD_DISABLED_MESSAGE };
      }

      const duplicate = shipments.find(
        (s) => s.awb.toLowerCase() === data.awb.toLowerCase()
      );
      if (duplicate) {
        return { ok: false, error: `AWB ${data.awb} sudah ada dalam sistem. Gunakan nomor AWB yang berbeda.` };
      }

      const ts = nowTimestamp();
      const newShipment: Shipment = {
        awb: data.awb.toUpperCase(),
        shipper: data.shipper.trim(),
        consignee: data.consignee.trim(),
        origin: { code: data.originCode, name: data.originName },
        destination: { code: data.destinationCode, name: data.destinationName },
        weight: data.weight,
        pieces: data.pieces,
        commodity: data.commodity,
        flightNumber: data.flightNumber.toUpperCase().trim(),
        scheduledDeparture: data.scheduledDeparture,
        currentStatus: data.currentStatus,
        tracking: [
          {
            status: data.currentStatus,
            timestamp: ts,
            location: `${data.originCode} - Gudang Penerimaan`,
            officer: officerName,
            note: `Kargo baru didaftarkan ke sistem oleh ${officerName}`,
          },
        ],
      };

      setShipments((prev) => [newShipment, ...prev]);
      return { ok: true };
    },
    [shipments]
  );

  const updateShipment = useCallback(
    (
      awb: string,
      data: Partial<CargoFormData>,
      officerName: string
    ): { ok: boolean; error?: string } => {
      if (CRUD_DISABLED) {
        return { ok: false, error: CRUD_DISABLED_MESSAGE };
      }

      const existing = shipments.find((s) => s.awb === awb);
      if (!existing) {
        return { ok: false, error: `Kargo ${awb} tidak ditemukan.` };
      }

      setShipments((prev) =>
        prev.map((s) => {
          if (s.awb !== awb) return s;

          const updated: Shipment = {
            ...s,
            shipper: data.shipper?.trim() ?? s.shipper,
            consignee: data.consignee?.trim() ?? s.consignee,
            weight: data.weight ?? s.weight,
            pieces: data.pieces ?? s.pieces,
            commodity: data.commodity ?? s.commodity,
            flightNumber: data.flightNumber?.toUpperCase().trim() ?? s.flightNumber,
            scheduledDeparture: data.scheduledDeparture ?? s.scheduledDeparture,
            origin: data.originCode
              ? { code: data.originCode, name: data.originName ?? s.origin.name }
              : s.origin,
            destination: data.destinationCode
              ? { code: data.destinationCode, name: data.destinationName ?? s.destination.name }
              : s.destination,
          };

          // If status changed → append tracking event
          if (data.currentStatus && data.currentStatus !== s.currentStatus) {
            updated.currentStatus = data.currentStatus;
            const ts = nowTimestamp();
            const newEvent: TrackingEvent = {
              status: data.currentStatus,
              timestamp: ts,
              location: `${updated.destination.code} - Update Status`,
              officer: officerName,
              note: `Status diperbarui dari "${s.currentStatus}" → "${data.currentStatus}" oleh ${officerName}`,
            };
            updated.tracking = [...s.tracking, newEvent];
          }

          return updated;
        })
      );
      return { ok: true };
    },
    [shipments]
  );

  const deleteShipment = useCallback((awb: string): { ok: boolean; error?: string } => {
    if (CRUD_DISABLED) {
      return { ok: false, error: CRUD_DISABLED_MESSAGE };
    }

    if (!shipments.some((s) => s.awb === awb)) {
      return { ok: false, error: `Kargo ${awb} tidak ditemukan.` };
    }

    setShipments((prev) => prev.filter((s) => s.awb !== awb));
    return { ok: true };
  }, [shipments]);

  return (
    <CargoContext.Provider
      value={{ shipments, addShipment, updateShipment, deleteShipment, generateAWB }}
    >
      {children}
    </CargoContext.Provider>
  );
}

export function useCargo() {
  const ctx = useContext(CargoContext);
  if (!ctx) throw new Error('useCargo must be used within CargoProvider');
  return ctx;
}
