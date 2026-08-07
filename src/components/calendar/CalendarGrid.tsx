'use client';

import { useState } from 'react';
import { DayDetailSheet } from './DayDetailSheet';
import type { DayActivity } from '@/db/queries/calendar';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function activityScore(a: DayActivity | undefined): number {
  if (!a) return 0;
  return (a.hasWeight ? 1 : 0) + (a.hasWorkout ? 1 : 0) + (a.habitsCompleted > 0 ? 1 : 0) + (a.hasJournal ? 1 : 0);
}

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

  return (
    <>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-[11px] font-semibold text-ink-faint">
            {w}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <div key={`blank-${i}`} />;
          const score = activityScore(activityByDate[cell.date]);
          const isToday = cell.date === today;
          const isFuture = cell.date > today;
          return (
            <button
              key={cell.date}
              onClick={() => setOpenDate(cell.date)}
              disabled={isFuture}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border text-xs transition-transform active:scale-90 disabled:opacity-30 ${
                isToday ? 'border-ember' : 'border-hairline'
              }`}
              style={score > 0 ? { backgroundColor: `rgba(143, 188, 107, ${0.18 + score * 0.18})` } : undefined}
            >
              <span className={isToday ? 'font-bold text-ember' : 'text-ink'}>{cell.day}</span>
            </button>
          );
        })}
      </div>

      <DayDetailSheet date={openDate} onClose={() => setOpenDate(null)} />
    </>
  );
}
