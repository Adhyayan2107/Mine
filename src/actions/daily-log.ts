'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { todayDateString } from '@/lib/dates';
import { getDailyLog, upsertDailyLog } from '@/db/queries/daily-log';

export async function logWeightAction(weightKg: number): Promise<void> {
  await upsertDailyLog(db, todayDateString(), { weightKg });
  revalidatePath('/dashboard');
}

/** Calories accumulate across the day — each log is a meal, not a total. */
export async function addCaloriesAction(addKcal: number): Promise<void> {
  const today = todayDateString();
  const existing = await getDailyLog(db, today);
  await upsertDailyLog(db, today, {
    caloriesKcal: (existing?.caloriesKcal ?? 0) + Math.round(addKcal),
  });
  revalidatePath('/dashboard');
}

/** Protein accumulates the same way — 80g logged, then 30g, reads 110g. */
export async function addProteinAction(addG: number): Promise<void> {
  const today = todayDateString();
  const existing = await getDailyLog(db, today);
  await upsertDailyLog(db, today, {
    proteinG: (existing?.proteinG ?? 0) + Math.round(addG),
  });
  revalidatePath('/dashboard');
}

export async function logStepsAction(steps: number): Promise<void> {
  await upsertDailyLog(db, todayDateString(), { steps: Math.round(steps) });
  revalidatePath('/dashboard');
}

export async function addWaterAction(addMl: number): Promise<void> {
  const today = todayDateString();
  const existing = await getDailyLog(db, today);
  await upsertDailyLog(db, today, { waterMl: (existing?.waterMl ?? 0) + addMl });
  revalidatePath('/dashboard');
}

export async function setWorkoutSplitDayAction(workoutSplitDayId: number): Promise<void> {
  await upsertDailyLog(db, todayDateString(), { workoutSplitDayId });
  revalidatePath('/dashboard');
}
