import { getSqlClient } from '@/lib/neon';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ShipmentOverviewRow = {
  awb: string;
  shipper: string;
  consignee: string;
  current_status: string;
  flight_number: string;
  airline: string;
  route: string;
  latest_location: string;
  latest_timestamp: string;
  tracking_event_count: number;
};

async function listShipmentOverview() {
  const sql = getSqlClient();

  const data = (await sql`
    WITH latest_tracking AS (
      SELECT DISTINCT ON (shipment_awb)
        shipment_awb,
        location,
        event_timestamp
      FROM tracking_events
      ORDER BY shipment_awb, event_order DESC
    )
    SELECT
      s.awb,
      s.shipper,
      s.consignee,
      s.current_status,
      s.flight_number,
      f.airline,
      CONCAT(s.origin_code, ' -> ', s.destination_code) AS route,
      lt.location AS latest_location,
      lt.event_timestamp AS latest_timestamp,
      COUNT(te.id)::int AS tracking_event_count
    FROM shipments s
    LEFT JOIN flights f ON s.flight_number = f.flight_number
    LEFT JOIN latest_tracking lt ON s.awb = lt.shipment_awb
    LEFT JOIN tracking_events te ON s.awb = te.shipment_awb
    GROUP BY
      s.awb,
      s.shipper,
      s.consignee,
      s.current_status,
      s.flight_number,
      f.airline,
      s.origin_code,
      s.destination_code,
      lt.location,
      lt.event_timestamp
    ORDER BY s.awb
    LIMIT 10;
  `) as ShipmentOverviewRow[];

  return data;
}

export async function GET() {
  try {
    return Response.json(await listShipmentOverview());
  } catch (error) {
    console.error('Database query failed.', error);
    const message =
      error instanceof Error ? error.message : 'Failed to execute query.';
    const hint = message.includes('fetch failed')
      ? 'Neon connection could not be reached from the dev server. Check internet access and the unpooled connection string in .env.'
      : undefined;

    return Response.json(
      {
        error: message,
        hint,
      },
      { status: 500 }
    );
  }
}
