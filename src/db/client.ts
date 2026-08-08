import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import type { AppDatabase } from './types';

// `prepare: false` is required when POSTGRES_URL points at a PgBouncer-style
// pooler in transaction mode (e.g. Supabase's pooled connection on port
// 6543) — prepared statements don't survive across pooled connections since
// each query can land on a different backend. Harmless against a direct
// (non-pooled) connection too, so this is safe either way.
// The timeouts matter as much as `prepare` on serverless: without them the
// client holds idle sockets open forever, the pooler/NAT silently kills
// them, and the next request reuses a dead connection and hangs with no
// error — the classic "works right after deploy, infinite spinner later".
const queryClient = postgres(process.env.POSTGRES_URL!, {
  prepare: false,
  max: 5, // dashboard fires ~10 queries in parallel; 5 shared sockets is plenty
  idle_timeout: 20, // seconds; release idle sockets before the pooler reaps them
  connect_timeout: 10, // seconds; fail fast instead of hanging the page
  max_lifetime: 60 * 30, // recycle sockets half-hourly so none rot
});

export const db: AppDatabase = drizzle(queryClient, { schema });
