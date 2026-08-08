'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { archiveHabitAction } from '@/actions/habits';
import { HabitEditModal } from './HabitEditModal';
import { HabitHeatmapGrid } from './HabitHeatmap';
import { SheetHeader } from '@/components/ui/SheetHeader';
import { WaypointFlag } from '@/components/ui/Waypoint';
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
    <div className="mx-auto max-w-[880px] p-4 md:p-8">
      <SheetHeader
        title={habit.name}
        sheet="SHEET 03 · ROPE"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="border border-hairline-strong px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Edit
            </button>
            <button
              onClick={async () => {
                await archiveHabitAction(habit.id);
                router.push('/habits');
              }}
              className="border border-danger/50 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:border-danger"
            >
              Archive
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-px border border-hairline bg-hairline">
        <div className="bg-surface p-4">
          <p className="map-label">On rope now</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`altitude text-4xl leading-none ${currentStreak >= 7 ? 'text-route' : 'text-ink'}`}>
              {currentStreak}
            </span>
            <span className="font-mono text-xs text-ink-muted">days</span>
          </div>
        </div>
        <div className="bg-surface p-4">
          <p className="map-label">Longest rope</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="altitude text-4xl leading-none text-ink">{longestStreak}</span>
            <span className="font-mono text-xs text-ink-muted">days</span>
          </div>
        </div>
      </div>

      <div className="plate mt-4 p-4">
        <p className="map-label mb-3">Last 14 weeks</p>
        <HabitHeatmapGrid completedDates={dateSet} today={today} />
      </div>

      <div className="plate mt-4">
        <p className="map-label border-b border-hairline px-4 py-3">Recent camps</p>
        {sortedRecent.length === 0 ? (
          <p className="px-4 py-4 text-sm text-ink-faint">
            No check-offs yet — plant the first flag from the Habits sheet.
          </p>
        ) : (
          <ul className="divide-y divide-hairline">
            {sortedRecent.map((date) => (
              <li key={date} className="flex items-center gap-2.5 px-4 py-2.5 text-sm">
                <WaypointFlag size={12} className="text-pine" />
                <span className="font-mono text-ink-muted">{date}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

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
