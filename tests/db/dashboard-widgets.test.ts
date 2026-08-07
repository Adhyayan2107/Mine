import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { seedIfNeeded } from '@/db/seed';
import {
  listDashboardWidgets,
  setDashboardWidgetEnabled,
  moveDashboardWidget,
} from '@/db/queries/dashboard-widgets';

describe('dashboard widget queries', () => {
  it('setDashboardWidgetEnabled toggles a single widget', async () => {
    const db = await createTestDb();
    await seedIfNeeded(db);
    const [first] = await listDashboardWidgets(db);

    await setDashboardWidgetEnabled(db, first.id, false);
    const after = await listDashboardWidgets(db);
    expect(after.find((w) => w.id === first.id)?.isEnabled).toBe(false);
  });

  it('moveDashboardWidget swaps sortOrder with its neighbor', async () => {
    const db = await createTestDb();
    await seedIfNeeded(db);
    const [first, second] = await listDashboardWidgets(db);

    await moveDashboardWidget(db, second.id, 'up');

    const after = await listDashboardWidgets(db);
    expect(after[0].id).toBe(second.id);
    expect(after[1].id).toBe(first.id);
  });
});
