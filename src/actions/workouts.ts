'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import {
  addSelection,
  removeSelection,
  addSet,
  deleteSet,
  createExercise,
  pairSuperset,
  unpairSuperset,
} from '@/db/queries/workouts';
import { addCardioSession, deleteCardioSession } from '@/db/queries/cardio';
import { upsertDailyLog } from '@/db/queries/daily-log';
import { todayDateString } from '@/lib/dates';

function revalidate() {
  revalidatePath('/workout');
  revalidatePath('/dashboard');
}

export async function addExerciseAction(exerciseId: number): Promise<void> {
  await addSelection(db, todayDateString(), exerciseId);
  revalidate();
}

export async function removeExerciseAction(exerciseId: number): Promise<void> {
  await removeSelection(db, todayDateString(), exerciseId);
  revalidate();
}

export async function logSetAction(
  exerciseId: number,
  weightKg: number,
  reps: number,
  setType: 'normal' | 'drop' = 'normal',
): Promise<void> {
  if (!Number.isFinite(weightKg) || weightKg < 0 || !Number.isInteger(reps) || reps <= 0) return;
  if (setType !== 'normal' && setType !== 'drop') return;
  await addSet(db, todayDateString(), exerciseId, weightKg, reps, setType);
  revalidate();
}

export async function pairSupersetAction(exerciseId: number, partnerId: number): Promise<void> {
  if (exerciseId === partnerId) return;
  await pairSuperset(db, todayDateString(), exerciseId, partnerId);
  revalidate();
}

export async function unpairSupersetAction(exerciseId: number): Promise<void> {
  await unpairSuperset(db, todayDateString(), exerciseId);
  revalidate();
}

export async function deleteSetAction(id: number): Promise<void> {
  await deleteSet(db, id);
  revalidate();
}

/** Submit the session — the workout tab returns to the hub. */
export async function finishWorkoutAction(): Promise<void> {
  await upsertDailyLog(db, todayDateString(), { workoutFinishedAt: new Date().toISOString() });
  revalidate();
}

/** Reopen a submitted session to fix a missed set. */
export async function reopenWorkoutAction(): Promise<void> {
  await upsertDailyLog(db, todayDateString(), { workoutFinishedAt: null });
  revalidate();
}

const CARDIO_TYPES = ['run', 'walk', 'cycle', 'other'];

export async function logCardioAction(input: {
  type: string;
  durationMin: number;
  distanceKm?: number;
  caloriesKcal?: number;
}): Promise<void> {
  const { type, durationMin, distanceKm, caloriesKcal } = input;
  if (!CARDIO_TYPES.includes(type)) return;
  if (!Number.isInteger(durationMin) || durationMin <= 0 || durationMin > 24 * 60) return;
  if (distanceKm !== undefined && (!Number.isFinite(distanceKm) || distanceKm <= 0 || distanceKm > 500)) return;
  if (caloriesKcal !== undefined && (!Number.isInteger(caloriesKcal) || caloriesKcal <= 0 || caloriesKcal > 20000)) return;
  await addCardioSession(db, {
    date: todayDateString(),
    type,
    durationMin,
    distanceKm: distanceKm ?? null,
    caloriesKcal: caloriesKcal ?? null,
  });
  revalidatePath('/workout');
  revalidatePath('/calendar');
}

export async function deleteCardioAction(id: number): Promise<void> {
  await deleteCardioSession(db, id);
  revalidatePath('/workout');
  revalidatePath('/calendar');
}

const MUSCLE_GROUPS = ['chest', 'lats', 'biceps', 'triceps', 'shoulders', 'legs', 'abs'];

/** Create a custom movement and put it straight onto today's session. */
export async function createExerciseAction(name: string, muscleGroup: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 80 || !MUSCLE_GROUPS.includes(muscleGroup)) return;
  const exercise = await createExercise(db, trimmed, muscleGroup);
  await addSelection(db, todayDateString(), exercise.id);
  revalidate();
}
