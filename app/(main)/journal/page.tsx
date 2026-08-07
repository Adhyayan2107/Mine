import { db } from '@/db/client';
import { getJournalEntry } from '@/db/queries/journal';
import { todayDateString } from '@/lib/dates';
import { JournalForm } from '@/components/journal/JournalForm';

export default async function JournalPage() {
  const entry = await getJournalEntry(db, todayDateString());
  return <JournalForm entry={entry} />;
}
