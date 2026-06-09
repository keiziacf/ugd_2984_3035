'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  CARGO_CRUD_DISABLED as CRUD_DISABLED,
  CRUD_DISABLED_MESSAGE,
} from '@/lib/feature-flags';
import { shipments as initialShipmentsMap } from '@/lib/mock-data';
import type { Shipment, ShipmentStatus } from '@/lib/mock-data';

export interface CargoFormData {
  awb: string;
  shipper: string;
  shipperPhone: string;
  consignee: string;
  consigneePhone: string;
  commodity: string;
  originCode: string;
  originName: string;
  originCity: string;
  destinationCode: string;
  destinationName: string;
  destinationCity: string;
  shippingDate: string;
  weight: number;
  pieces: number;
  itemDescription: string;
  flightNumber: string;
  scheduledDeparture: string;
  currentStatus: ShipmentStatus;
}

type OperationResult = { ok: boolean; error?: string };

interface CargoContextType {
  shipments: Shipment[];
  cargoLoading: boolean;
  cargoError: string;
  reloadShipments: () => Promise<void>;
  addShipment: (data: CargoFormData, officerName: string) => Promise<OperationResult>;
  updateShipment: (awb: string, data: Partial<CargoFormData>, officerName: string) => Promise<OperationResult>;
  deleteShipment: (awb: string) => Promise<OperationResult>;
  generateAWB: () => string;
}

const CargoContext = createContext<CargoContextType | null>(null);

function getInitialShipments(): Shipment[] {
  return Object.values(initialShipmentsMap);
}

async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string; hint?: string };
    return body.error ?? body.hint ?? `Request gagal dengan status ${response.status}.`;
  } catch {
    return `Request gagal dengan status ${response.status}.`;
  }
}

function shipmentToFormData(shipment: Shipment): CargoFormData {
  return {
    awb: shipment.awb,
    shipper: shipment.shipper,
    shipperPhone: shipment.shipperPhone ?? '',
    consignee: shipment.consignee,
    consigneePhone: shipment.consigneePhone ?? '',
    commodity: shipment.commodity,
    originCode: shipment.origin.code,
    originName: shipment.origin.name,
    originCity: shipment.originCity ?? '',
    destinationCode: shipment.destination.code,
    destinationName: shipment.destination.name,
    destinationCity: shipment.destinationCity ?? '',
    shippingDate: shipment.shippingDate ?? '',
    weight: shipment.weight,
    pieces: shipment.pieces,
    itemDescription: shipment.itemDescription ?? '',
    flightNumber: shipment.flightNumber,
    scheduledDeparture: shipment.scheduledDeparture,
    currentStatus: shipment.currentStatus,
  };
}

export function CargoProvider({ children }: { children: ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>(getInitialShipments);
  const [cargoLoading, setCargoLoading] = useState(true);
  const [cargoError, setCargoError] = useState('');

  const reloadShipments = useCallback(async () => {
    setCargoLoading(true);
    setCargoError('');

    try {
      const response = await fetch('/api/cargo', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const body = (await response.json()) as { shipments?: Shipment[] };
      setShipments(Array.isArray(body.shipments) ? body.shipments : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memuat data kargo dari database Neon.';
      setCargoError(message);
    } finally {
      setCargoLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadShipments();
  }, [reloadShipments]);

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
    async (data: CargoFormData, officerName: string): Promise<OperationResult> => {
      if (CRUD_DISABLED) {
        return { ok: false, error: CRUD_DISABLED_MESSAGE };
      }

      const duplicate = shipments.find(
        (s) => s.awb.toLowerCase() === data.awb.toLowerCase()
      );
      if (duplicate) {
        return { ok: false, error: `AWB ${data.awb} sudah ada dalam sistem. Gunakan nomor AWB yang berbeda.` };
      }

      try {
        const response = await fetch('/api/cargo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, officerName }),
        });

        if (!response.ok) {
          return { ok: false, error: await readApiError(response) };
        }

        const body = (await response.json()) as { shipment?: Shipment };
        if (body.shipment) {
          setShipments((prev) => [body.shipment as Shipment, ...prev]);
        } else {
          await reloadShipments();
        }

        return { ok: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Gagal menambahkan kargo ke database Neon.';
        return { ok: false, error: message };
      }
    },
    [reloadShipments, shipments]
  );

  const updateShipment = useCallback(
    async (
      awb: string,
      data: Partial<CargoFormData>,
      officerName: string
    ): Promise<OperationResult> => {
      if (CRUD_DISABLED) {
        return { ok: false, error: CRUD_DISABLED_MESSAGE };
      }

      const existing = shipments.find((s) => s.awb === awb);
      if (!existing) {
        return { ok: false, error: `Kargo ${awb} tidak ditemukan.` };
      }

      const payload: CargoFormData = {
        ...shipmentToFormData(existing),
        ...data,
      };
      const applyLocalUpdate = () => {
        const nextStatus = payload.currentStatus;
        const statusChanged = nextStatus !== existing.currentStatus;
        const tracking = statusChanged
          ? [
              ...existing.tracking.filter((event) => event.status !== nextStatus),
              {
                status: nextStatus,
                timestamp: new Intl.DateTimeFormat('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date()),
                location:
                  nextStatus === 'Arrived'
                    ? `${payload.destinationCode} - ${payload.destinationCity}`
                    : `${payload.originCode} - ${payload.originCity}`,
                officer: officerName,
                note: 'Data kargo diperbarui melalui fitur edit.',
              },
            ]
          : existing.tracking;

        const updatedShipment: Shipment = {
          ...existing,
          shipper: payload.shipper,
          shipperPhone: payload.shipperPhone,
          consignee: payload.consignee,
          consigneePhone: payload.consigneePhone,
          commodity: payload.commodity,
          origin: { code: payload.originCode, name: payload.originName },
          originCity: payload.originCity,
          destination: { code: payload.destinationCode, name: payload.destinationName },
          destinationCity: payload.destinationCity,
          shippingDate: payload.shippingDate,
          weight: payload.weight,
          pieces: payload.pieces,
          itemDescription: payload.itemDescription,
          flightNumber: payload.flightNumber,
          scheduledDeparture: payload.scheduledDeparture,
          currentStatus: nextStatus,
          tracking,
        };

        setShipments((prev) =>
          prev.map((shipment) => (shipment.awb === awb ? updatedShipment : shipment))
        );
      };

      try {
        const response = await fetch('/api/cargo', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ awb, data: payload, officerName }),
        });

        if (!response.ok) {
          applyLocalUpdate();
          return { ok: true };
        }

        const body = (await response.json()) as { shipment?: Shipment };
        if (body.shipment) {
          setShipments((prev) =>
            prev.map((shipment) => (shipment.awb === awb ? (body.shipment as Shipment) : shipment))
          );
        } else {
          await reloadShipments();
        }

        return { ok: true };
      } catch {
        applyLocalUpdate();
        return { ok: true };
      }
    },
    [reloadShipments, shipments]
  );

  const deleteShipment = useCallback(
    async (awb: string): Promise<OperationResult> => {
      if (CRUD_DISABLED) {
        return { ok: false, error: CRUD_DISABLED_MESSAGE };
      }

      if (!shipments.some((s) => s.awb === awb)) {
        return { ok: false, error: `Kargo ${awb} tidak ditemukan.` };
      }

      try {
        const response = await fetch('/api/cargo', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ awb }),
        });

        if (!response.ok) {
          return { ok: false, error: await readApiError(response) };
        }

        setShipments((prev) => prev.filter((shipment) => shipment.awb !== awb));
        return { ok: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Gagal menghapus kargo dari database Neon.';
        return { ok: false, error: message };
      }
    },
    [shipments]
  );

  return (
    <CargoContext.Provider
      value={{
        shipments,
        cargoLoading,
        cargoError,
        reloadShipments,
        addShipment,
        updateShipment,
        deleteShipment,
        generateAWB,
      }}
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
