import { desc, eq, gte, isNotNull } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { dailyLogs, type DailyLog, type NewDailyLog } from '../schema';
import { addDaysToDateString } from '../../lib/dates';

export async function getDailyLog(db: AppDatabase, date: string): Promise<DailyLog | null> {
  const rows = await db.select().from(dailyLogs).where(eq(dailyLogs.date, date)).limit(1);
  return rows[0] ?? null;
}

export async function upsertDailyLog(
  db: AppDatabase,
  date: string,
  patch: Partial<NewDailyLog>,
): Promise<void> {
  const existing = await getDailyLog(db, date);
  if (existing) {
    await db.update(dailyLogs).set(patch).where(eq(dailyLogs.id, existing.id));
  } else {
    await db.insert(dailyLogs).values({ ...patch, date });
  }
}

/** Highest weight ever logged — the profile's all-time-high spot height. */
export async function allTimeHighWeight(db: AppDatabase): Promise<number | null> {
  const rows = await db
    .select({ weightKg: dailyLogs.weightKg })
    .from(dailyLogs)
    .where(isNotNull(dailyLogs.weightKg))
    .orderBy(desc(dailyLogs.weightKg))
    .limit(1);
  return rows[0]?.weightKg ?? null;
}

export async function listLastNDays(db: AppDatabase, n: number, today: string): Promise<DailyLog[]> {
  const cutoff = addDaysToDateString(today, -(n - 1));
  return db.select().from(dailyLogs).where(gte(dailyLogs.date, cutoff)).orderBy(dailyLogs.date);
}

// One round trip: pull recent workout dates newest-first and count the
// consecutive run from today in memory. (The old version issued one query
// per streak day — serial round trips that crawled against a remote pooler.)
// ponytail: capped at 400 days; a longer unbroken streak undercounts until
// the limit is raised.
export async function workoutStreak(db: AppDatabase, today: string): Promise<number> {
  const rows = await db
    .select({ date: dailyLogs.date })
    .from(dailyLogs)
    .where(isNotNull(dailyLogs.workoutSplitDayId))
    .orderBy(desc(dailyLogs.date))
    .limit(400);
  const dates = new Set(rows.map((r) => r.date));
  let streak = 0;
  let cursor = today;
  while (dates.has(cursor)) {
    streak++;
    cursor = addDaysToDateString(cursor, -1);
  }
  return streak;
}
