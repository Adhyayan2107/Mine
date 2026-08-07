import type { AppDatabase } from '../db/types';
import { getProfile } from '../db/queries/profile';
import { getDailyLog } from '../db/queries/daily-log';
import { listDueTodayOrOverdue } from '../db/queries/todos';
import { listActiveHabits, listCompletedHabitIdsForDate } from '../db/queries/habits';
import { addDaysToDateString } from './dates';

export type NotificationPayload = { title: string; body: string };

export async function morningNotifications(db: AppDatabase, today: string): Promise<NotificationPayload[]> {
  const notifications: NotificationPayload[] = [];

  const todayLog = await getDailyLog(db, today);
  if (todayLog?.weightKg == null) {
    notifications.push({ title: 'Log your weight', body: "You haven't logged today's weight yet." });
  }

  const dueTodayOrOverdue = await listDueTodayOrOverdue(db, today);
  if (dueTodayOrOverdue.length > 0) {
    notifications.push({
      title: `${dueTodayOrOverdue.length} task${dueTodayOrOverdue.length === 1 ? '' : 's'} due today`,
      body: dueTodayOrOverdue.map((t) => t.title).slice(0, 3).join(', '),
    });
  }

  return notifications;
}

export async function middayNotifications(db: AppDatabase, today: string): Promise<NotificationPayload[]> {
  const profile = await getProfile(db);
  if (!profile) return [];

  const todayLog = await getDailyLog(db, today);
  const waterMl = todayLog?.waterMl ?? 0;
  const halfTarget = profile.dailyWaterMl * 0.5;

  if (waterMl < halfTarget) {
    return [{ title: "You're behind on water", body: `${waterMl}ml of ${profile.dailyWaterMl}ml so far today.` }];
  }
  return [];
}

export async function eveningNotifications(db: AppDatabase, today: string): Promise<NotificationPayload[]> {
  const notifications: NotificationPayload[] = [];

  const activeHabits = await listActiveHabits(db);
  const completedIds = await listCompletedHabitIdsForDate(db, today);
  const openCount = activeHabits.filter((h) => !completedIds.has(h.id)).length;
  if (openCount > 0) {
    notifications.push({
      title: `${openCount} habit${openCount === 1 ? '' : 's'} still open today`,
      body: 'Close them out before the day ends.',
    });
  }

  // "Overdue as of yesterday" — deliberately excludes tasks due today, which
  // the morning notification already covers.
  const yesterday = addDaysToDateString(today, -1);
  const overdue = await listDueTodayOrOverdue(db, yesterday);
  if (overdue.length > 0) {
    notifications.push({
      title: `${overdue.length} overdue task${overdue.length === 1 ? '' : 's'}`,
      body: overdue.map((t) => t.title).slice(0, 3).join(', '),
    });
  }

  return notifications;
}
