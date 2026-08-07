'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { setDashboardWidgetEnabled, moveDashboardWidget } from '@/db/queries/dashboard-widgets';

export async function setDashboardWidgetEnabledAction(id: number, isEnabled: boolean): Promise<void> {
  await setDashboardWidgetEnabled(db, id, isEnabled);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/widgets');
}

export async function moveDashboardWidgetAction(id: number, direction: 'up' | 'down'): Promise<void> {
  await moveDashboardWidget(db, id, direction);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/widgets');
}
