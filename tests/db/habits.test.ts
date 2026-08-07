import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import {
  insertHabit,
  toggleHabitToday,
  listCompletedHabitIdsForDate,
  currentStreak,
  longestStreak,
} from '@/db/queries/habits';
import { addDaysToDateString } from '@/lib/dates';

describe('habit queries', () => {
  it('toggleHabitToday completes then undoes', async () => {
    const db = await createTestDb();
    const habit = await insertHabit(db, { name: 'Gym' });
    const today = '2026-08-07';

    await toggleHabitToday(db, habit.id, today);
    let completed = await listCompletedHabitIdsForDate(db, today);
    expect(completed.has(habit.id)).toBe(true);

    await toggleHabitToday(db, habit.id, today);
    completed = await listCompletedHabitIdsForDate(db, today);
    expect(completed.has(habit.id)).toBe(false);
  });

  it('a rapid double-tap while off does not throw (regression: unique-constraint race)', async () => {
    const db = await createTestDb();
    const habit = await insertHabit(db, { name: 'Gym' });
    const today = '2026-08-07';

    await Promise.all([toggleHabitToday(db, habit.id, today), toggleHabitToday(db, habit.id, today)]);

    const completed = await listCompletedHabitIdsForDate(db, today);
    expect(completed.has(habit.id)).toBe(true);
  });

  it('currentStreak counts consecutive days ending today, longestStreak finds the longest run', async () => {
    const db = await createTestDb();
    const habit = await insertHabit(db, { name: 'Journal' });
    const today = '2026-08-07';

    await toggleHabitToday(db, habit.id, today);
    await toggleHabitToday(db, habit.id, addDaysToDateString(today, -1));
    await toggleHabitToday(db, habit.id, addDaysToDateString(today, -2));
    await toggleHabitToday(db, habit.id, addDaysToDateString(today, -5));

    expect(await currentStreak(db, habit.id, today)).toBe(3);
    expect(await longestStreak(db, habit.id)).toBe(3);
  });
});
