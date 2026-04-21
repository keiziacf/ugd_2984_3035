import { neon } from '@neondatabase/serverless';

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL or POSTGRES_URL is not configured.');
  }

  return connectionString;
}

export function getSqlClient() {
  return neon(getConnectionString());
}
