import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import type { AppDatabase } from './types';

// `prepare: false` is required when POSTGRES_URL points at a PgBouncer-style
// pooler in transaction mode (e.g. Supabase's pooled connection on port
// 6543) — prepared statements don't survive across pooled connections since
// each query can land on a different backend. Harmless against a direct
// (non-pooled) connection too, so this is safe either way.
const queryClient = postgres(process.env.POSTGRES_URL!, { prepare: false });

export const db: AppDatabase = drizzle(queryClient, { schema });
