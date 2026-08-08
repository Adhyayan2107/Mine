import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import type { AppDatabase } from './types';

// node-postgres (pg), not postgres.js. postgres.js kept hanging against
// Supabase's Supavisor transaction pooler — queries stuck until the function
// timed out, reproduced across two projects/regions in both concurrent and
// serial modes. pg never pipelines, checks one query out per connection, and
// is the driver Supabase's own docs pair with the pooler.
//
// query_timeout is the backstop: if the pooler ever eats a query anyway, the
// page gets an error in 15s instead of a 60s gateway timeout.
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 3,
  idleTimeoutMillis: 20_000, // release idle sockets before the pooler reaps them
  connectionTimeoutMillis: 10_000, // fail fast on connect instead of hanging
  query_timeout: 15_000,
  maxLifetimeSeconds: 60 * 30, // recycle sockets half-hourly so none rot
  // Supabase's pooler presents a self-signed chain; encrypt without CA
  // verification, per Supabase's own pg guidance. Local non-TLS dev
  // connections (localhost) skip ssl entirely.
  ssl: process.env.POSTGRES_URL?.includes('localhost') ? undefined : { rejectUnauthorized: false },
});

export const db: AppDatabase = drizzle(pool, { schema });
