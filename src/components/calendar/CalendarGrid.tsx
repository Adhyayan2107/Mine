'use client';

import { useState } from 'react';
import { DayDetailSheet } from './DayDetailSheet';
import { WaypointFlag } from '@/components/ui/Waypoint';
import type { DayActivity } from '@/db/queries/calendar';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function activityScore(a: DayActivity | undefined): number {
  if (!a) return 0;
  return (a.hasWeight ? 1 : 0) + (a.hasWorkout ? 1 : 0) + (a.habitsCompleted > 0 ? 1 : 0) + (a.hasJournal ? 1 : 0);
}

/**
 * The month as the route map: every day a survey plot, every day with
 * activity a camp sized by how much was logged.
 */
export function CalendarGrid({
  year,
  month,
  activityByDate,
  today,
}: {
  year: number;
  month: number;
  activityByDate: Record<string, DayActivity>;
  today: string;
}) {
  const [openDate, setOpenDate] = useState<string | null>(null);

  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const leadingBlanks = firstOfMonth.getUTCDay();

  const cells: Array<{ date: string; day: number } | null> = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: `${year}-${pad(month)}-${pad(day)}`, day });
  }
  const rows = Math.ceil(cells.length / 7);

  return (
    <>
      <div className="grid grid-cols-7 gap-px border-x border-t border-hairline bg-hairline">
        {WEEKDAYS.map((w) => (
          <div key={w} className="bg-surface py-2 text-center font-mono text-[10px] tracking-[0.16em] text-ink-faint">
            {w}
          </div>
        ))}
      </div>
      <div>
        <div className="grid grid-cols-7 gap-px border border-hairline bg-hairline">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`blank-${i}`} className="aspect-square bg-surface-sunken/60" />;
            const score = activityScore(activityByDate[cell.date]);
            const isToday = cell.date === today;
            const isFuture = cell.date > today;
            return (
              <button
                key={cell.date}
                onClick={() => setOpenDate(cell.date)}
                disabled={isFuture}
                aria-label={`${cell.date}${score > 0 ? `, camp made (${score} of 4 logged)` : ''}`}
                className={`relative aspect-square bg-surface p-1 text-left transition-colors ${
                  isFuture ? 'bg-surface-sunken/60' : 'hover:bg-surface-raised active:bg-surface-sunken'
                } ${isToday ? 'shadow-[inset_0_0_0_2px_var(--color-route)]' : ''}`}
              >
                <span
                  className={`absolute left-1.5 top-1 font-mono text-[10px] ${
                    isToday ? 'font-semibold text-route-deep' : isFuture ? 'text-ink-faint/50' : 'text-ink-faint'
                  }`}
                >
                  {pad(cell.day)}
                </span>
                {/* a full log (all four tracked) plants the flag on the camp */}
                {score > 0 && (
                  <span
                    className="absolute inset-0 m-auto bg-pine"
                    style={{
                      width: `${8 + score * 3}px`,
                      height: `${8 + score * 3}px`,
                      opacity: 0.65 + score * 0.0875,
                    }}
                  />
                )}
                {score === 4 && (
                  <span className="absolute right-1.5 top-1 text-pine-deep">
                    <WaypointFlag size={12} />
                  </span>
                )}
                {isToday && (
                  <span className="absolute bottom-1 left-1.5 text-route">
                    <WaypointFlag size={13} />
                  </span>
                )}
              </button>
            );
          })}
          {/* pad the final row so the shared rules stay square */}
          {Array.from({ length: rows * 7 - cells.length }, (_, i) => (
            <div key={`tail-${i}`} className="aspect-square bg-surface-sunken/60" />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 font-mono text-[10px] tracking-[0.12em] text-ink-faint">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 bg-pine" /> CAMP · SIZED BY WHAT YOU LOGGED
        </span>
        <span className="flex items-center gap-1.5 text-pine-deep">
          <WaypointFlag size={11} className="text-pine" /> FULL LOG
        </span>
        <span className="flex items-center gap-1.5 text-route-deep">
          <WaypointFlag size={11} className="text-route" /> TODAY
        </span>
      </div>

      <DayDetailSheet date={openDate} onClose={() => setOpenDate(null)} />
    </>
  );
}
