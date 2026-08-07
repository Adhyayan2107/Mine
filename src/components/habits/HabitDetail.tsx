'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { archiveHabitAction } from '@/actions/habits';
import { HabitEditModal } from './HabitEditModal';
import { HabitHeatmapGrid } from './HabitHeatmap';
import type { Habit } from '@/db/schema';

export function HabitDetail({
  habit,
  completionDates,
  currentStreak,
  longestStreak,
  today,
}: {
  habit: Habit;
  completionDates: string[];
  currentStreak: number;
  longestStreak: number;
  today: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const dateSet = new Set(completionDates);
  const sortedRecent = [...completionDates].sort().reverse().slice(0, 8);

  return (
    <div className="p-4 pb-24">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">{habit.name}</h1>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-hairline px-3 py-1.5 font-medium text-ink-muted"
          >
            Edit
          </button>
          <button
            onClick={async () => {
              await archiveHabitAction(habit.id);
              router.push('/habits');
            }}
            className="rounded-lg border border-hairline px-3 py-1.5 font-medium text-danger"
          >
            Archive
          </button>
        </div>
      </div>

      <div className="mb-5 flex gap-3">
        <div className="flex-1 rounded-xl border border-hairline bg-surface p-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl">🔥</span>
            <span className="font-display text-3xl font-bold text-ember">{currentStreak}</span>
          </div>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">Current streak</p>
        </div>
        <div className="flex-1 rounded-xl border border-hairline bg-surface p-4">
          <span className="font-display text-3xl font-bold text-ink">{longestStreak}</span>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">Longest streak</p>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-hairline bg-surface p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Last 14 weeks</p>
        <HabitHeatmapGrid completedDates={dateSet} today={today} />
      </div>

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Recent</h2>
      {sortedRecent.length === 0 ? (
        <p className="text-sm text-ink-faint">No check-offs yet — tap the square on Habits to start.</p>
      ) : (
        <ul className="space-y-1.5">
          {sortedRecent.map((date) => (
            <li
              key={date}
              className="flex items-center gap-2 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink-muted"
            >
              <span className="h-2 w-2 rounded-sm bg-moss" />
              <span className="font-mono">{date}</span>
            </li>
          ))}
        </ul>
      )}

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
