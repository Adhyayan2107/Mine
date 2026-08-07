import { db } from '@/db/client';
import { listCategories } from '@/db/queries/categories';
import { CategoryManager } from '@/components/todos/CategoryManager';

export default async function CategoriesPage() {
  const categories = await listCategories(db);
  return (
    <div className="p-4">
      <CategoryManager categories={categories} />
    </div>
  );
}
