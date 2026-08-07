import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { insertTodo, toggleTodoComplete, listTodos, listDueTodayOrOverdue } from '@/db/queries/todos';
import { addDaysToDateString } from '@/lib/dates';

describe('todo queries', () => {
  it('listDueTodayOrOverdue excludes completed and future todos', async () => {
    const db = await createTestDb();
    const today = '2026-08-07';

    await insertTodo(db, { title: 'Overdue task', dueDate: addDaysToDateString(today, -2) });
    const future = await insertTodo(db, { title: 'Future task', dueDate: addDaysToDateString(today, 5) });
    const completed = await insertTodo(db, { title: 'Completed today', dueDate: today });
    await toggleTodoComplete(db, completed.id, true);

    const results = await listDueTodayOrOverdue(db, today);

    expect(results.map((t) => t.title)).toContain('Overdue task');
    expect(results.some((t) => t.id === future.id)).toBe(false);
    expect(results.some((t) => t.id === completed.id)).toBe(false);
  });

  it('toggleTodoComplete sets and clears completedAt', async () => {
    const db = await createTestDb();
    const todo = await insertTodo(db, { title: 'Buy protein' });

    await toggleTodoComplete(db, todo.id, true);
    let all = await listTodos(db);
    expect(all[0].completedAt).not.toBeNull();

    await toggleTodoComplete(db, todo.id, false);
    all = await listTodos(db);
    expect(all[0].completedAt).toBeNull();
  });
});
