'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toggleTodoCompleteAction, deleteTodoAction } from '@/actions/todos';
import { TodoEditModal } from './TodoEditModal';
import { todayDateString } from '@/lib/dates';
import type { Todo, Category } from '@/db/schema';

const PRIORITY_COLOR: Record<string, string> = {
  high: 'bg-ember',
  medium: 'bg-ink-faint',
  low: 'bg-hairline-strong',
};

export function TodoList({ todos, categories }: { todos: Todo[]; categories: Category[] }) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<Record<number, boolean>>({});
  const [editing, setEditing] = useState<Todo | 'new' | null>(null);
  const [, startTransition] = useTransition();
  const today = todayDateString();
  const categoryName = (id: number | null) => categories.find((c) => c.id === id)?.name;

  function toggle(todo: Todo) {
    const next = !(optimistic[todo.id] ?? todo.isCompleted);
    setOptimistic((prev) => ({ ...prev, [todo.id]: next }));
    startTransition(async () => {
      await toggleTodoCompleteAction(todo.id, next);
      router.refresh();
    });
  }

  function remove(id: number) {
    startTransition(async () => {
      await deleteTodoAction(id);
      router.refresh();
    });
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">To-Dos</h1>
          <p className="text-sm text-ink-muted">
            {todos.filter((t) => !t.isCompleted).length} open
          </p>
        </div>
        <Link href="/todos/categories" className="text-sm font-medium text-ember">
          Categories
        </Link>
      </div>

      {todos.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink-faint">Nothing on the list. Add something to chase.</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => {
            const isCompleted = optimistic[todo.id] ?? todo.isCompleted;
            const overdue = !isCompleted && !!todo.dueDate && todo.dueDate < today;
            const cat = categoryName(todo.categoryId);
            return (
              <li
                key={todo.id}
                className="flex items-center gap-3 rounded-xl border border-hairline bg-surface p-3"
              >
                <button
                  onClick={() => toggle(todo)}
                  aria-label={isCompleted ? 'Mark not done' : 'Mark done'}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-bold transition-transform active:scale-90 ${
                    isCompleted
                      ? 'stamp-in border-moss bg-moss/15 text-moss'
                      : 'border-hairline-strong text-transparent'
                  }`}
                >
                  ✓
                </button>
                <button onClick={() => setEditing(todo)} className="min-w-0 flex-1 text-left">
                  <span className={isCompleted ? 'text-ink-faint line-through' : 'text-ink'}>{todo.title}</span>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_COLOR[todo.priority] ?? 'bg-ink-faint'}`} />
                    {cat && (
                      <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[11px] text-ink-muted">
                        {cat}
                      </span>
                    )}
                    {todo.dueDate && (
                      <span className={`text-[11px] ${overdue ? 'font-semibold text-danger' : 'text-ink-faint'}`}>
                        {overdue ? 'Overdue' : todo.dueDate}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => remove(todo.id)}
                  aria-label="Delete"
                  className="shrink-0 p-2 text-ink-faint transition-transform active:scale-90"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        onClick={() => setEditing('new')}
        className="fixed bottom-24 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-ember text-2xl font-semibold text-ember-ink shadow-lg transition-transform active:scale-90 md:bottom-6"
        aria-label="Add to-do"
      >
        +
      </button>

      <TodoEditModal
        open={editing !== null}
        existing={editing === 'new' ? null : editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </div>
  );
}
