'use server';

import { db } from '@/db/client';
import { upsertPushSubscription, deletePushSubscriptionByEndpoint } from '@/db/queries/push-subscriptions';

export async function subscribeToPushAction(sub: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<void> {
  await upsertPushSubscription(db, { endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth });
}

export async function unsubscribeFromPushAction(endpoint: string): Promise<void> {
  await deletePushSubscriptionByEndpoint(db, endpoint);
}
