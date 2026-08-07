'use server';

import { db } from '@/db/client';
import { getDayDetail, type DayDetail } from '@/db/queries/calendar';

export async function getDayDetailAction(date: string): Promise<DayDetail> {
  return getDayDetail(db, date);
}
