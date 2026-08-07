import type { JournalEntry } from '@/db/schema';

export function JournalHistoryList({ entries }: { entries: JournalEntry[] }) {
  return (
    <div className="p-4 pb-24">
      <h1 className="mb-4 font-display text-2xl font-bold text-ink">Journal History</h1>
      {entries.length === 0 ? (
        <p className="text-sm text-ink-faint">No entries yet — your first one starts the trail.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-xl border border-hairline bg-surface p-4">
              <p className="mb-1.5 font-mono text-sm font-semibold text-ember">{entry.date}</p>
              {entry.wins && <p className="text-sm text-ink">Wins: {entry.wins}</p>}
              {entry.lessons && <p className="mt-0.5 text-sm text-ink-muted">Lessons: {entry.lessons}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
