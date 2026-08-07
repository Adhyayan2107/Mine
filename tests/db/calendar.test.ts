import { describe, it, expect } from 'vitest';
import { sql } from 'drizzle-orm';
import { createTestDb } from '@/db/test-client';
import { getMonthActivity, getDayDetail } from '@/db/queries/calendar';
import { upsertDailyLog } from '@/db/queries/daily-log';
import { upsertJournalEntry } from '@/db/queries/journal';
import { insertHabit, toggleHabitToday } from '@/db/queries/habits';
import { insertTodo, toggleTodoComplete } from '@/db/queries/todos';
import { workoutSplitDays } from '@/db/schema';

describe('getMonthActivity', () => {
  it('groups activity by date across daily logs, journal, and habit completions', async () => {
    const db = await createTestDb();
    const [split] = await db.insert(workoutSplitDays).values({ orderIndex: 0, label: 'Push' }).returning();
    const habit = await insertHabit(db, { name: 'Gym' });

    await upsertDailyLog(db, '2026-08-05', { weightKg: 106, workoutSplitDayId: split.id });
    await upsertJournalEntry(db, '2026-08-05', { wins: 'Solid session' });
    await toggleHabitToday(db, habit.id, '2026-08-05');
    await upsertDailyLog(db, '2026-08-06', { weightKg: 105.8 });

    const activity = await getMonthActivity(db, '2026-08-01', '2026-08-31');

    const day5 = activity.get('2026-08-05');
    expect(day5?.hasWeight).toBe(true);
    expect(day5?.hasWorkout).toBe(true);
    expect(day5?.hasJournal).toBe(true);
    expect(day5?.habitsCompleted).toBe(1);

    const day6 = activity.get('2026-08-06');
    expect(day6?.hasWeight).toBe(true);
    expect(day6?.hasWorkout).toBe(false);
    expect(activity.has('2026-08-07')).toBe(false);
  });
});

describe('getDayDetail', () => {
  it('assembles the full day breakdown: log, workout label, habits, journal, todos', async () => {
    const db = await createTestDb();
    const [split] = await db.insert(workoutSplitDays).values({ orderIndex: 0, label: 'Legs' }).returning();
    const habit = await insertHabit(db, { name: 'Journal habit' });
    const date = '2026-08-05';

    await upsertDailyLog(db, date, { weightKg: 106.2, caloriesKcal: 2400, workoutSplitDayId: split.id });
    await upsertJournalEntry(db, date, { wins: 'Hit a PR' });
    await toggleHabitToday(db, habit.id, date);

    await insertTodo(db, { title: 'Submit report', dueDate: date });
    const otherTodo = await insertTodo(db, { title: 'Buy groceries' });
    await toggleTodoComplete(db, otherTodo.id, true);
    // toggleTodoComplete stamps completedAt with the real current time; backdate
    // it to the target test date so the "completed that day" query matches it.
    await db.execute(sql`update todos set completed_at = ${date}::date where id = ${otherTodo.id}`);

    const detail = await getDayDetail(db, date);

    expect(detail.weightKg).toBe(106.2);
    expect(detail.caloriesKcal).toBe(2400);
    expect(detail.workoutLabel).toBe('Legs');
    expect(detail.habitsCompleted).toEqual(['Journal habit']);
    expect(detail.journalEntry?.wins).toBe('Hit a PR');
    expect(detail.todosDueThatDay).toEqual(['Submit report']);
    expect(detail.todosCompletedThatDay).toEqual(['Buy groceries']);
  });
});
