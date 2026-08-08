import { SheetHeader } from '@/components/ui/SheetHeader';
import type { JournalEntry } from '@/db/schema';

export function JournalHistoryList({ entries }: { entries: JournalEntry[] }) {
  return (
    <div className="mx-auto max-w-[720px] p-4 md:p-8">
      <SheetHeader title="Journal history" sheet="SHEET 06 · LOG" note="Earlier pages of the summit log" />
      {entries.length === 0 ? (
        <p className="text-sm text-ink-faint">No entries yet — your first one starts the trail.</p>
      ) : (
        <ul className="plate divide-y divide-hairline">
          {entries.map((entry) => (
            <li key={entry.id} className="px-4 py-3.5">
              <p className="tabular font-mono text-xs font-medium tracking-[0.1em] text-route-deep">
                {entry.date}
              </p>
              {entry.wins && <p className="mt-1.5 text-sm text-ink">Wins — {entry.wins}</p>}
              {entry.lessons && <p className="mt-1 text-sm text-ink-muted">Lessons — {entry.lessons}</p>}
              {!entry.wins && !entry.lessons && (
                <p className="mt-1.5 text-sm text-ink-faint">Signed, nothing noted.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
