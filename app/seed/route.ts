import { setupProjectDatabase } from '@/lib/project-database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const report = await setupProjectDatabase();

    return Response.json({
      message: 'Project database migration and seed completed successfully.',
      connection: report.connection,
      masterTables: report.masterTables,
      transactionTables: report.transactionTables,
      junctionTables: report.junctionTables,
      counts: Object.fromEntries(
        report.projectTables.map((table) => [table.table, table.count])
      ),
      emptyProjectTables: report.emptyProjectTables,
      warnings: report.warnings,
    });
  } catch (error) {
    console.error('Project database setup failed.', error);
    const message =
      error instanceof Error ? error.message : 'Failed to set up project database.';
    const hint = message.includes('fetch failed')
      ? 'Connection to Neon failed. Verify internet access from the dev server and check the DATABASE_URL_UNPOOLED or POSTGRES_URL_NON_POOLING value in .env.'
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
