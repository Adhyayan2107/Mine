import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import {
  listPushSubscriptions,
  upsertPushSubscription,
  deletePushSubscriptionByEndpoint,
} from '@/db/queries/push-subscriptions';

describe('push subscription queries', () => {
  it('upsertPushSubscription inserts once, then updates the same row on re-subscribe', async () => {
    const db = await createTestDb();
    await upsertPushSubscription(db, { endpoint: 'https://push.example/abc', p256dh: 'key1', auth: 'auth1' });
    await upsertPushSubscription(db, { endpoint: 'https://push.example/abc', p256dh: 'key2', auth: 'auth2' });

    const rows = await listPushSubscriptions(db);
    expect(rows).toHaveLength(1);
    expect(rows[0].p256dh).toBe('key2');
  });

  it('concurrent subscribe calls for the same endpoint do not throw (regression: unique-constraint race)', async () => {
    const db = await createTestDb();

    await Promise.all([
      upsertPushSubscription(db, { endpoint: 'https://push.example/race', p256dh: 'a', auth: 'a' }),
      upsertPushSubscription(db, { endpoint: 'https://push.example/race', p256dh: 'b', auth: 'b' }),
    ]);

    const rows = await listPushSubscriptions(db);
    expect(rows.filter((r) => r.endpoint === 'https://push.example/race')).toHaveLength(1);
  });

  it('deletePushSubscriptionByEndpoint removes the matching row', async () => {
    const db = await createTestDb();
    await upsertPushSubscription(db, { endpoint: 'https://push.example/xyz', p256dh: 'k', auth: 'a' });
    await deletePushSubscriptionByEndpoint(db, 'https://push.example/xyz');
    expect(await listPushSubscriptions(db)).toHaveLength(0);
  });
});
