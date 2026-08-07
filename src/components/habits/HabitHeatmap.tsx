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
 * view's at-a-glance flame intensity; the habit detail page's `currentStreak`
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

/** Compact single-row strip — last 30 days at a glance, used on the Habits list. */
export function HabitHeatmapStrip({
  completedDates,
  today,
}: {
  completedDates: Set<string>;
  today: string;
}) {
  const days = buildDayList(today, 30);
  return (
    <div className="flex gap-[2px]">
      {days.map((d) => (
        <span
          key={d}
          title={d}
          className={`h-2.5 flex-1 rounded-[2px] ${
            completedDates.has(d) ? 'bg-moss' : 'bg-surface-raised'
          } ${d === today ? 'ring-1 ring-inset ring-ember' : ''}`}
        />
      ))}
    </div>
  );
}

/** Fuller GitHub-style grid (weeks as columns) — used on a habit's detail page. */
export function HabitHeatmapGrid({
  completedDates,
  today,
  weeks = 14,
}: {
  completedDates: Set<string>;
  today: string;
  weeks?: number;
}) {
  const days = buildDayList(today, weeks * 7);
  const columns: string[][] = [];
  for (let w = 0; w < weeks; w++) {
    columns.push(days.slice(w * 7, w * 7 + 7));
  }

  return (
    <div className="flex gap-[3px] overflow-x-auto pb-1">
      {columns.map((week, i) => (
        <div key={i} className="flex flex-col gap-[3px]">
          {week.map((d) => (
            <span
              key={d}
              title={d}
              className={`h-3 w-3 rounded-[3px] ${
                completedDates.has(d) ? 'bg-moss' : 'bg-surface-raised'
              } ${d === today ? 'ring-1 ring-inset ring-ember' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
