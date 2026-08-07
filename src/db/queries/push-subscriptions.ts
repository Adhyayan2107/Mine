import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { pushSubscriptions, type PushSubscription, type NewPushSubscription } from '../schema';

export async function listPushSubscriptions(db: AppDatabase): Promise<PushSubscription[]> {
  return db.select().from(pushSubscriptions);
}

export async function upsertPushSubscription(db: AppDatabase, entry: NewPushSubscription): Promise<void> {
  // A real atomic upsert, not check-then-write — a double-tap on "Enable
  // Notifications" would otherwise race two concurrent inserts against the
  // same unique `endpoint` (same bug class as seedIfNeeded/toggleHabitToday).
  await db
    .insert(pushSubscriptions)
    .values(entry)
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { p256dh: entry.p256dh, auth: entry.auth },
    });
}

export async function deletePushSubscriptionByEndpoint(db: AppDatabase, endpoint: string): Promise<void> {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}
