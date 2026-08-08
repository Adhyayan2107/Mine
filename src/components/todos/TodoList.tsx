'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toggleTodoCompleteAction, deleteTodoAction } from '@/actions/todos';
import { TodoEditModal } from './TodoEditModal';
import { SheetHeader } from '@/components/ui/SheetHeader';
import { PlotCheck } from '@/components/ui/Waypoint';
import { XGlyph, PlusGlyph } from '@/components/ui/glyphs';
import { todayDateString } from '@/lib/dates';
import type { Todo, Category } from '@/db/schema';

const PRIORITY_TAG: Record<string, { text: string; className: string }> = {
  high: { text: 'HIGH', className: 'text-route-deep' },
  medium: { text: 'MED', className: 'text-ink-muted' },
  low: { text: 'LOW', className: 'text-ink-faint' },
};

export function TodoList({ todos, categories }: { todos: Todo[]; categories: Category[] }) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<Record<number, boolean>>({});
  const [editing, setEditing] = useState<Todo | 'new' | null>(null);
  const [, startTransition] = useTransition();
  const today = todayDateString();
  const categoryName = (id: number | null) => categories.find((c) => c.id === id)?.name;
  const openCount = todos.filter((t) => !(optimistic[t.id] ?? t.isCompleted)).length;

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
    <div className="mx-auto max-w-[880px] p-4 pb-44 md:p-8 md:pb-28">
      <SheetHeader
        title="To-Dos"
        sheet="SHEET 02"
        note={openCount === 0 ? 'Manifest clear' : `${openCount} open on the manifest`}
        action={
          <Link
            href="/todos/categories"
            className="border border-hairline-strong px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
          >
            Categories
          </Link>
        }
      />

      {todos.length === 0 ? (
        <div className="plate mt-8 p-8 text-center">
          <p className="sheet-title text-lg text-ink">The manifest is empty</p>
          <p className="mt-1 text-sm text-ink-muted">Add the first thing worth carrying up.</p>
        </div>
      ) : (
        <ul className="plate divide-y divide-hairline">
          {todos.map((todo) => {
            const isCompleted = optimistic[todo.id] ?? todo.isCompleted;
            const overdue = !isCompleted && !!todo.dueDate && todo.dueDate < today;
            const cat = categoryName(todo.categoryId);
            const tag = PRIORITY_TAG[todo.priority] ?? PRIORITY_TAG.medium;
            return (
              <li key={todo.id} className="flex items-center gap-3 px-3 py-2.5 md:px-4">
                <button
                  onClick={() => toggle(todo)}
                  aria-label={isCompleted ? 'Mark not done' : 'Mark done'}
                  className="shrink-0 transition-transform active:scale-90"
                >
                  <PlotCheck done={isCompleted} />
                </button>
                <button onClick={() => setEditing(todo)} className="min-w-0 flex-1 py-0.5 text-left">
                  <span className={isCompleted ? 'text-ink-faint line-through' : 'font-medium text-ink'}>
                    {todo.title}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 font-mono text-[10px] tracking-[0.1em]">
                    <span className={tag.className}>{tag.text}</span>
                    {cat && <span className="text-ink-faint">{cat.toUpperCase()}</span>}
                    {todo.dueDate && (
                      <span className={overdue ? 'font-semibold text-danger' : 'text-ink-faint'}>
                        {overdue ? `OVERDUE · ${todo.dueDate}` : `DUE ${todo.dueDate}`}
                      </span>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => remove(todo.id)}
                  aria-label={`Delete ${todo.title}`}
                  className="shrink-0 p-2 text-ink-faint transition-colors hover:text-danger active:scale-90"
                >
                  <XGlyph size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        onClick={() => setEditing('new')}
        className="fixed bottom-24 right-4 flex h-14 w-14 items-center justify-center bg-route text-route-ink shadow-[0_10px_28px_-8px_rgba(120,40,5,0.55)] transition-transform active:scale-90 md:bottom-8 md:right-8"
        aria-label="Add to-do"
      >
        <PlusGlyph size={22} />
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
