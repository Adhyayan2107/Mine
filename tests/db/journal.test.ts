import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { getJournalEntry, upsertJournalEntry, listJournalEntriesDescending } from '@/db/queries/journal';

describe('journal queries', () => {
  it('morning and evening fields persist independently on the same date', async () => {
    const db = await createTestDb();
    const today = '2026-08-07';

    await upsertJournalEntry(db, today, { morningPlan: 'Ship the web plan' });
    await upsertJournalEntry(db, today, { wins: 'Finished the schema', mood: 4, energy: 3 });

    const entry = await getJournalEntry(db, today);
    expect(entry?.morningPlan).toBe('Ship the web plan');
    expect(entry?.wins).toBe('Finished the schema');
    expect(entry?.mood).toBe(4);
  });

  it('listJournalEntriesDescending orders newest first', async () => {
    const db = await createTestDb();
    await upsertJournalEntry(db, '2026-08-01', { wins: 'Old entry' });
    await upsertJournalEntry(db, '2026-08-07', { wins: 'New entry' });

    const entries = await listJournalEntriesDescending(db);
    expect(entries[0].wins).toBe('New entry');
    expect(entries[1].wins).toBe('Old entry');
  });
});
