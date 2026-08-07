'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { insertTodo, updateTodo, toggleTodoComplete, deleteTodo } from '@/db/queries/todos';
import type { NewTodo } from '@/db/schema';

export async function createTodoAction(entry: NewTodo): Promise<void> {
  await insertTodo(db, entry);
  revalidatePath('/todos');
  revalidatePath('/dashboard');
}

export async function updateTodoAction(id: number, patch: Partial<NewTodo>): Promise<void> {
  await updateTodo(db, id, patch);
  revalidatePath('/todos');
  revalidatePath('/dashboard');
}

export async function toggleTodoCompleteAction(id: number, isCompleted: boolean): Promise<void> {
  await toggleTodoComplete(db, id, isCompleted);
  revalidatePath('/todos');
  revalidatePath('/dashboard');
}

export async function deleteTodoAction(id: number): Promise<void> {
  await deleteTodo(db, id);
  revalidatePath('/todos');
  revalidatePath('/dashboard');
}
