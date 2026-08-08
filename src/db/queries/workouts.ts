import { and, asc, desc, eq, inArray, lt, max } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import {
  exercises,
  workoutSelections,
  workoutSets,
  type Exercise,
  type WorkoutSelection,
  type WorkoutSet,
} from '../schema';

export async function listExercises(db: AppDatabase): Promise<Exercise[]> {
  return db.select().from(exercises).orderBy(exercises.muscleGroup, exercises.sortOrder);
}

export async function listSelectionsForDate(db: AppDatabase, date: string): Promise<WorkoutSelection[]> {
  return db
    .select()
    .from(workoutSelections)
    .where(eq(workoutSelections.date, date))
    .orderBy(workoutSelections.position, workoutSelections.id);
}

export async function listSetsForDate(db: AppDatabase, date: string): Promise<WorkoutSet[]> {
  return db
    .select()
    .from(workoutSets)
    .where(eq(workoutSets.date, date))
    .orderBy(workoutSets.exerciseId, workoutSets.setNumber);
}

export async function addSelection(db: AppDatabase, date: string, exerciseId: number): Promise<void> {
  const [row] = await db
    .select({ maxPos: max(workoutSelections.position) })
    .from(workoutSelections)
    .where(eq(workoutSelections.date, date));
  await db
    .insert(workoutSelections)
    .values({ date, exerciseId, position: (row?.maxPos ?? -1) + 1 })
    .onConflictDoNothing();
}

/** Dropping an exercise from the day also drops its logged sets. */
export async function removeSelection(db: AppDatabase, date: string, exerciseId: number): Promise<void> {
  await db.delete(workoutSets).where(and(eq(workoutSets.date, date), eq(workoutSets.exerciseId, exerciseId)));
  await db
    .delete(workoutSelections)
    .where(and(eq(workoutSelections.date, date), eq(workoutSelections.exerciseId, exerciseId)));
}

export async function addSet(
  db: AppDatabase,
  date: string,
  exerciseId: number,
  weightKg: number,
  reps: number,
): Promise<void> {
  const existing = await db
    .select({ maxSet: max(workoutSets.setNumber) })
    .from(workoutSets)
    .where(and(eq(workoutSets.date, date), eq(workoutSets.exerciseId, exerciseId)));
  await db.insert(workoutSets).values({
    date,
    exerciseId,
    setNumber: (existing[0]?.maxSet ?? 0) + 1,
    weightKg,
    reps,
  });
}

export async function deleteSet(db: AppDatabase, id: number): Promise<void> {
  await db.delete(workoutSets).where(eq(workoutSets.id, id));
}

export type LastSession = {
  date: string;
  bestWeightKg: number;
  bestReps: number;
  sets: number;
  /** Every set of that session, in order — shown so the last outing is beatable set by set. */
  detail: Array<{ weightKg: number; reps: number }>;
};

/**
 * For each exercise, the most recent session before `date`: its day, every
 * set in order, and the best set (heaviest weight; most reps at that
 * weight). This is what "am I improving" compares against.
 */
export async function lastSessionsBefore(
  db: AppDatabase,
  exerciseIds: number[],
  date: string,
): Promise<Map<number, LastSession>> {
  const result = new Map<number, LastSession>();
  if (exerciseIds.length === 0) return result;

  const rows = await db
    .select()
    .from(workoutSets)
    .where(and(inArray(workoutSets.exerciseId, exerciseIds), lt(workoutSets.date, date)))
    .orderBy(desc(workoutSets.date), asc(workoutSets.setNumber));

  for (const row of rows) {
    const current = result.get(row.exerciseId);
    if (!current) {
      result.set(row.exerciseId, {
        date: row.date,
        bestWeightKg: row.weightKg,
        bestReps: row.reps,
        sets: 1,
        detail: [{ weightKg: row.weightKg, reps: row.reps }],
      });
    } else if (current.date === row.date) {
      current.sets += 1;
      current.detail.push({ weightKg: row.weightKg, reps: row.reps });
      if (row.weightKg > current.bestWeightKg || (row.weightKg === current.bestWeightKg && row.reps > current.bestReps)) {
        current.bestWeightKg = row.weightKg;
        current.bestReps = row.reps;
      }
    }
    // rows from older dates than the recorded one are ignored — newest wins
  }
  return result;
}

/**
 * Add a movement to the catalog. If the name already exists, returns the
 * existing row instead of failing — creating "Bench Press" twice just finds it.
 */
export async function createExercise(
  db: AppDatabase,
  name: string,
  muscleGroup: string,
): Promise<Exercise> {
  const inserted = await db
    .insert(exercises)
    .values({ name, muscleGroup, sortOrder: 99 })
    .onConflictDoNothing()
    .returning();
  if (inserted.length > 0) return inserted[0];
  const [existing] = await db.select().from(exercises).where(eq(exercises.name, name)).limit(1);
  return existing;
}
