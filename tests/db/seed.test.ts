import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { seedIfNeeded } from '@/db/seed';
import { profile, workoutSplitDays, categories, habits, dashboardWidgetConfigs } from '@/db/schema';

describe('seedIfNeeded', () => {
  it('populates all defaults exactly once', async () => {
    const db = await createTestDb();

    await seedIfNeeded(db);

    const profileRows = await db.select().from(profile);
    expect(profileRows).toHaveLength(1);
    expect(profileRows[0].name).toBe('Adhyayan Gupta');
    expect(await db.select().from(workoutSplitDays)).toHaveLength(7);
    expect(await db.select().from(categories)).toHaveLength(5);
    expect(await db.select().from(habits)).toHaveLength(10);
    expect(await db.select().from(dashboardWidgetConfigs)).toHaveLength(10);

    // idempotent: second call is a no-op
    await seedIfNeeded(db);
    expect(await db.select().from(habits)).toHaveLength(10);
  });
});
