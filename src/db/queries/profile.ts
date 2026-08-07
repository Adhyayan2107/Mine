import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { profile, type Profile, type NewProfile } from '../schema';

export async function getProfile(db: AppDatabase): Promise<Profile | null> {
  const rows = await db.select().from(profile).limit(1);
  return rows[0] ?? null;
}

export async function updateProfile(db: AppDatabase, patch: Partial<NewProfile>): Promise<void> {
  const existing = await getProfile(db);
  if (!existing) throw new Error('Profile has not been seeded yet');
  await db.update(profile).set(patch).where(eq(profile.id, existing.id));
}
