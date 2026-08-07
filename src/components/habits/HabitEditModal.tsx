'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { createHabitAction, updateHabitAction } from '@/actions/habits';
import type { Habit } from '@/db/schema';

export function HabitEditModal({
  open,
  existing,
  onClose,
  onSaved,
}: {
  open: boolean;
  existing: Habit | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setName(existing?.name ?? '');
  }

  if (!open) return null;

  async function save() {
    if (existing) {
      await updateHabitAction(existing.id, { name });
    } else {
      await createHabitAction({ name });
    }
    onSaved();
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 md:items-center md:justify-center">
      <div className="w-full space-y-3 rounded-t-2xl bg-neutral-900 p-6 md:w-96 md:rounded-2xl">
        <h2 className="text-lg font-semibold text-neutral-100">{existing ? 'Edit Habit' : 'New Habit'}</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Habit name"
          autoFocus
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-100"
        />
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 rounded-md border border-neutral-700 py-3 text-neutral-300">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!name}
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
