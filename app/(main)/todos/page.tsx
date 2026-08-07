import { db } from '@/db/client';
import { listTodos } from '@/db/queries/todos';
import { listCategories } from '@/db/queries/categories';
import { TodoList } from '@/components/todos/TodoList';

export default async function TodosPage() {
  const [todos, categories] = await Promise.all([listTodos(db), listCategories(db)]);
  return <TodoList todos={todos} categories={categories} />;
}
