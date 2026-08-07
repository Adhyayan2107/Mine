'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toggleTodoCompleteAction, deleteTodoAction } from '@/actions/todos';
import { TodoEditModal } from './TodoEditModal';
import type { Todo, Category } from '@/db/schema';

export function TodoList({ todos, categories }: { todos: Todo[]; categories: Category[] }) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<Record<number, boolean>>({});
  const [editing, setEditing] = useState<Todo | 'new' | null>(null);
  const [, startTransition] = useTransition();

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
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">To-Dos</h1>
        <Link href="/todos/categories" className="text-sm text-teal-400">
          Categories
        </Link>
      </div>

      <ul className="space-y-2">
        {todos.map((todo) => {
          const isCompleted = optimistic[todo.id] ?? todo.isCompleted;
          return (
            <li key={todo.id} className="flex items-center gap-3 rounded-lg bg-neutral-900 p-3">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={() => toggle(todo)}
                className="h-6 w-6 shrink-0"
              />
              <button onClick={() => setEditing(todo)} className="flex-1 text-left">
                <span className={isCompleted ? 'text-neutral-500 line-through' : 'text-neutral-100'}>
                  {todo.title}
                </span>
              </button>
              <button onClick={() => remove(todo.id)} aria-label="Delete" className="p-2 text-neutral-500">
                ✕
              </button>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => setEditing('new')}
        className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-2xl text-white shadow-lg md:bottom-4"
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
