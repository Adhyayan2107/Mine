'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { updateProfile } from '@/db/queries/profile';
import type { NewProfile } from '@/db/schema';

export async function updateProfileAction(patch: Partial<NewProfile>): Promise<void> {
  await updateProfile(db, patch);
  revalidatePath('/settings');
  revalidatePath('/dashboard');
}

export async function setThemeModeAction(themeMode: 'dark' | 'light' | 'system'): Promise<void> {
  await updateProfile(db, { themeMode });
  revalidatePath('/settings');
  revalidatePath('/', 'layout');
}
