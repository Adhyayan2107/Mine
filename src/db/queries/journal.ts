import { eq, desc } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { journalEntries, type JournalEntry, type NewJournalEntry } from '../schema';

export async function getJournalEntry(db: AppDatabase, date: string): Promise<JournalEntry | null> {
  const rows = await db.select().from(journalEntries).where(eq(journalEntries.date, date)).limit(1);
  return rows[0] ?? null;
}

export async function upsertJournalEntry(
  db: AppDatabase,
  date: string,
  patch: Partial<NewJournalEntry>,
): Promise<void> {
  const existing = await getJournalEntry(db, date);
  if (existing) {
    await db.update(journalEntries).set(patch).where(eq(journalEntries.id, existing.id));
  } else {
    await db.insert(journalEntries).values({ ...patch, date });
  }
}

export async function listJournalEntriesDescending(db: AppDatabase): Promise<JournalEntry[]> {
  return db.select().from(journalEntries).orderBy(desc(journalEntries.date));
}
