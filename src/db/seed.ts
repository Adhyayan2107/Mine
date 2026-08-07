import type { AppDatabase } from './types';
import { profile, workoutSplitDays, categories, habits, dashboardWidgetConfigs } from './schema';
import {
  SEED_PROFILE,
  SEED_WORKOUT_SPLIT,
  SEED_CATEGORIES,
  SEED_HABITS,
  SEED_DASHBOARD_WIDGET_ORDER,
} from './seed-data';

export async function seedIfNeeded(db: AppDatabase): Promise<void> {
  const existing = await db.select().from(profile).limit(1);
  if (existing.length > 0) return;

  await db.insert(profile).values(SEED_PROFILE);

  await db.insert(workoutSplitDays).values(
    SEED_WORKOUT_SPLIT.map((label, i) => ({ orderIndex: i, label })),
  );

  await db.insert(categories).values(
    // Postgres `integer` is signed 32-bit — an ARGB value with the alpha byte
    // set (0xff......) overflows it unless read back as its two's-complement
    // signed form, hence `| 0` here and everywhere else this constant is used.
    SEED_CATEGORIES.map((name) => ({ name, colorValue: 0xff4db6ac | 0 })),
  );

  await db.insert(habits).values(
    SEED_HABITS.map((name, i) => ({ name, sortOrder: i })),
  );

  await db.insert(dashboardWidgetConfigs).values(
    SEED_DASHBOARD_WIDGET_ORDER.map((widgetKey, i) => ({ widgetKey, sortOrder: i })),
  );
}
