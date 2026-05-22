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
    const message =
      error instanceof Error ? error.message : 'Database connection failed.';
    const hint = message.includes('fetch failed')
      ? 'Neon connection could not be reached from the dev server. Check internet access and the unpooled connection string in .env.'
      : undefined;

    return Response.json(
      {
        connected: false,
        provider: 'neon',
        error: message,
        hint,
      },
      { status: 500 }
    );
  }
}
