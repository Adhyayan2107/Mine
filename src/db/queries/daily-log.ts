import { eq, gte } from 'drizzle-orm';
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

export async function listLastNDays(db: AppDatabase, n: number, today: string): Promise<DailyLog[]> {
  const cutoff = addDaysToDateString(today, -(n - 1));
  return db.select().from(dailyLogs).where(gte(dailyLogs.date, cutoff)).orderBy(dailyLogs.date);
}

// ponytail: one query per day walking backward from today; fine at personal-app
// scale (streak rarely exceeds a few hundred days) — batch into a single range
// query with a gap-scan if this ever needs to handle years of unbroken data.
export async function workoutStreak(db: AppDatabase, today: string): Promise<number> {
  let streak = 0;
  let cursor = today;
  while (true) {
    const log = await getDailyLog(db, cursor);
    if (!log?.workoutSplitDayId) break;
    streak++;
    cursor = addDaysToDateString(cursor, -1);
  }
  return streak;
}
