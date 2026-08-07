import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { seedIfNeeded } from '@/db/seed';
import { insertHabit } from '@/db/queries/habits';
import { getProfile } from '@/db/queries/profile';
import { exportAllTables, importAllTables, resetAllData } from '@/db/queries/data-portability';

describe('data portability', () => {
  it('export then import round-trips the profile into a fresh database', async () => {
    const sourceDb = await createTestDb();
    await seedIfNeeded(sourceDb);
    const exported = await exportAllTables(sourceDb);

    const targetDb = await createTestDb();
    await importAllTables(targetDb, exported);

    const profile = await getProfile(targetDb);
    expect(profile?.name).toBe('Adhyayan Gupta');
  });

  it('importAllTables rejects an unsupported schema version', async () => {
    const db = await createTestDb();
    await expect(importAllTables(db, { schemaVersion: 999 })).rejects.toThrow(/Unsupported/);
  });

  it('resetAllData wipes custom data and reseeds defaults', async () => {
    const db = await createTestDb();
    await seedIfNeeded(db);
    await insertHabit(db, { name: 'Custom habit' });

    await resetAllData(db);

    const profile = await getProfile(db);
    expect(profile?.name).toBe('Adhyayan Gupta');
  });
});
