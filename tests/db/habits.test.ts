import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import {
  insertHabit,
  toggleHabitToday,
  listCompletedHabitIdsForDate,
  listRecentCompletionsForHabits,
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

  it('listRecentCompletionsForHabits batches every habit into one query, excluding dates before the window', async () => {
    const db = await createTestDb();
    const gym = await insertHabit(db, { name: 'Gym' });
    const journal = await insertHabit(db, { name: 'Journal' });
    const today = '2026-08-07';

    await toggleHabitToday(db, gym.id, today);
    await toggleHabitToday(db, gym.id, '2026-07-01'); // outside the 30-day window below
    await toggleHabitToday(db, journal.id, addDaysToDateString(today, -1));

    const result = await listRecentCompletionsForHabits(
      db,
      [gym.id, journal.id],
      addDaysToDateString(today, -29),
    );

    expect(result.get(gym.id)?.has(today)).toBe(true);
    expect(result.get(gym.id)?.has('2026-07-01')).toBe(false);
    expect(result.get(journal.id)?.has(addDaysToDateString(today, -1))).toBe(true);
  });
});
