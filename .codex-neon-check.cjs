const fs = require('node:fs');
const dns = require('node:dns');
const { neon } = require('@neondatabase/serverless');

dns.setDefaultResultOrder('ipv4first');

const env = Object.fromEntries(
  fs
    .readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1)];
    })
);

async function check(label, connectionString) {
  try {
    const sql = neon(connectionString);
    const [row] = await sql.query(
      `
        SELECT
          current_database() AS database_name,
          current_setting('neon.branch_id', true) AS branch_id,
          current_setting('neon.branch_name', true) AS branch_name,
          current_setting('neon.endpoint_id', true) AS endpoint_id
      `
    );

    console.log(`${label}: OK ${JSON.stringify(row)}`);
  } catch (error) {
    console.log(
      `${label}: FAIL ${
        error && error.message ? error.message : String(error)
      }`
    );
  }
}

(async () => {
  await check('current DATABASE_URL', env.DATABASE_URL);

  const pooled = new URL(env.DATABASE_URL);
  pooled.hostname =
    'ep-weathered-wind-am4gvdfp-pooler.c-5.us-east-1.aws.neon.tech';
  await check('candidate pooled ep-weathered-wind-am4gvdfp', pooled.toString());

  const direct = new URL(env.DATABASE_URL_UNPOOLED || env.DATABASE_URL);
  direct.hostname = 'ep-weathered-wind-am4gvdfp.c-5.us-east-1.aws.neon.tech';
  direct.searchParams.set('sslmode', 'require');
  await check('candidate unpooled ep-weathered-wind-am4gvdfp', direct.toString());
})();
