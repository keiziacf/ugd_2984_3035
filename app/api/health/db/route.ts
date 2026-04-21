import { getSqlClient } from '@/lib/neon';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type DbHealthRow = {
  database_name: string;
  server_time: string;
};

export async function GET() {
  try {
    const sql = getSqlClient();
    const [row] = (await sql`
      SELECT current_database() AS database_name, NOW()::text AS server_time
    `) as DbHealthRow[];

    return Response.json({
      connected: true,
      provider: 'neon',
      database: row.database_name,
      checkedAt: row.server_time,
    });
  } catch (error) {
    console.error('Database health check failed.', error);

    return Response.json(
      {
        connected: false,
        provider: 'neon',
        error: 'Database connection failed.',
      },
      { status: 500 }
    );
  }
}
