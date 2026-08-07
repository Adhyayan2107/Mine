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
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm md:items-center md:justify-center">
      <div className="modal-enter w-full space-y-3 rounded-t-2xl border border-hairline bg-surface-raised p-6 shadow-2xl md:w-96 md:rounded-2xl">
        <h2 className="font-display text-lg font-semibold text-ink">{existing ? 'Edit Habit' : 'New Habit'}</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Gym, Read 30 minutes"
          autoFocus
          className="w-full rounded-lg border border-hairline bg-surface px-4 py-3 text-ink placeholder:text-ink-faint"
        />
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-hairline py-3 font-medium text-ink-muted transition-transform active:scale-[0.97]"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!name}
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
