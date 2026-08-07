import type { AppDatabase } from '../types';
import { workoutSplitDays, type WorkoutSplitDay } from '../schema';

export async function listWorkoutSplitDays(db: AppDatabase): Promise<WorkoutSplitDay[]> {
  return db.select().from(workoutSplitDays).orderBy(workoutSplitDays.orderIndex);
}
