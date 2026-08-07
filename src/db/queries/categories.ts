import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { categories, type Category, type NewCategory } from '../schema';

export async function listCategories(db: AppDatabase): Promise<Category[]> {
  return db.select().from(categories);
}

export async function insertCategory(db: AppDatabase, entry: NewCategory): Promise<Category> {
  const [row] = await db.insert(categories).values(entry).returning();
  return row;
}

export async function deleteCategory(db: AppDatabase, id: number): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id));
}
