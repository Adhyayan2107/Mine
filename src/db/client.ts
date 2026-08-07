import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import type { AppDatabase } from './types';

const queryClient = postgres(process.env.POSTGRES_URL!);

export const db: AppDatabase = drizzle(queryClient, { schema });
