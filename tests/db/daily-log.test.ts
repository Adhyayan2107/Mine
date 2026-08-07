import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { getDailyLog, upsertDailyLog, listLastNDays, workoutStreak } from '@/db/queries/daily-log';
import { workoutSplitDays } from '@/db/schema';

describe('daily log queries', () => {
  it('upsertDailyLog creates then patches a single row per date', async () => {
    const db = await createTestDb();
    const day = '2026-08-04';

    await upsertDailyLog(db, day, { weightKg: 107.0 });
    let row = await getDailyLog(db, day);
    expect(row?.weightKg).toBe(107.0);
    expect(row?.caloriesKcal).toBeNull();

    await upsertDailyLog(db, day, { caloriesKcal: 2200 });
    row = await getDailyLog(db, day);
    expect(row?.weightKg).toBe(107.0);
    expect(row?.caloriesKcal).toBe(2200);
  });

  it('listLastNDays only returns rows within the window', async () => {
    const db = await createTestDb();
    await upsertDailyLog(db, '2026-07-01', { steps: 1000 });
    await upsertDailyLog(db, '2026-08-04', { steps: 9000 });

    const rows = await listLastNDays(db, 7, '2026-08-04');
    expect(rows).toHaveLength(1);
    expect(rows[0].steps).toBe(9000);
  });

  it('workoutStreak counts consecutive logged-workout days ending today', async () => {
    const db = await createTestDb();
    const [split] = await db.insert(workoutSplitDays).values({ orderIndex: 0, label: 'Push' }).returning();
    const today = '2026-08-07';

    await upsertDailyLog(db, today, { workoutSplitDayId: split.id });
    await upsertDailyLog(db, '2026-08-06', { workoutSplitDayId: split.id });
    await upsertDailyLog(db, '2026-08-05', {}); // no split logged — breaks the streak here

    expect(await workoutStreak(db, today)).toBe(2);
  });
});
