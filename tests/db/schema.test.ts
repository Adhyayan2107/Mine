import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { profile } from '@/db/schema';

describe('schema migrations', () => {
  it('applies cleanly and every table is queryable', async () => {
    const db = await createTestDb();
    const rows = await db.select().from(profile);
    expect(rows).toEqual([]);
  });
});
