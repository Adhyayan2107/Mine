'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toggleHabitTodayAction } from '@/actions/habits';
import { HabitEditModal } from './HabitEditModal';
import { HabitHeatmapStrip, computeVisibleStreak } from './HabitHeatmap';
import { SheetHeader } from '@/components/ui/SheetHeader';
import { PlotCheck } from '@/components/ui/Waypoint';
import { PlusGlyph } from '@/components/ui/glyphs';
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
    <div className="mx-auto max-w-[880px] p-4 pb-44 md:p-8 md:pb-28">
      <SheetHeader
        title="Habits"
        sheet="SHEET 03"
        note={`${doneCount} of ${habits.length} ropes secured today`}
      />

      <div className="mb-4 h-[3px] w-full bg-surface-sunken">
        <div
          className="h-full bg-pine transition-[width] duration-300"
          style={{ width: `${habits.length ? (doneCount / habits.length) * 100 : 0}%` }}
        />
      </div>

      {habits.length === 0 ? (
        <div className="plate mt-8 p-8 text-center">
          <p className="sheet-title text-lg text-ink">No ropes fixed yet</p>
          <p className="mt-1 text-sm text-ink-muted">Add the first habit to start a line up the face.</p>
        </div>
      ) : (
        <ul className="plate divide-y divide-hairline">
          {habits.map((habit) => {
            const isDone = optimistic[habit.id] ?? completedSet.has(habit.id);
            const dates = new Set(recentCompletions[habit.id] ?? []);
            if (isDone) dates.add(today);
            else dates.delete(today);
            const streak = computeVisibleStreak(dates, today);

            return (
              <li key={habit.id} className="flex items-center gap-3 px-3 py-3 md:px-4">
                <button
                  onClick={() => toggle(habit)}
                  aria-label={isDone ? `Mark ${habit.name} not done` : `Mark ${habit.name} done`}
                  className="shrink-0 transition-transform active:scale-90"
                >
                  <PlotCheck done={isDone} size="lg" />
                </button>

                <Link href={`/habits/${habit.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{habit.name}</p>
                  <div className="mt-2">
                    <HabitHeatmapStrip completedDates={dates} today={today} />
                  </div>
                </Link>

                {streak > 0 && (
                  <div className="shrink-0 text-right">
                    <p className={`altitude text-xl leading-none ${streak >= 7 ? 'text-route' : 'text-pine-deep'}`}>
                      {streak}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] tracking-[0.14em] text-ink-faint">ON ROPE</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <button
        onClick={() => setCreating(true)}
        className="fixed bottom-24 right-4 flex h-14 w-14 items-center justify-center bg-route text-route-ink shadow-[0_10px_28px_-8px_rgba(120,40,5,0.55)] transition-transform active:scale-90 md:bottom-8 md:right-8"
        aria-label="Add habit"
      >
        <PlusGlyph size={22} />
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
