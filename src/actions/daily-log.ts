'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { todayDateString } from '@/lib/dates';
import { getDailyLog, upsertDailyLog } from '@/db/queries/daily-log';

export async function logWeightAction(weightKg: number): Promise<void> {
  await upsertDailyLog(db, todayDateString(), { weightKg });
  revalidatePath('/dashboard');
}

export async function logCaloriesAction(caloriesKcal: number): Promise<void> {
  await upsertDailyLog(db, todayDateString(), { caloriesKcal: Math.round(caloriesKcal) });
  revalidatePath('/dashboard');
}

export async function logProteinAction(proteinG: number): Promise<void> {
  await upsertDailyLog(db, todayDateString(), { proteinG: Math.round(proteinG) });
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
