'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { todayDateString, isValidDateString } from '@/lib/dates';
import { getDailyLog, upsertDailyLog } from '@/db/queries/daily-log';

/**
 * Every quick-log action can target a past day (dashboard day navigation).
 * No date means today; a malformed or future date is rejected.
 */
function resolveDate(date?: string): string | null {
  const today = todayDateString();
  if (!date) return today;
  if (!isValidDateString(date) || date > today) return null;
  return date;
}

export async function logWeightAction(weightKg: number, date?: string): Promise<void> {
  const day = resolveDate(date);
  if (!day) return;
  await upsertDailyLog(db, day, { weightKg });
  revalidatePath('/dashboard');
}

/** Calories accumulate across the day — each log is a meal, not a total. */
export async function addCaloriesAction(addKcal: number, date?: string): Promise<void> {
  const day = resolveDate(date);
  if (!day) return;
  const existing = await getDailyLog(db, day);
  await upsertDailyLog(db, day, {
    caloriesKcal: (existing?.caloriesKcal ?? 0) + Math.round(addKcal),
  });
  revalidatePath('/dashboard');
}

/** Protein accumulates the same way — 80g logged, then 30g, reads 110g. */
export async function addProteinAction(addG: number, date?: string): Promise<void> {
  const day = resolveDate(date);
  if (!day) return;
  const existing = await getDailyLog(db, day);
  await upsertDailyLog(db, day, {
    proteinG: (existing?.proteinG ?? 0) + Math.round(addG),
  });
  revalidatePath('/dashboard');
}

export async function logStepsAction(steps: number, date?: string): Promise<void> {
  const day = resolveDate(date);
  if (!day) return;
  await upsertDailyLog(db, day, { steps: Math.round(steps) });
  revalidatePath('/dashboard');
}

export async function addWaterAction(addMl: number, date?: string): Promise<void> {
  const day = resolveDate(date);
  if (!day) return;
  const existing = await getDailyLog(db, day);
  await upsertDailyLog(db, day, { waterMl: (existing?.waterMl ?? 0) + addMl });
  revalidatePath('/dashboard');
}

export async function setWorkoutSplitDayAction(workoutSplitDayId: number, date?: string): Promise<void> {
  const day = resolveDate(date);
  if (!day) return;
  await upsertDailyLog(db, day, { workoutSplitDayId });
  revalidatePath('/dashboard');
}
