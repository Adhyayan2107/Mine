import webpush, { WebPushError } from 'web-push';
import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../db/types';
import { pushSubscriptions } from '../db/schema';
import type { NotificationPayload } from './notification-rules';

let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  webpush.setVapidDetails(
    'mailto:you@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

export async function sendPushToAll(db: AppDatabase, payload: NotificationPayload): Promise<void> {
  ensureConfigured();
  const subs = await db.select().from(pushSubscriptions);

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        );
      } catch (err) {
        if (err instanceof WebPushError && (err.statusCode === 404 || err.statusCode === 410)) {
          // Subscription is gone (browser data cleared, app uninstalled) — stop trying it.
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        } else {
          console.error('push send failed', err);
        }
      }
    }),
  );
}
