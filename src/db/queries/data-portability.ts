import {
  profile,
  workoutSplitDays,
  dailyLogs,
  categories,
  todos,
  habits,
  habitCompletions,
  journalEntries,
  dashboardWidgetConfigs,
} from '../schema';
import type { AppDatabase } from '../types';
import { seedIfNeeded } from '../seed';

export const EXPORT_SCHEMA_VERSION = 1;

export async function exportAllTables(db: AppDatabase) {
  const [profileRows, splitRows, logRows, categoryRows, todoRows, habitRows, journalRows, widgetRows] =
    await Promise.all([
      db.select().from(profile),
      db.select().from(workoutSplitDays),
      db.select().from(dailyLogs),
      db.select().from(categories),
      db.select().from(todos),
      db.select().from(habits),
      db.select().from(journalEntries),
      db.select().from(dashboardWidgetConfigs),
    ]);

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    profile: profileRows[0] ?? null,
    workoutSplitDays: splitRows,
    dailyLogs: logRows,
    categories: categoryRows,
    todos: todoRows,
    habits: habitRows,
    journalEntries: journalRows,
    dashboardWidgetConfigs: widgetRows,
  };
}

async function clearAllTables(db: AppDatabase): Promise<void> {
  await db.delete(dashboardWidgetConfigs);
  await db.delete(journalEntries);
  await db.delete(habitCompletions);
  await db.delete(habits);
  await db.delete(todos);
  await db.delete(categories);
  await db.delete(dailyLogs);
  await db.delete(workoutSplitDays);
  await db.delete(profile);
}

type ExportedData = Partial<Awaited<ReturnType<typeof exportAllTables>>> & { schemaVersion: number };

export async function importAllTables(db: AppDatabase, raw: ExportedData): Promise<void> {
  if (raw.schemaVersion !== EXPORT_SCHEMA_VERSION) {
    throw new Error(`Unsupported export schema version: ${raw.schemaVersion}`);
  }

  await db.transaction(async (tx) => {
    const txDb = tx as AppDatabase;
    await clearAllTables(txDb);

    if (raw.profile) await txDb.insert(profile).values(raw.profile);
    if (raw.workoutSplitDays?.length) await txDb.insert(workoutSplitDays).values(raw.workoutSplitDays);
    if (raw.dailyLogs?.length) await txDb.insert(dailyLogs).values(raw.dailyLogs);
    if (raw.categories?.length) await txDb.insert(categories).values(raw.categories);
    if (raw.todos?.length) await txDb.insert(todos).values(raw.todos);
    if (raw.habits?.length) await txDb.insert(habits).values(raw.habits);
    if (raw.journalEntries?.length) await txDb.insert(journalEntries).values(raw.journalEntries);
    if (raw.dashboardWidgetConfigs?.length) {
      await txDb.insert(dashboardWidgetConfigs).values(raw.dashboardWidgetConfigs);
    }
  });
}

export async function resetAllData(db: AppDatabase): Promise<void> {
  await db.transaction(async (tx) => {
    await clearAllTables(tx as AppDatabase);
  });
  await seedIfNeeded(db);
}
