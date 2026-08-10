import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import {
  addSelection,
  removeSelection,
  listSelectionsForDate,
  listSetsForDate,
  addSet,
  pairSuperset,
  unpairSuperset,
  createExercise,
} from '@/db/queries/workouts';
import type { AppDatabase } from '@/db/types';

const DAY = '2026-08-10';

async function seedThree(db: AppDatabase): Promise<number[]> {
  const a = await createExercise(db, 'Bench Press', 'chest');
  const b = await createExercise(db, 'Cable Fly', 'chest');
  const c = await createExercise(db, 'Overhead Press', 'shoulders');
  for (const e of [a, b, c]) await addSelection(db, DAY, e.id);
  return [a.id, b.id, c.id];
}

describe('supersets', () => {
  it('pairs two exercises under one group and unpairs the whole group', async () => {
    const db = await createTestDb();
    const [a, b] = await seedThree(db);

    await pairSuperset(db, DAY, a, b);
    let sels = await listSelectionsForDate(db, DAY);
    const groupOf = (id: number) => sels.find((s) => s.exerciseId === id)?.supersetGroup;
    expect(groupOf(a)).not.toBeNull();
    expect(groupOf(a)).toBe(groupOf(b));

    await unpairSuperset(db, DAY, a);
    sels = await listSelectionsForDate(db, DAY);
    expect(sels.every((s) => s.supersetGroup === null)).toBe(true);
  });

  it('re-pairing steals the exercise and frees its old partner', async () => {
    const db = await createTestDb();
    const [a, b, c] = await seedThree(db);

    await pairSuperset(db, DAY, a, b);
    await pairSuperset(db, DAY, a, c);
    const sels = await listSelectionsForDate(db, DAY);
    const groupOf = (id: number) => sels.find((s) => s.exerciseId === id)?.supersetGroup;
    expect(groupOf(b)).toBeNull();
    expect(groupOf(a)).toBe(groupOf(c));
    expect(groupOf(a)).not.toBeNull();
  });

  it('removing a paired exercise frees its partner', async () => {
    const db = await createTestDb();
    const [a, b] = await seedThree(db);

    await pairSuperset(db, DAY, a, b);
    await removeSelection(db, DAY, a);
    const sels = await listSelectionsForDate(db, DAY);
    expect(sels.find((s) => s.exerciseId === b)?.supersetGroup).toBeNull();
  });
});

describe('drop sets', () => {
  it('stores the set type and keeps set numbering sequential across types', async () => {
    const db = await createTestDb();
    const [a] = await seedThree(db);

    await addSet(db, DAY, a, 60, 8);
    await addSet(db, DAY, a, 40, 10, 'drop');
    await addSet(db, DAY, a, 60, 7);

    const sets = (await listSetsForDate(db, DAY)).filter((s) => s.exerciseId === a);
    expect(sets.map((s) => s.setType)).toEqual(['normal', 'drop', 'normal']);
    expect(sets.map((s) => s.setNumber)).toEqual([1, 2, 3]);
  });
});
