import { desc, eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { cardioSessions, type CardioSession, type NewCardioSession } from '../schema';

/**
 * Every cardio outing, newest first. One user's runs stay small enough to
 * fetch whole — bests are computed over the full list, display truncates.
 */
export async function listCardioSessions(db: AppDatabase): Promise<CardioSession[]> {
  return db.select().from(cardioSessions).orderBy(desc(cardioSessions.date), desc(cardioSessions.id));
}

export async function addCardioSession(db: AppDatabase, session: NewCardioSession): Promise<void> {
  await db.insert(cardioSessions).values(session);
}

export async function deleteCardioSession(db: AppDatabase, id: number): Promise<void> {
  await db.delete(cardioSessions).where(eq(cardioSessions.id, id));
}
