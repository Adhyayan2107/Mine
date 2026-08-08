'use client';

import { useState } from 'react';
import { createTodoAction, updateTodoAction } from '@/actions/todos';
import { SheetModal } from '@/components/ui/SheetModal';
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

  return (
    <SheetModal title={existing ? 'Edit entry' : 'New entry'} onClose={onClose}>
      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          autoFocus
          className="w-full border border-hairline bg-surface px-4 py-3 text-ink placeholder:text-ink-faint"
        />

        <div>
          <p className="map-label mb-1.5">Priority</p>
          <div className="grid grid-cols-3 gap-px border border-hairline bg-hairline">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                onClick={() => setPriority(p.value)}
                aria-pressed={priority === p.value}
                className={`py-2.5 text-sm font-medium transition-colors ${
                  priority === p.value
                    ? 'bg-route text-route-ink'
                    : 'bg-surface text-ink-muted hover:bg-surface-raised'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="todo-category" className="map-label mb-1.5 block">
            Category
          </label>
          <select
            id="todo-category"
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-hairline bg-surface px-4 py-3 text-ink"
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
          <label htmlFor="todo-due" className="map-label mb-1.5 block">
            Due date
          </label>
          <input
            id="todo-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border border-hairline bg-surface px-4 py-3 font-mono text-sm text-ink"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 border border-hairline-strong py-3 font-medium text-ink-muted transition-transform active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!title}
            className="flex-1 bg-route py-3 font-semibold text-route-ink transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {existing ? 'Save' : 'Add to manifest'}
          </button>
        </div>
      </div>
    </SheetModal>
  );
}
