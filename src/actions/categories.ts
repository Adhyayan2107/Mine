'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { insertCategory, deleteCategory } from '@/db/queries/categories';

export async function createCategoryAction(name: string): Promise<void> {
  // Postgres `integer` is signed 32-bit — an ARGB value with the alpha byte
  // set overflows it unless read back as its two's-complement signed form.
  await insertCategory(db, { name, colorValue: 0xff4db6ac | 0 });
  revalidatePath('/todos/categories');
  revalidatePath('/todos');
}

export async function deleteCategoryAction(id: number): Promise<void> {
  await deleteCategory(db, id);
  revalidatePath('/todos/categories');
  revalidatePath('/todos');
}
