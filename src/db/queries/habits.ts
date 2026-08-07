import { and, eq, gte, inArray } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { habits, habitCompletions, type Habit, type NewHabit, type HabitCompletion } from '../schema';
import { addDaysToDateString, dateStringDiffInDays } from '../../lib/dates';

export async function listActiveHabits(db: AppDatabase): Promise<Habit[]> {
  return db.select().from(habits).where(eq(habits.isActive, true)).orderBy(habits.sortOrder);
}

export async function insertHabit(db: AppDatabase, entry: NewHabit): Promise<Habit> {
  const [row] = await db.insert(habits).values(entry).returning();
  return row;
}

export async function updateHabit(db: AppDatabase, id: number, patch: Partial<NewHabit>): Promise<void> {
  await db.update(habits).set(patch).where(eq(habits.id, id));
}

export async function archiveHabit(db: AppDatabase, id: number): Promise<void> {
  await db.update(habits).set({ isActive: false }).where(eq(habits.id, id));
}

export async function listCompletionsForHabit(db: AppDatabase, habitId: number): Promise<HabitCompletion[]> {
  return db.select().from(habitCompletions).where(eq(habitCompletions.habitId, habitId));
}

export async function listCompletedHabitIdsForDate(db: AppDatabase, date: string): Promise<Set<number>> {
  const rows = await db.select().from(habitCompletions).where(eq(habitCompletions.date, date));
  return new Set(rows.map((r) => r.habitId));
}

/** One query for every habit's heatmap, instead of one query per habit. */
export async function listRecentCompletionsForHabits(
  db: AppDatabase,
  habitIds: number[],
  sinceDate: string,
): Promise<Map<number, Set<string>>> {
  const map = new Map<number, Set<string>>(habitIds.map((id) => [id, new Set<string>()]));
  if (habitIds.length === 0) return map;

  const rows = await db
    .select()
    .from(habitCompletions)
    .where(and(inArray(habitCompletions.habitId, habitIds), gte(habitCompletions.date, sinceDate)));
  for (const row of rows) {
    map.get(row.habitId)?.add(row.date);
  }
  return map;
}

/**
 * One-tap checkoff: inserts if today's row is absent, deletes it if present.
 * `onConflictDoNothing` guards a rapid double-tap racing two concurrent
 * "insert" calls into the (habitId, date) unique constraint — without it,
 * the loser of the race would throw instead of silently no-opping.
 */
export async function toggleHabitToday(db: AppDatabase, habitId: number, date: string): Promise<void> {
  const existing = await db
    .select()
    .from(habitCompletions)
    .where(and(eq(habitCompletions.habitId, habitId), eq(habitCompletions.date, date)))
    .limit(1);
  if (existing.length > 0) {
    await db.delete(habitCompletions).where(eq(habitCompletions.id, existing[0].id));
  } else {
    await db.insert(habitCompletions).values({ habitId, date }).onConflictDoNothing();
  }
}

export async function currentStreak(db: AppDatabase, habitId: number, today: string): Promise<number> {
  const rows = await db.select().from(habitCompletions).where(eq(habitCompletions.habitId, habitId));
  const dates = new Set(rows.map((r) => r.date));
  let streak = 0;
  let cursor = today;
  while (dates.has(cursor)) {
    streak++;
    cursor = addDaysToDateString(cursor, -1);
  }
  return streak;
}

export async function longestStreak(db: AppDatabase, habitId: number): Promise<number> {
  const rows = await db
    .select()
    .from(habitCompletions)
    .where(eq(habitCompletions.habitId, habitId))
    .orderBy(habitCompletions.date);
  if (rows.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < rows.length; i++) {
    const gap = dateStringDiffInDays(rows[i].date, rows[i - 1].date);
    current = gap === 1 ? current + 1 : 1;
    if (current > longest) longest = current;
  }
  return longest;
}
