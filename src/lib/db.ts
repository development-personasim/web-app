import "server-only";

import {
  Pool,
  type PoolClient,
  type PoolConfig,
  type QueryResult,
  type QueryResultRow,
} from "pg";

type DbGlobal = typeof globalThis & {
  __pgPool?: Pool;
};

const globalForDb = globalThis as DbGlobal;

function poolMax() {
  const parsed = Number(process.env.DATABASE_POOL_MAX ?? 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 10;
}

function isLocalDatabase(connectionString: string) {
  return (
    /@(localhost|127\.0\.0\.1)(:\d+)?\//.test(connectionString) ||
    /sslmode=disable/i.test(connectionString)
  );
}

function poolConfig(connectionString: string): PoolConfig {
  const max = poolMax();

  if (isLocalDatabase(connectionString)) {
    return { connectionString, max };
  }

  // pg treats sslmode=require as verify-full and overwrites an explicit ssl
  // option. Supabase encrypts the connection; drop sslmode and set ssl here.
  const withoutSslMode = connectionString
    .replace(/([?&])(sslmode|uselibpqcompat)=[^&]*/gi, "")
    .replace("?&", "?")
    .replace(/[?&]$/, "");

  return {
    connectionString: withoutSslMode,
    max,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    ssl: { rejectUnauthorized: false },
  };
}

function getPool() {
  if (globalForDb.__pgPool) {
    return globalForDb.__pgPool;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Use the Supabase Postgres pooler URI.",
    );
  }

  const pool = new Pool(poolConfig(connectionString));
  globalForDb.__pgPool = pool;
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, [...params]);
}

export async function withTransaction<T>(
  run: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const result = await run(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
