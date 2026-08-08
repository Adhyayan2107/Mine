'use client';

import { useState } from 'react';
import { createHabitAction, updateHabitAction } from '@/actions/habits';
import { SheetModal } from '@/components/ui/SheetModal';
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

  return (
    <SheetModal title={existing ? 'Edit habit' : 'New habit'} onClose={onClose}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && name && save()}
        placeholder="e.g. Gym, Read 30 minutes"
        autoFocus
        className="w-full border border-hairline bg-surface px-4 py-3 text-ink placeholder:text-ink-faint"
      />
      <div className="mt-4 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 border border-hairline-strong py-3 font-medium text-ink-muted transition-transform active:scale-[0.98]"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={!name}
          className="flex-1 bg-route py-3 font-semibold text-route-ink transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          {existing ? 'Save' : 'Fix the rope'}
        </button>
      </div>
    </SheetModal>
  );
}
