import { and, eq, isNotNull, lte } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { todos, type Todo, type NewTodo } from '../schema';

export async function listTodos(db: AppDatabase): Promise<Todo[]> {
  // Null due_time sorts after set times within a day — "by EOD" comes last.
  return db.select().from(todos).orderBy(todos.dueDate, todos.dueTime);
}

export async function listDueTodayOrOverdue(db: AppDatabase, today: string): Promise<Todo[]> {
  return db
    .select()
    .from(todos)
    .where(and(eq(todos.isCompleted, false), isNotNull(todos.dueDate), lte(todos.dueDate, today)));
}

export async function insertTodo(db: AppDatabase, entry: NewTodo): Promise<Todo> {
  const [row] = await db.insert(todos).values(entry).returning();
  return row;
}

export async function updateTodo(db: AppDatabase, id: number, patch: Partial<NewTodo>): Promise<void> {
  await db.update(todos).set(patch).where(eq(todos.id, id));
}

export async function toggleTodoComplete(db: AppDatabase, id: number, isCompleted: boolean): Promise<void> {
  await db
    .update(todos)
    .set({ isCompleted, completedAt: isCompleted ? new Date().toISOString() : null })
    .where(eq(todos.id, id));
}

export async function deleteTodo(db: AppDatabase, id: number): Promise<void> {
  await db.delete(todos).where(eq(todos.id, id));
}
