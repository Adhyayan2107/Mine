import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { dashboardWidgetConfigs, type DashboardWidgetConfig } from '../schema';

export async function listDashboardWidgets(db: AppDatabase): Promise<DashboardWidgetConfig[]> {
  return db.select().from(dashboardWidgetConfigs).orderBy(dashboardWidgetConfigs.sortOrder);
}

export async function setDashboardWidgetEnabled(
  db: AppDatabase,
  id: number,
  isEnabled: boolean,
): Promise<void> {
  await db.update(dashboardWidgetConfigs).set({ isEnabled }).where(eq(dashboardWidgetConfigs.id, id));
}

export async function moveDashboardWidget(
  db: AppDatabase,
  id: number,
  direction: 'up' | 'down',
): Promise<void> {
  const all = await listDashboardWidgets(db);
  const index = all.findIndex((w) => w.id === id);
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= all.length) return;

  const a = all[index];
  const b = all[swapIndex];
  await db
    .update(dashboardWidgetConfigs)
    .set({ sortOrder: b.sortOrder })
    .where(eq(dashboardWidgetConfigs.id, a.id));
  await db
    .update(dashboardWidgetConfigs)
    .set({ sortOrder: a.sortOrder })
    .where(eq(dashboardWidgetConfigs.id, b.id));
}
