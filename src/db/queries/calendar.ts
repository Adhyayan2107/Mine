import { and, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { dailyLogs, journalEntries, habitCompletions, habits, todos, workoutSplitDays, cardioSessions } from '../schema';

export type DayActivity = {
  hasWeight: boolean;
  hasWorkout: boolean;
  habitsCompleted: number;
  hasJournal: boolean;
  /** Rode along outside the 4-part camp score — shown as its own marker. */
  hasCardio: boolean;
};

/** One pass over the month's rows, grouped by date — not one query per day. */
export async function getMonthActivity(
  db: AppDatabase,
  startDate: string,
  endDate: string,
): Promise<Map<string, DayActivity>> {
  const [logRows, journalRows, completionRows, cardioRows] = await Promise.all([
    db.select().from(dailyLogs).where(and(gte(dailyLogs.date, startDate), lte(dailyLogs.date, endDate))),
    db
      .select()
      .from(journalEntries)
      .where(and(gte(journalEntries.date, startDate), lte(journalEntries.date, endDate))),
    db
      .select()
      .from(habitCompletions)
      .where(and(gte(habitCompletions.date, startDate), lte(habitCompletions.date, endDate))),
    db
      .select({ date: cardioSessions.date })
      .from(cardioSessions)
      .where(and(gte(cardioSessions.date, startDate), lte(cardioSessions.date, endDate))),
  ]);

  const map = new Map<string, DayActivity>();
  function entryFor(date: string): DayActivity {
    let entry = map.get(date);
    if (!entry) {
      entry = { hasWeight: false, hasWorkout: false, habitsCompleted: 0, hasJournal: false, hasCardio: false };
      map.set(date, entry);
    }
    return entry;
  }

  for (const log of logRows) {
    const entry = entryFor(log.date);
    entry.hasWeight = log.weightKg != null;
    entry.hasWorkout = log.workoutSplitDayId != null;
  }
  for (const j of journalRows) {
    entryFor(j.date).hasJournal = true;
  }
  for (const c of completionRows) {
    entryFor(c.date).habitsCompleted += 1;
  }
  for (const c of cardioRows) {
    entryFor(c.date).hasCardio = true;
  }
  return map;
}

export type DayDetail = {
  date: string;
  weightKg: number | null;
  caloriesKcal: number | null;
  proteinG: number | null;
  waterMl: number;
  steps: number | null;
  workoutLabel: string | null;
  habitsCompleted: string[];
  journalEntry: {
    morningPlan: string | null;
    wins: string | null;
    lessons: string | null;
    tomorrowFocus: string | null;
    mood: number | null;
    energy: number | null;
  } | null;
  todosCompletedThatDay: string[];
  todosDueThatDay: string[];
};

export async function getDayDetail(db: AppDatabase, date: string): Promise<DayDetail> {
  const [logRows, journalRows, completionRows, dueTodos, completedTodos] = await Promise.all([
    db.select().from(dailyLogs).where(eq(dailyLogs.date, date)).limit(1),
    db.select().from(journalEntries).where(eq(journalEntries.date, date)).limit(1),
    db.select({ habitId: habitCompletions.habitId }).from(habitCompletions).where(eq(habitCompletions.date, date)),
    db.select().from(todos).where(eq(todos.dueDate, date)),
    db.select().from(todos).where(sql`${todos.completedAt}::date = ${date}`),
  ]);

  const log = logRows[0];
  let workoutLabel: string | null = null;
  if (log?.workoutSplitDayId != null) {
    const [split] = await db
      .select()
      .from(workoutSplitDays)
      .where(eq(workoutSplitDays.id, log.workoutSplitDayId))
      .limit(1);
    workoutLabel = split?.label ?? null;
  }

  let habitsCompleted: string[] = [];
  if (completionRows.length > 0) {
    const rows = await db
      .select()
      .from(habits)
      .where(inArray(habits.id, completionRows.map((r) => r.habitId)));
    habitsCompleted = rows.map((h) => h.name);
  }

  return {
    date,
    weightKg: log?.weightKg ?? null,
    caloriesKcal: log?.caloriesKcal ?? null,
    proteinG: log?.proteinG ?? null,
    waterMl: log?.waterMl ?? 0,
    steps: log?.steps ?? null,
    workoutLabel,
    habitsCompleted,
    journalEntry: journalRows[0] ?? null,
    todosCompletedThatDay: completedTodos.map((t) => t.title),
    todosDueThatDay: dueTodos.map((t) => t.title),
  };
}
