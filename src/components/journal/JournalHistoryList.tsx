import type { JournalEntry } from '@/db/schema';

export function JournalHistoryList({ entries }: { entries: JournalEntry[] }) {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-semibold">Journal History</h1>
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-lg bg-neutral-900 p-4">
            <p className="mb-1 text-sm font-medium text-teal-300">{entry.date}</p>
            {entry.wins && <p className="text-sm text-neutral-300">Wins: {entry.wins}</p>}
            {entry.lessons && <p className="text-sm text-neutral-300">Lessons: {entry.lessons}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
