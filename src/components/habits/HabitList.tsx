'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toggleHabitTodayAction } from '@/actions/habits';
import { HabitEditModal } from './HabitEditModal';
import { HabitHeatmapStrip, computeVisibleStreak } from './HabitHeatmap';
import type { Habit } from '@/db/schema';

export function HabitList({
  habits,
  completedIds,
  recentCompletions,
  today,
}: {
  habits: Habit[];
  completedIds: number[];
  recentCompletions: Record<number, string[]>;
  today: string;
}) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<Record<number, boolean>>({});
  const [creating, setCreating] = useState(false);
  const [, startTransition] = useTransition();
  const completedSet = new Set(completedIds);

  function toggle(habit: Habit) {
    const next = !(optimistic[habit.id] ?? completedSet.has(habit.id));
    setOptimistic((prev) => ({ ...prev, [habit.id]: next }));
    startTransition(async () => {
      await toggleHabitTodayAction(habit.id);
      router.refresh();
    });
  }

  const doneCount = habits.filter((h) => optimistic[h.id] ?? completedSet.has(h.id)).length;

  return (
    <div className="p-4 pb-24">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-ink">Habits</h1>
        <p className="text-sm text-ink-muted">
          {doneCount} of {habits.length} stamped today
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-moss transition-all"
            style={{ width: `${habits.length ? (doneCount / habits.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <ul className="space-y-2">
        {habits.map((habit) => {
          const isDone = optimistic[habit.id] ?? completedSet.has(habit.id);
          const dates = new Set(recentCompletions[habit.id] ?? []);
          if (isDone) dates.add(today);
          const streak = computeVisibleStreak(dates, today);

          return (
            <li key={habit.id} className="rounded-xl border border-hairline bg-surface p-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggle(habit)}
                  aria-label={isDone ? 'Mark not done' : 'Mark done'}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 text-xl font-bold transition-transform active:scale-90 ${
                    isDone
                      ? 'stamp-in border-moss bg-moss/20 text-moss'
                      : 'border-hairline-strong text-transparent'
                  }`}
                >
                  ✓
                </button>

                <Link href={`/habits/${habit.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{habit.name}</p>
                  <div className="mt-1.5">
                    <HabitHeatmapStrip completedDates={dates} today={today} />
                  </div>
                </Link>

                {streak > 0 && (
                  <div
                    className="flex shrink-0 flex-col items-center rounded-lg px-2 py-1"
                    style={{ opacity: 0.5 + Math.min(streak / 14, 1) * 0.5 }}
                  >
                    <span className="text-lg leading-none">🔥</span>
                    <span className="font-mono text-xs font-semibold text-ember">{streak}</span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => setCreating(true)}
        className="fixed bottom-24 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-ember text-2xl font-semibold text-ember-ink shadow-lg transition-transform active:scale-90 md:bottom-6"
        aria-label="Add habit"
      >
        +
      </button>

      <HabitEditModal
        open={creating}
        existing={null}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          router.refresh();
        }}
      />
    </div>
  );
}
