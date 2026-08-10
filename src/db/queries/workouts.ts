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

/**
 * Dropping an exercise from the day also drops its logged sets, and breaks
 * any superset it was part of so the partner reverts to a solo exercise.
 */
export async function removeSelection(db: AppDatabase, date: string, exerciseId: number): Promise<void> {
  await unpairSuperset(db, date, exerciseId);
  await db.delete(workoutSets).where(and(eq(workoutSets.date, date), eq(workoutSets.exerciseId, exerciseId)));
  await db
    .delete(workoutSelections)
    .where(and(eq(workoutSelections.date, date), eq(workoutSelections.exerciseId, exerciseId)));
}

/**
 * Pair two of the day's exercises as a superset. Either side's existing
 * pairing is broken first — an exercise supersets with exactly one partner.
 */
export async function pairSuperset(
  db: AppDatabase,
  date: string,
  exerciseId: number,
  partnerId: number,
): Promise<void> {
  await unpairSuperset(db, date, exerciseId);
  await unpairSuperset(db, date, partnerId);
  const [row] = await db
    .select({ maxGroup: max(workoutSelections.supersetGroup) })
    .from(workoutSelections)
    .where(eq(workoutSelections.date, date));
  const group = (row?.maxGroup ?? 0) + 1;
  await db
    .update(workoutSelections)
    .set({ supersetGroup: group })
    .where(and(eq(workoutSelections.date, date), inArray(workoutSelections.exerciseId, [exerciseId, partnerId])));
}

/** Break the superset this exercise belongs to — the whole group unpairs. */
export async function unpairSuperset(db: AppDatabase, date: string, exerciseId: number): Promise<void> {
  const [sel] = await db
    .select({ group: workoutSelections.supersetGroup })
    .from(workoutSelections)
    .where(and(eq(workoutSelections.date, date), eq(workoutSelections.exerciseId, exerciseId)));
  if (sel?.group == null) return;
  await db
    .update(workoutSelections)
    .set({ supersetGroup: null })
    .where(and(eq(workoutSelections.date, date), eq(workoutSelections.supersetGroup, sel.group)));
}

export async function addSet(
  db: AppDatabase,
  date: string,
  exerciseId: number,
  weightKg: number,
  reps: number,
  setType: 'normal' | 'drop' = 'normal',
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
    setType,
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
  detail: Array<{ weightKg: number; reps: number; setType: string }>;
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
        detail: [{ weightKg: row.weightKg, reps: row.reps, setType: row.setType }],
      });
    } else if (current.date === row.date) {
      current.sets += 1;
      current.detail.push({ weightKg: row.weightKg, reps: row.reps, setType: row.setType });
      if (row.weightKg > current.bestWeightKg || (row.weightKg === current.bestWeightKg && row.reps > current.bestReps)) {
        current.bestWeightKg = row.weightKg;
        current.bestReps = row.reps;
      }
    }
    // rows from older dates than the recorded one are ignored — newest wins
  }
  return result;
}

export type PRBoardEntry = {
  exerciseId: number;
  name: string;
  muscleGroup: string;
  /** All-time best set: heaviest weight, most reps at that weight. */
  best: { weightKg: number; reps: number; date: string };
  /** Best weight of each of the last sessions, oldest → newest. */
  sessionBests: number[];
  sessions: number;
};

/**
 * The best-ascents board: for every exercise ever logged, the all-time best
 * set and a per-session best-weight series for the sparkline.
 */
export async function exercisePRBoard(db: AppDatabase, sparkSessions = 12): Promise<PRBoardEntry[]> {
  const rows = await db
    .select({
      exerciseId: workoutSets.exerciseId,
      date: workoutSets.date,
      weightKg: workoutSets.weightKg,
      reps: workoutSets.reps,
      name: exercises.name,
      muscleGroup: exercises.muscleGroup,
    })
    .from(workoutSets)
    .innerJoin(exercises, eq(workoutSets.exerciseId, exercises.id))
    .orderBy(asc(workoutSets.date), asc(workoutSets.setNumber));

  const byExercise = new Map<number, PRBoardEntry & { lastDate: string }>();
  for (const row of rows) {
    let e = byExercise.get(row.exerciseId);
    if (!e) {
      e = {
        exerciseId: row.exerciseId,
        name: row.name,
        muscleGroup: row.muscleGroup,
        best: { weightKg: row.weightKg, reps: row.reps, date: row.date },
        sessionBests: [],
        sessions: 0,
        lastDate: '',
      };
      byExercise.set(row.exerciseId, e);
    }
    if (row.date !== e.lastDate) {
      e.sessionBests.push(row.weightKg);
      e.sessions += 1;
      e.lastDate = row.date;
    } else {
      const i = e.sessionBests.length - 1;
      e.sessionBests[i] = Math.max(e.sessionBests[i], row.weightKg);
    }
    if (
      row.weightKg > e.best.weightKg ||
      (row.weightKg === e.best.weightKg && row.reps > e.best.reps)
    ) {
      e.best = { weightKg: row.weightKg, reps: row.reps, date: row.date };
    }
  }

  return [...byExercise.values()].map((e) => ({
    exerciseId: e.exerciseId,
    name: e.name,
    muscleGroup: e.muscleGroup,
    best: e.best,
    sessions: e.sessions,
    sessionBests: e.sessionBests.slice(-sparkSessions),
  }));
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
