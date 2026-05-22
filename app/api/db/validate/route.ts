import { getDatabaseValidationReport } from '@/lib/project-database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return Response.json(await getDatabaseValidationReport());
  } catch (error) {
    console.error('Database validation failed.', error);
    const message =
      error instanceof Error ? error.message : 'Failed to validate project database.';
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
