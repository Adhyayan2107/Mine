import type { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { todayDateString } from '@/lib/dates';
import { morningNotifications } from '@/lib/notification-rules';
import { sendPushToAll } from '@/lib/push';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const notifications = await morningNotifications(db, todayDateString());
  for (const notification of notifications) {
    await sendPushToAll(db, notification);
  }
  return Response.json({ sent: notifications.length });
}
