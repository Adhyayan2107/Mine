import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { seedIfNeeded } from '@/db/seed';
import { upsertDailyLog } from '@/db/queries/daily-log';
import { insertTodo } from '@/db/queries/todos';
import { insertHabit, toggleHabitToday } from '@/db/queries/habits';
import { morningNotifications, middayNotifications, eveningNotifications } from '@/lib/notification-rules';

const TODAY = '2026-08-07';

describe('morningNotifications', () => {
  it('flags unlogged weight and todos due today', async () => {
    const db = await createTestDb();
    await insertTodo(db, { title: 'Submit report', dueDate: TODAY });

    const notifications = await morningNotifications(db, TODAY);

    expect(notifications.some((n) => n.title === 'Log your weight')).toBe(true);
    expect(notifications.some((n) => n.title.includes('task'))).toBe(true);
  });

  it('stays silent once weight is logged and no todos are due', async () => {
    const db = await createTestDb();
    await upsertDailyLog(db, TODAY, { weightKg: 106.5 });

    expect(await morningNotifications(db, TODAY)).toHaveLength(0);
  });
});

describe('middayNotifications', () => {
  it('fires only when water intake is behind half the daily target', async () => {
    const db = await createTestDb();
    await seedIfNeeded(db);
    await upsertDailyLog(db, TODAY, { waterMl: 500 });

    expect(await middayNotifications(db, TODAY)).toHaveLength(1);

    await upsertDailyLog(db, TODAY, { waterMl: 2500 });
    expect(await middayNotifications(db, TODAY)).toHaveLength(0);
  });
});

describe('eveningNotifications', () => {
  it('flags open habits and tasks overdue as of yesterday, but not tasks merely due today', async () => {
    const db = await createTestDb();
    await insertHabit(db, { name: 'Journal' });
    await insertTodo(db, { title: 'Overdue task', dueDate: '2026-08-05' });
    await insertTodo(db, { title: 'Due today, not overdue', dueDate: TODAY });

    const notifications = await eveningNotifications(db, TODAY);

    expect(notifications.some((n) => n.title.includes('habit'))).toBe(true);
    const overdueNotification = notifications.find((n) => n.title.includes('overdue'));
    expect(overdueNotification?.body).toContain('Overdue task');
    expect(overdueNotification?.body).not.toContain('Due today, not overdue');
  });

  it('stops flagging a habit once it is completed for the day', async () => {
    const db = await createTestDb();
    const habit = await insertHabit(db, { name: 'Journal' });
    await toggleHabitToday(db, habit.id, TODAY);

    const notifications = await eveningNotifications(db, TODAY);
    expect(notifications.some((n) => n.title.includes('habit'))).toBe(false);
  });
});
