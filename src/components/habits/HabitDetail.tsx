'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { archiveHabitAction } from '@/actions/habits';
import { HabitEditModal } from './HabitEditModal';
import type { Habit } from '@/db/schema';

export function HabitDetail({
  habit,
  completionDates,
  currentStreak,
  longestStreak,
}: {
  habit: Habit;
  completionDates: string[];
  currentStreak: number;
  longestStreak: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const sortedDates = [...completionDates].sort().reverse();

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{habit.name}</h1>
        <div className="flex gap-3 text-sm">
          <button onClick={() => setEditing(true)} className="text-teal-400">
            Edit
          </button>
          <button
            onClick={async () => {
              await archiveHabitAction(habit.id);
              router.push('/habits');
            }}
            className="text-red-400"
          >
            Archive
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="rounded-lg bg-neutral-900 p-4">
          <p className="text-2xl font-semibold text-teal-300">{currentStreak}</p>
          <p className="text-xs text-neutral-400">Current streak</p>
        </div>
        <div className="rounded-lg bg-neutral-900 p-4">
          <p className="text-2xl font-semibold text-neutral-100">{longestStreak}</p>
          <p className="text-xs text-neutral-400">Longest streak</p>
        </div>
      </div>

      <h2 className="mb-2 text-sm font-medium text-neutral-400">History</h2>
      <ul className="space-y-1">
        {sortedDates.map((date) => (
          <li key={date} className="rounded bg-neutral-900 px-3 py-2 text-sm text-neutral-300">
            {date}
          </li>
        ))}
      </ul>

      <HabitEditModal
        open={editing}
        existing={habit}
        onClose={() => setEditing(false)}
        onSaved={() => {
          setEditing(false);
          router.refresh();
        }}
      />
    </div>
  );
}
