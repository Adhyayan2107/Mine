'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { addSelection, removeSelection, addSet, deleteSet } from '@/db/queries/workouts';
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

export async function logSetAction(exerciseId: number, weightKg: number, reps: number): Promise<void> {
  if (!Number.isFinite(weightKg) || weightKg < 0 || !Number.isInteger(reps) || reps <= 0) return;
  await addSet(db, todayDateString(), exerciseId, weightKg, reps);
  revalidate();
}

export async function deleteSetAction(id: number): Promise<void> {
  await deleteSet(db, id);
  revalidate();
}
