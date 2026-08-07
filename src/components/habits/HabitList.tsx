'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toggleHabitTodayAction } from '@/actions/habits';
import { HabitEditModal } from './HabitEditModal';
import type { Habit } from '@/db/schema';

export function HabitList({ habits, completedIds }: { habits: Habit[]; completedIds: number[] }) {
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

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-semibold">Habits</h1>
      <ul className="space-y-2">
        {habits.map((habit) => {
          const isDone = optimistic[habit.id] ?? completedSet.has(habit.id);
          return (
            <li key={habit.id} className="flex items-center gap-3 rounded-lg bg-neutral-900 p-3">
              <button
                onClick={() => toggle(habit)}
                aria-label={isDone ? 'Mark not done' : 'Mark done'}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-lg ${
                  isDone
                    ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                    : 'border-neutral-600 text-transparent'
                }`}
              >
                ✓
              </button>
              <Link href={`/habits/${habit.id}`} className="flex-1 text-neutral-100">
                {habit.name}
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => setCreating(true)}
        className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-2xl text-white shadow-lg md:bottom-4"
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
