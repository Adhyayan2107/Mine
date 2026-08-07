import { db } from '@/db/client';
import { listJournalEntriesDescending } from '@/db/queries/journal';
import { JournalHistoryList } from '@/components/journal/JournalHistoryList';

export default async function JournalHistoryPage() {
  const entries = await listJournalEntriesDescending(db);
  return <JournalHistoryList entries={entries} />;
}
