'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { upsertJournalEntry } from '@/db/queries/journal';
import { todayDateString } from '@/lib/dates';
import type { NewJournalEntry } from '@/db/schema';

export async function saveJournalEntryAction(patch: Partial<NewJournalEntry>): Promise<void> {
  await upsertJournalEntry(db, todayDateString(), patch);
  revalidatePath('/journal');
  revalidatePath('/journal/history');
}
