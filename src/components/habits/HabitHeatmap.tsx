import { addDaysToDateString } from '@/lib/dates';

function buildDayList(today: string, days: number): string[] {
  const list: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    list.push(addDaysToDateString(today, -i));
  }
  return list;
}

/**
 * Streak visible within whatever window of dates was fetched (e.g. the last
 * 30 days). Undercounts a streak longer than the window — fine for a list
 * view's at-a-glance rope length; the habit detail page's `currentStreak`
 * query has no such cap and is the source of truth.
 */
export function computeVisibleStreak(completedDates: Set<string>, today: string): number {
  let streak = 0;
  let cursor = today;
  while (completedDates.has(cursor)) {
    streak++;
    cursor = addDaysToDateString(cursor, -1);
  }
  return streak;
}

/** Compact single-row survey strip — last 30 days at a glance, on the Habits list. */
export function HabitHeatmapStrip({
  completedDates,
  today,
}: {
  completedDates: Set<string>;
  today: string;
}) {
  const days = buildDayList(today, 30);
  return (
    <div className="flex gap-px border border-hairline bg-hairline">
      {days.map((d) => (
        <span
          key={d}
          title={d}
          className={`h-2.5 flex-1 ${
            completedDates.has(d) ? 'bg-pine' : 'bg-surface-sunken'
          } ${d === today ? 'shadow-[inset_0_0_0_1.5px_var(--color-route)]' : ''}`}
        />
      ))}
    </div>
  );
}

/**
 * The full survey grid (weeks as columns) — a habit's detail page. With
 * `onToggle` the plots become buttons: tap any past day to plant or pull
 * that day's flag (retroactive edits).
 */
export function HabitHeatmapGrid({
  completedDates,
  today,
  weeks = 14,
  onToggle,
}: {
  completedDates: Set<string>;
  today: string;
  weeks?: number;
  onToggle?: (date: string) => void;
}) {
  const days = buildDayList(today, weeks * 7);
  const columns: string[][] = [];
  for (let w = 0; w < weeks; w++) {
    columns.push(days.slice(w * 7, w * 7 + 7));
  }

  return (
    <div className="inline-flex gap-px overflow-x-auto border border-hairline bg-hairline pb-0">
      {columns.map((week, i) => (
        <div key={i} className="flex flex-col gap-px">
          {week.map((d) => {
            const done = completedDates.has(d);
            const cellClass = `h-3.5 w-3.5 ${done ? 'bg-pine' : 'bg-surface-sunken'} ${
              d === today ? 'shadow-[inset_0_0_0_1.5px_var(--color-route)]' : ''
            }`;
            return onToggle ? (
              <button
                key={d}
                title={d}
                aria-label={`${d}: ${done ? 'planted — tap to remove' : 'not planted — tap to plant'}`}
                onClick={() => onToggle(d)}
                className={`${cellClass} transition-transform hover:scale-125 active:scale-90`}
              />
            ) : (
              <span key={d} title={d} className={cellClass} />
            );
          })}
        </div>
      ))}
    </div>
  );
}
