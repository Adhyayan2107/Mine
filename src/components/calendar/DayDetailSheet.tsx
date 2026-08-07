'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getDayDetailAction } from '@/actions/calendar';
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm md:items-center md:justify-center">
      <div className="modal-enter max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border border-hairline bg-surface-raised p-6 shadow-2xl md:w-[26rem] md:rounded-2xl">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">{formatDateHeading(date)}</h2>
          <button onClick={onClose} className="p-1 text-ink-faint" aria-label="Close">
            ✕
          </button>
        </div>

        {!showing ? (
          <p className="text-sm text-ink-faint">Loading…</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Weight" value={showing.weightKg != null ? `${showing.weightKg} kg` : '—'} />
              <Stat label="Calories" value={showing.caloriesKcal != null ? `${showing.caloriesKcal} kcal` : '—'} />
              <Stat label="Protein" value={showing.proteinG != null ? `${showing.proteinG} g` : '—'} />
              <Stat label="Water" value={`${showing.waterMl} ml`} />
              <Stat label="Steps" value={showing.steps != null ? `${showing.steps}` : '—'} />
              <Stat label="Workout" value={showing.workoutLabel ?? '—'} />
            </div>

            <Section title="Habits completed">
              {showing.habitsCompleted.length === 0 ? (
                <EmptyRow text="None stamped this day." />
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {showing.habitsCompleted.map((name) => (
                    <span key={name} className="rounded-full bg-moss/15 px-2.5 py-1 text-xs text-moss">
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Journal">
              {!showing.journalEntry || !(showing.journalEntry.wins || showing.journalEntry.lessons) ? (
                <EmptyRow text="No entry this day." />
              ) : (
                <div className="space-y-1 text-sm text-ink-muted">
                  {showing.journalEntry.wins && <p>Wins: {showing.journalEntry.wins}</p>}
                  {showing.journalEntry.lessons && <p>Lessons: {showing.journalEntry.lessons}</p>}
                </div>
              )}
            </Section>

            <Section title="To-dos">
              {showing.todosDueThatDay.length === 0 && showing.todosCompletedThatDay.length === 0 ? (
                <EmptyRow text="Nothing tracked this day." />
              ) : (
                <ul className="space-y-1 text-sm">
                  {showing.todosCompletedThatDay.map((title) => (
                    <li key={`done-${title}`} className="text-moss">
                      ✓ {title}
                    </li>
                  ))}
                  {showing.todosDueThatDay.map((title) => (
                    <li key={`due-${title}`} className="text-ink-muted">
                      · {title}
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{title}</p>
      {children}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="text-sm text-ink-faint">{text}</p>;
}
