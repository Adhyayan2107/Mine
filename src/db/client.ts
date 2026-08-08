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
//
// `max_pipeline: 1` is load-bearing against Supavisor/PgBouncer transaction
// pooling: postgres.js pipelines concurrent queries onto one socket (default
// allows 100 in flight), and the pooler stops responding to pipelined
// extended-protocol traffic — reproduced as the dashboard's Promise.all burst
// hanging until the function timed out while sequential pages worked fine.
// One query in flight per socket at a time; parallelism comes from `max`.
const queryClient = postgres(process.env.POSTGRES_URL!, {
  prepare: false,
  // ponytail: strictly serial — one socket, one query in flight. The only mode
  // that never hung against Supavisor in testing; costs ~2ms/query when the
  // function and database share a region. Raise max only with evidence that
  // concurrent sockets through this pooler are reliable.
  max: 1,
  // Runtime-supported but missing from postgres.js's published types.
  ...({ max_pipeline: 1 } as object),
  idle_timeout: 20, // seconds; release idle sockets before the pooler reaps them
  connect_timeout: 10, // seconds; fail fast instead of hanging the page
  max_lifetime: 60 * 30, // recycle sockets half-hourly so none rot
});

export const db: AppDatabase = drizzle(queryClient, { schema });
