'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { createTodoAction, updateTodoAction } from '@/actions/todos';
import type { Todo, Category } from '@/db/schema';

const PRIORITIES: Array<{ value: 'low' | 'medium' | 'high'; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

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
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm md:items-center md:justify-center">
      <div className="modal-enter w-full space-y-4 rounded-t-2xl border border-hairline bg-surface-raised p-6 shadow-2xl md:w-96 md:rounded-2xl">
        <h2 className="font-display text-lg font-semibold text-ink">{existing ? 'Edit To-Do' : 'New To-Do'}</h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          autoFocus
          className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-ink placeholder:text-ink-faint"
        />

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
            Priority
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                onClick={() => setPriority(p.value)}
                className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                  priority === p.value
                    ? 'border-ember bg-ember/15 text-ember'
                    : 'border-hairline text-ink-muted'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
            Category
          </label>
          <select
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
            className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-ink"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">
            Due date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-ink"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-hairline py-3 font-medium text-ink-muted transition-transform active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!title}
            className="flex-1 rounded-lg bg-ember py-3 font-semibold text-ember-ink transition-transform active:scale-[0.97] disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
