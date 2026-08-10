import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { listCardioSessions, addCardioSession, deleteCardioSession } from '@/db/queries/cardio';

describe('cardio sessions', () => {
  it('adds, lists newest-first, and deletes', async () => {
    const db = await createTestDb();
    await addCardioSession(db, { date: '2026-08-01', type: 'run', durationMin: 30, distanceKm: 5, caloriesKcal: 300 });
    await addCardioSession(db, { date: '2026-08-05', type: 'walk', durationMin: 45, distanceKm: null, caloriesKcal: null });

    let sessions = await listCardioSessions(db);
    expect(sessions.map((s) => s.date)).toEqual(['2026-08-05', '2026-08-01']);
    expect(sessions[1].distanceKm).toBe(5);

    await deleteCardioSession(db, sessions[0].id);
    sessions = await listCardioSessions(db);
    expect(sessions).toHaveLength(1);
  });
});
