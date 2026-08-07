import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type * as schema from './schema';

export type AppDatabase = PostgresJsDatabase<typeof schema> | PgliteDatabase<typeof schema>;
