import { getSqlClient } from '@/lib/neon';
import type { Shipment, ShipmentStatus, TrackingEvent } from '@/lib/mock-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUS_OPTIONS: ShipmentStatus[] = [
  'Received',
  'Sortation',
  'Loaded to Aircraft',
  'Departed',
  'Arrived',
];

type CargoPayload = {
  awb: string;
  shipper: string;
  shipperPhone?: string;
  consignee: string;
  consigneePhone?: string;
  commodity: string;
  originCode: string;
  originName: string;
  originCity?: string;
  destinationCode: string;
  destinationName: string;
  destinationCity?: string;
  shippingDate?: string;
  weight: number;
  pieces: number;
  itemDescription?: string;
  flightNumber: string;
  scheduledDeparture: string;
  currentStatus: ShipmentStatus;
};

type ShipmentRow = {
  awb: string;
  shipper: string;
  shipper_phone: string | null;
  consignee: string;
  consignee_phone: string | null;
  origin_code: string;
  origin_name: string;
  origin_city: string | null;
  destination_code: string;
  destination_name: string;
  destination_city: string | null;
  shipping_date: string | null;
  weight: number;
  pieces: number;
  commodity: string;
  item_description: string | null;
  flight_number: string;
  scheduled_departure: string;
  current_status: ShipmentStatus;
};

type TrackingRow = {
  shipment_awb: string;
  status: ShipmentStatus;
  event_timestamp: string;
  location: string;
  officer: string;
  note: string;
};

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

function isShipmentStatus(value: unknown): value is ShipmentStatus {
  return typeof value === 'string' && STATUS_OPTIONS.includes(value as ShipmentStatus);
}

function validateCargoPayload(data: Partial<CargoPayload>): string | null {
  if (!data.awb?.trim()) return 'Nomor AWB wajib diisi.';
  if (!data.shipper?.trim()) return 'Nama pengirim wajib diisi.';
  if (!data.consignee?.trim()) return 'Nama penerima wajib diisi.';
  if (!data.commodity?.trim()) return 'Jenis barang wajib diisi.';
  if (!data.originCode?.trim()) return 'Bandara asal wajib diisi.';
  if (!data.originName?.trim()) return 'Nama bandara asal wajib diisi.';
  if (!data.destinationCode?.trim()) return 'Bandara tujuan wajib diisi.';
  if (!data.destinationName?.trim()) return 'Nama bandara tujuan wajib diisi.';
  if (!data.flightNumber?.trim()) return 'Nomor penerbangan wajib diisi.';
  if (!data.scheduledDeparture?.trim()) return 'Jadwal keberangkatan wajib diisi.';
  if (!isShipmentStatus(data.currentStatus)) return 'Status pengiriman tidak valid.';
  if (typeof data.weight !== 'number' || !Number.isFinite(data.weight) || data.weight <= 0) {
    return 'Berat harus lebih dari 0 kg.';
  }
  if (typeof data.pieces !== 'number' || !Number.isInteger(data.pieces) || data.pieces <= 0) {
    return 'Jumlah barang harus bilangan bulat positif.';
  }

  return null;
}

async function ensureCargoSchema() {
  const sql = getSqlClient();

  await sql.query(`
    CREATE TABLE IF NOT EXISTS airports (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      province TEXT NOT NULL,
      cargo_terminal TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS airlines (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      service_type TEXT NOT NULL,
      home_base TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS flights (
      id TEXT PRIMARY KEY,
      flight_number TEXT NOT NULL UNIQUE,
      airline TEXT NOT NULL,
      origin_code TEXT NOT NULL,
      origin_name TEXT NOT NULL,
      destination_code TEXT NOT NULL,
      destination_name TEXT NOT NULL,
      scheduled_departure TEXT NOT NULL,
      actual_departure TEXT,
      status TEXT NOT NULL,
      cargo_count INT NOT NULL,
      cargo_weight DOUBLE PRECISION NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS shipments (
      awb TEXT PRIMARY KEY,
      shipper TEXT NOT NULL,
      consignee TEXT NOT NULL,
      origin_code TEXT NOT NULL,
      origin_name TEXT NOT NULL,
      destination_code TEXT NOT NULL,
      destination_name TEXT NOT NULL,
      weight DOUBLE PRECISION NOT NULL,
      pieces INT NOT NULL,
      commodity TEXT NOT NULL,
      flight_number TEXT NOT NULL,
      scheduled_departure TEXT NOT NULL,
      current_status TEXT NOT NULL,
      commodity_category_code TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS tracking_events (
      id BIGSERIAL PRIMARY KEY,
      shipment_awb TEXT NOT NULL,
      event_order INT NOT NULL,
      status TEXT NOT NULL,
      event_timestamp TEXT NOT NULL,
      location TEXT NOT NULL,
      officer TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await sql.query(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS shipper_phone TEXT NOT NULL DEFAULT ''`);
  await sql.query(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS consignee_phone TEXT NOT NULL DEFAULT ''`);
  await sql.query(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS origin_city TEXT NOT NULL DEFAULT ''`);
  await sql.query(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS destination_city TEXT NOT NULL DEFAULT ''`);
  await sql.query(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS shipping_date TEXT NOT NULL DEFAULT ''`);
  await sql.query(`ALTER TABLE shipments ADD COLUMN IF NOT EXISTS item_description TEXT NOT NULL DEFAULT ''`);
  await sql.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS tracking_events_shipment_awb_event_order_key
    ON tracking_events (shipment_awb, event_order)
  `);

  return sql;
}

async function ensureAirportReference(
  code: string,
  name: string,
  city: string
) {
  const sql = getSqlClient();
  const airportCode = code.toUpperCase().trim();
  const airportName = name.trim() || airportCode;
  const airportCity = city.trim() || airportName;

  await sql`
    INSERT INTO airports (
      code,
      name,
      city,
      province,
      cargo_terminal
    )
    VALUES (
      ${airportCode},
      ${airportName},
      ${airportCity},
      ${'Belum ditentukan'},
      ${'Terminal Kargo'}
    )
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      city = EXCLUDED.city,
      province = CASE
        WHEN airports.province = '' THEN EXCLUDED.province
        ELSE airports.province
      END,
      cargo_terminal = CASE
        WHEN airports.cargo_terminal = '' THEN EXCLUDED.cargo_terminal
        ELSE airports.cargo_terminal
      END
  `;
}

async function ensureManualAirlineReference(homeBase: string) {
  const sql = getSqlClient();

  await sql`
    INSERT INTO airlines (
      code,
      name,
      service_type,
      home_base
    )
    VALUES (
      ${'MAN'},
      ${'Manual Entry'},
      ${'Manual Entry'},
      ${homeBase.toUpperCase().trim()}
    )
    ON CONFLICT (name) DO UPDATE SET
      service_type = EXCLUDED.service_type,
      home_base = EXCLUDED.home_base
  `;
}

function mapShipmentRows(rows: ShipmentRow[], trackingRows: TrackingRow[]): Shipment[] {
  const trackingByAwb = new Map<string, TrackingEvent[]>();

  for (const event of trackingRows) {
    const list = trackingByAwb.get(event.shipment_awb) ?? [];
    list.push({
      status: event.status,
      timestamp: event.event_timestamp,
      location: event.location,
      officer: event.officer,
      note: event.note,
    });
    trackingByAwb.set(event.shipment_awb, list);
  }

  return rows.map((row) => ({
    awb: row.awb,
    shipper: row.shipper,
    shipperPhone: row.shipper_phone ?? '',
    consignee: row.consignee,
    consigneePhone: row.consignee_phone ?? '',
    origin: { code: row.origin_code, name: row.origin_name },
    originCity: row.origin_city ?? '',
    destination: { code: row.destination_code, name: row.destination_name },
    destinationCity: row.destination_city ?? '',
    shippingDate: row.shipping_date ?? '',
    weight: Number(row.weight),
    pieces: Number(row.pieces),
    commodity: row.commodity,
    itemDescription: row.item_description ?? '',
    flightNumber: row.flight_number,
    scheduledDeparture: row.scheduled_departure,
    currentStatus: row.current_status,
    tracking: trackingByAwb.get(row.awb) ?? [],
  }));
}

async function listShipments(): Promise<Shipment[]> {
  const sql = await ensureCargoSchema();

  const rows = (await sql`
    SELECT
      awb,
      shipper,
      shipper_phone,
      consignee,
      consignee_phone,
      origin_code,
      origin_name,
      origin_city,
      destination_code,
      destination_name,
      destination_city,
      shipping_date,
      weight,
      pieces,
      commodity,
      item_description,
      flight_number,
      scheduled_departure,
      current_status
    FROM shipments
    ORDER BY updated_at DESC, awb ASC
  `) as ShipmentRow[];

  const trackingRows = (await sql`
    SELECT
      shipment_awb,
      status,
      event_timestamp,
      location,
      officer,
      note
    FROM tracking_events
    ORDER BY shipment_awb ASC, event_order ASC
  `) as TrackingRow[];

  return mapShipmentRows(rows, trackingRows);
}

async function getShipment(awb: string): Promise<Shipment | null> {
  const shipments = await listShipments();
  return shipments.find((shipment) => shipment.awb === awb) ?? null;
}

async function ensureFlight(data: CargoPayload) {
  const sql = getSqlClient();
  const flightNumber = data.flightNumber.toUpperCase().trim();

  await ensureAirportReference(data.originCode, data.originName, data.originCity ?? '');
  await ensureAirportReference(data.destinationCode, data.destinationName, data.destinationCity ?? '');
  await ensureManualAirlineReference(data.originCode);

  await sql`
    INSERT INTO flights (
      id,
      flight_number,
      airline,
      origin_code,
      origin_name,
      destination_code,
      destination_name,
      scheduled_departure,
      actual_departure,
      status,
      cargo_count,
      cargo_weight,
      updated_at
    )
    VALUES (
      ${`manual-${flightNumber}`},
      ${flightNumber},
      ${'Manual Entry'},
      ${data.originCode},
      ${data.originName},
      ${data.destinationCode},
      ${data.destinationName},
      ${data.scheduledDeparture},
      ${null},
      ${'on-time'},
      ${0},
      ${0},
      NOW()
    )
    ON CONFLICT (flight_number) DO UPDATE SET
      origin_code = EXCLUDED.origin_code,
      origin_name = EXCLUDED.origin_name,
      destination_code = EXCLUDED.destination_code,
      destination_name = EXCLUDED.destination_name,
      scheduled_departure = EXCLUDED.scheduled_departure,
      updated_at = NOW()
  `;
}

async function refreshFlightCargo(flightNumber: string) {
  if (!flightNumber.trim()) return;

  const sql = getSqlClient();
  await sql`
    UPDATE flights
    SET
      cargo_count = COALESCE((
        SELECT SUM(pieces)::int
        FROM shipments
        WHERE flight_number = ${flightNumber}
      ), 0),
      cargo_weight = COALESCE((
        SELECT SUM(weight)
        FROM shipments
        WHERE flight_number = ${flightNumber}
      ), 0),
      updated_at = NOW()
    WHERE flight_number = ${flightNumber}
  `;
}

function getCategoryCode(commodity: string): string | null {
  const normalized = commodity.toLowerCase();
  if (normalized.includes('obat') || normalized.includes('segar') || normalized.includes('buah')) {
    return 'COLD_CHAIN';
  }
  if (normalized.includes('dokumen')) return 'DOCUMENTS';
  if (normalized.includes('elektronik')) return 'ELECTRONICS';
  if (normalized.includes('perhiasan')) return 'VALUABLES';
  if (normalized.includes('mesin') || normalized.includes('spare') || normalized.includes('cadang')) {
    return 'INDUSTRIAL_PARTS';
  }
  return null;
}

async function createShipment(data: CargoPayload, officerName: string): Promise<Shipment> {
  const sql = await ensureCargoSchema();
  const awb = data.awb.toUpperCase().trim();

  const [duplicate] = (await sql`
    SELECT awb FROM shipments WHERE LOWER(awb) = LOWER(${awb}) LIMIT 1
  `) as Array<{ awb: string }>;

  if (duplicate) {
    throw new Error(`AWB ${awb} sudah ada dalam database Neon.`);
  }

  await ensureFlight(data);

  await sql`
    INSERT INTO shipments (
      awb,
      shipper,
      shipper_phone,
      consignee,
      consignee_phone,
      origin_code,
      origin_name,
      origin_city,
      destination_code,
      destination_name,
      destination_city,
      shipping_date,
      weight,
      pieces,
      commodity,
      item_description,
      flight_number,
      scheduled_departure,
      current_status,
      commodity_category_code,
      updated_at
    )
    VALUES (
      ${awb},
      ${data.shipper.trim()},
      ${data.shipperPhone?.trim() ?? ''},
      ${data.consignee.trim()},
      ${data.consigneePhone?.trim() ?? ''},
      ${data.originCode},
      ${data.originName},
      ${data.originCity?.trim() ?? ''},
      ${data.destinationCode},
      ${data.destinationName},
      ${data.destinationCity?.trim() ?? ''},
      ${data.shippingDate ?? ''},
      ${data.weight},
      ${data.pieces},
      ${data.commodity},
      ${data.itemDescription?.trim() ?? ''},
      ${data.flightNumber.toUpperCase().trim()},
      ${data.scheduledDeparture},
      ${data.currentStatus},
      ${getCategoryCode(data.commodity)},
      NOW()
    )
  `;

  await sql`
    INSERT INTO tracking_events (
      shipment_awb,
      event_order,
      status,
      event_timestamp,
      location,
      officer,
      note
    )
    VALUES (
      ${awb},
      ${1},
      ${data.currentStatus},
      ${nowTimestamp()},
      ${`${data.originCode} - Gudang Penerimaan`},
      ${officerName},
      ${`Kargo baru didaftarkan ke database Neon oleh ${officerName}`}
    )
  `;

  await refreshFlightCargo(data.flightNumber.toUpperCase().trim());

  const shipment = await getShipment(awb);
  if (!shipment) throw new Error(`Kargo ${awb} gagal dibaca setelah disimpan.`);
  return shipment;
}

async function updateShipment(
  awb: string,
  data: CargoPayload,
  officerName: string
): Promise<Shipment> {
  const sql = await ensureCargoSchema();
  const current = await getShipment(awb);
  if (!current) throw new Error(`Kargo ${awb} tidak ditemukan di database Neon.`);

  await ensureFlight(data);

  const nextFlightNumber = data.flightNumber.toUpperCase().trim();

  await sql`
    UPDATE shipments
    SET
      shipper = ${data.shipper.trim()},
      shipper_phone = ${data.shipperPhone?.trim() ?? ''},
      consignee = ${data.consignee.trim()},
      consignee_phone = ${data.consigneePhone?.trim() ?? ''},
      origin_code = ${data.originCode},
      origin_name = ${data.originName},
      origin_city = ${data.originCity?.trim() ?? ''},
      destination_code = ${data.destinationCode},
      destination_name = ${data.destinationName},
      destination_city = ${data.destinationCity?.trim() ?? ''},
      shipping_date = ${data.shippingDate ?? ''},
      weight = ${data.weight},
      pieces = ${data.pieces},
      commodity = ${data.commodity},
      item_description = ${data.itemDescription?.trim() ?? ''},
      flight_number = ${nextFlightNumber},
      scheduled_departure = ${data.scheduledDeparture},
      current_status = ${data.currentStatus},
      commodity_category_code = ${getCategoryCode(data.commodity)},
      updated_at = NOW()
    WHERE awb = ${awb}
  `;

  if (data.currentStatus !== current.currentStatus) {
    const [row] = (await sql`
      SELECT COALESCE(MAX(event_order), 0)::int + 1 AS next_order
      FROM tracking_events
      WHERE shipment_awb = ${awb}
    `) as Array<{ next_order: number }>;

    await sql`
      INSERT INTO tracking_events (
        shipment_awb,
        event_order,
        status,
        event_timestamp,
        location,
        officer,
        note
      )
      VALUES (
        ${awb},
        ${row?.next_order ?? 1},
        ${data.currentStatus},
        ${nowTimestamp()},
        ${`${data.destinationCode} - Update Status`},
        ${officerName},
        ${`Status diperbarui dari "${current.currentStatus}" ke "${data.currentStatus}" oleh ${officerName}`}
      )
    `;
  }

  await refreshFlightCargo(current.flightNumber);
  await refreshFlightCargo(nextFlightNumber);

  const shipment = await getShipment(awb);
  if (!shipment) throw new Error(`Kargo ${awb} gagal dibaca setelah diperbarui.`);
  return shipment;
}

async function deleteShipment(awb: string): Promise<void> {
  const sql = await ensureCargoSchema();
  const current = await getShipment(awb);
  if (!current) throw new Error(`Kargo ${awb} tidak ditemukan di database Neon.`);

  await sql`DELETE FROM tracking_events WHERE shipment_awb = ${awb}`;
  await sql`DELETE FROM shipments WHERE awb = ${awb}`;
  await refreshFlightCargo(current.flightNumber);
}

function getErrorResponse(error: unknown) {
  console.error('Cargo API failed.', error);
  const message = error instanceof Error ? error.message : 'Operasi database kargo gagal.';
  const hint = message.includes('fetch failed')
    ? 'Koneksi ke Neon gagal. Periksa DATABASE_URL_UNPOOLED / POSTGRES_URL_NON_POOLING di .env dan koneksi internet dev server.'
    : undefined;

  return Response.json({ error: message, hint }, { status: 500 });
}

export async function GET() {
  try {
    return Response.json({ shipments: await listShipments() });
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { data?: CargoPayload; officerName?: string };
    if (!body.data) {
      return Response.json({ error: 'Payload kargo tidak ditemukan.' }, { status: 400 });
    }

    const validationError = validateCargoPayload(body.data);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    const shipment = await createShipment(body.data, body.officerName?.trim() || 'Sistem');
    return Response.json({ shipment }, { status: 201 });
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      awb?: string;
      data?: CargoPayload;
      officerName?: string;
    };
    if (!body.awb?.trim() || !body.data) {
      return Response.json({ error: 'Nomor AWB dan payload kargo wajib dikirim.' }, { status: 400 });
    }

    const validationError = validateCargoPayload(body.data);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    const shipment = await updateShipment(
      body.awb.toUpperCase().trim(),
      body.data,
      body.officerName?.trim() || 'Sistem'
    );
    return Response.json({ shipment });
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { awb?: string };
    if (!body.awb?.trim()) {
      return Response.json({ error: 'Nomor AWB wajib dikirim.' }, { status: 400 });
    }

    const awb = body.awb.toUpperCase().trim();
    await deleteShipment(awb);
    return Response.json({ awb });
  } catch (error) {
    return getErrorResponse(error);
  }
}
