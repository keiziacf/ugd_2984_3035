import dns from 'node:dns';
import https from 'node:https';

import { neon, neonConfig } from '@neondatabase/serverless';

dns.setDefaultResultOrder('ipv4first');

function getConnectionString() {
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL_UNPOOLED, POSTGRES_URL_NON_POOLING, DATABASE_URL, or POSTGRES_URL is not configured.'
    );
  }

  return connectionString;
}

async function ipv4Fetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const request = new Request(input, init);
  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  const body =
    request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : Buffer.from(await request.arrayBuffer());

  return new Promise((resolve, reject) => {
    const clientRequest = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port === '' ? 443 : Number(url.port),
        path: `${url.pathname}${url.search}`,
        method: request.method,
        headers: Object.fromEntries(headers.entries()),
        family: 4,
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        response.on('end', () => {
          const responseHeaders = new Headers();

          for (const [name, value] of Object.entries(response.headers)) {
            if (Array.isArray(value)) {
              for (const item of value) {
                responseHeaders.append(name, item);
              }
              continue;
            }

            if (typeof value === 'string') {
              responseHeaders.set(name, value);
            }
          }

          resolve(
            new Response(Buffer.concat(chunks), {
              status: response.statusCode ?? 500,
              statusText: response.statusMessage ?? '',
              headers: responseHeaders,
            })
          );
        });
      }
    );

    clientRequest.on('error', reject);

    if (request.signal.aborted) {
      clientRequest.destroy(new DOMException('The operation was aborted.', 'AbortError'));
      return;
    }

    const abortHandler = () => {
      clientRequest.destroy(new DOMException('The operation was aborted.', 'AbortError'));
    };

    request.signal.addEventListener('abort', abortHandler, { once: true });

    clientRequest.on('close', () => {
      request.signal.removeEventListener('abort', abortHandler);
    });

    if (body && body.length > 0) {
      clientRequest.write(body);
    }

    clientRequest.end();
  });
}

neonConfig.fetchFunction = ipv4Fetch;

export function getSqlClient() {
  return neon(getConnectionString());
}
