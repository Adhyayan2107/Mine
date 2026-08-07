import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { seedIfNeeded } from '@/db/seed';
import { getProfile, updateProfile } from '@/db/queries/profile';

describe('profile queries', () => {
  it('getProfile returns null before seeding, then the seeded row after', async () => {
    const db = await createTestDb();
    expect(await getProfile(db)).toBeNull();
    await seedIfNeeded(db);
    const profile = await getProfile(db);
    expect(profile?.name).toBe('Adhyayan Gupta');
  });

  it('updateProfile patches only the given fields', async () => {
    const db = await createTestDb();
    await seedIfNeeded(db);
    await updateProfile(db, { goalWeightKg: 92 });
    const profile = await getProfile(db);
    expect(profile?.goalWeightKg).toBe(92);
    expect(profile?.dailyCaloriesKcal).toBe(2500);
  });
});
