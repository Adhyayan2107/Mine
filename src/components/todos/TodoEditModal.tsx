'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { createTodoAction, updateTodoAction } from '@/actions/todos';
import type { Todo, Category } from '@/db/schema';

export function TodoEditModal({
  open,
  existing,
  categories,
  onClose,
  onSaved,
}: {
  open: boolean;
  existing: Todo | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState('');

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTitle(existing?.title ?? '');
      setPriority((existing?.priority as 'low' | 'medium' | 'high') ?? 'medium');
      setCategoryId(existing?.categoryId ?? null);
      setDueDate(existing?.dueDate ?? '');
    }
  }

  if (!open) return null;

  async function save() {
    const patch = { title, priority, categoryId, dueDate: dueDate || null };
    if (existing) {
      await updateTodoAction(existing.id, patch);
    } else {
      await createTodoAction(patch);
    }
    onSaved();
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 md:items-center md:justify-center">
      <div className="w-full space-y-3 rounded-t-2xl bg-neutral-900 p-6 md:w-96 md:rounded-2xl">
        <h2 className="text-lg font-semibold text-neutral-100">{existing ? 'Edit To-Do' : 'New To-Do'}</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          autoFocus
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-100"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-100"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-100"
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-100"
        />
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 rounded-md border border-neutral-700 py-3 text-neutral-300">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!title}
            className="flex-1 rounded-md bg-teal-600 py-3 font-medium text-white disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
