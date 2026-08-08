'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { insertHabit, updateHabit, archiveHabit, deleteHabit, toggleHabitToday } from '@/db/queries/habits';
import { todayDateString } from '@/lib/dates';
import type { NewHabit } from '@/db/schema';

export async function createHabitAction(entry: NewHabit): Promise<void> {
  await insertHabit(db, entry);
  revalidatePath('/habits');
}

export async function updateHabitAction(id: number, patch: Partial<NewHabit>): Promise<void> {
  await updateHabit(db, id, patch);
  revalidatePath('/habits');
  revalidatePath(`/habits/${id}`);
}

export async function archiveHabitAction(id: number): Promise<void> {
  await archiveHabit(db, id);
  revalidatePath('/habits');
}

export async function deleteHabitAction(id: number): Promise<void> {
  await deleteHabit(db, id);
  revalidatePath('/habits');
  revalidatePath('/dashboard');
}

export async function toggleHabitTodayAction(habitId: number): Promise<void> {
  await toggleHabitToday(db, habitId, todayDateString());
  revalidatePath('/habits');
  revalidatePath(`/habits/${habitId}`);
  revalidatePath('/dashboard');
}

/** Retroactive checkoff — the same toggle, for any day up to today. */
export async function toggleHabitOnDateAction(habitId: number, date: string): Promise<void> {
  if (date > todayDateString()) return;
  await toggleHabitToday(db, habitId, date);
  revalidatePath('/habits');
  revalidatePath(`/habits/${habitId}`);
  revalidatePath('/dashboard');
  revalidatePath('/calendar');
}
