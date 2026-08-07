'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { exportAllTables, importAllTables, resetAllData } from '@/db/queries/data-portability';

export async function exportDataAction(): Promise<string> {
  const data = await exportAllTables(db);
  return JSON.stringify(data, null, 2);
}

export async function importDataAction(json: string): Promise<void> {
  await importAllTables(db, JSON.parse(json));
  revalidatePath('/', 'layout');
}

export async function resetAllDataAction(): Promise<void> {
  await resetAllData(db);
  revalidatePath('/', 'layout');
}
