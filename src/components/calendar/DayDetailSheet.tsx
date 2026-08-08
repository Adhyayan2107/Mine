'use client';

import { useEffect, useState } from 'react';
import { getDayDetailAction } from '@/actions/calendar';
import { SheetModal } from '@/components/ui/SheetModal';
import { WaypointFlag } from '@/components/ui/Waypoint';
import type { DayDetail } from '@/db/queries/calendar';

function formatDateHeading(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** The camp report: everything logged on one day of the route. */
export function DayDetailSheet({ date, onClose }: { date: string | null; onClose: () => void }) {
  const [detail, setDetail] = useState<DayDetail | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!date || date === loadedFor) return;
    getDayDetailAction(date).then((result) => {
      setDetail(result);
      setLoadedFor(date);
    });
  }, [date, loadedFor]);

  if (!date) return null;
  const showing = detail && loadedFor === date ? detail : null;

  return (
    <SheetModal title={formatDateHeading(date)} onClose={onClose}>
      {!showing ? (
        <p className="text-sm text-ink-faint">Reading the log…</p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-px border border-hairline bg-hairline">
            <Reading label="Weight" value={showing.weightKg != null ? `${showing.weightKg} kg` : '—'} />
            <Reading label="Calories" value={showing.caloriesKcal != null ? `${showing.caloriesKcal} kcal` : '—'} />
            <Reading label="Protein" value={showing.proteinG != null ? `${showing.proteinG} g` : '—'} />
            <Reading label="Water" value={`${showing.waterMl} ml`} />
            <Reading label="Steps" value={showing.steps != null ? `${showing.steps}` : '—'} />
            <Reading label="Workout" value={showing.workoutLabel ?? '—'} />
          </div>

          <div>
            <p className="map-label mb-2">Habits secured</p>
            {showing.habitsCompleted.length === 0 ? (
              <p className="text-sm text-ink-faint">None planted this day.</p>
            ) : (
              <ul className="space-y-1.5">
                {showing.habitsCompleted.map((name) => (
                  <li key={name} className="flex items-center gap-2 text-sm text-ink">
                    <WaypointFlag size={12} className="shrink-0 text-pine" />
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="map-label mb-2">Journal</p>
            {!showing.journalEntry || !(showing.journalEntry.wins || showing.journalEntry.lessons) ? (
              <p className="text-sm text-ink-faint">No entry this day.</p>
            ) : (
              <div className="space-y-1.5 border-l border-hairline-strong pl-3 text-sm text-ink-muted">
                {showing.journalEntry.wins && <p>Wins — {showing.journalEntry.wins}</p>}
                {showing.journalEntry.lessons && <p>Lessons — {showing.journalEntry.lessons}</p>}
              </div>
            )}
          </div>

          <div>
            <p className="map-label mb-2">To-dos</p>
            {showing.todosDueThatDay.length === 0 && showing.todosCompletedThatDay.length === 0 ? (
              <p className="text-sm text-ink-faint">Nothing tracked this day.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {showing.todosCompletedThatDay.map((title) => (
                  <li key={`done-${title}`} className="flex items-center gap-2 text-pine-deep">
                    <WaypointFlag size={12} className="shrink-0 text-pine" />
                    {title}
                  </li>
                ))}
                {showing.todosDueThatDay.map((title) => (
                  <li key={`due-${title}`} className="flex items-center gap-2 text-ink-muted">
                    <span className="inline-block h-2 w-2 shrink-0 border border-dashed border-hairline-strong" />
                    {title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </SheetModal>
  );
}

function Reading({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-3 py-2.5">
      <p className="map-label text-[10px]">{label}</p>
      <p className="tabular mt-1 font-mono text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
