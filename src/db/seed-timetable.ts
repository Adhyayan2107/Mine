import { eq } from 'drizzle-orm';
import type { AppDatabase } from './types';
import { categories, todos } from './schema';
import { TIMETABLE_TODOS } from './timetable-todos-data';

/**
 * One-time import of the 30-day GTM plan into to-dos, under a "GTM Plan"
 * category. Title-checked per row, so it's safe to leave running on boot
 * and safe to delete once the list has landed.
 */
export async function seedTimetableTodosIfNeeded(db: AppDatabase): Promise<void> {
  let [category] = await db.select().from(categories).where(eq(categories.name, 'GTM Plan')).limit(1);
  if (!category) {
    [category] = await db
      .insert(categories)
      .values({ name: 'GTM Plan', colorValue: 0xff4db6ac | 0 })
      .onConflictDoNothing()
      .returning();
    if (!category) [category] = await db.select().from(categories).where(eq(categories.name, 'GTM Plan')).limit(1);
  }

  for (const entry of TIMETABLE_TODOS) {
    const [existing] = await db.select({ id: todos.id }).from(todos).where(eq(todos.title, entry.title)).limit(1);
    if (existing) continue;
    await db.insert(todos).values({
      title: entry.title,
      notes: entry.notes,
      dueDate: entry.dueDate,
      priority: 'high',
      categoryId: category.id,
    });
  }
}
