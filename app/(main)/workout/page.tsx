import { db } from '@/db/client';
import { getDailyLog } from '@/db/queries/daily-log';
import { listWorkoutSplitDays } from '@/db/queries/workout-split-days';
import { listExercises, listSelectionsForDate, listSetsForDate, lastSessionsBefore } from '@/db/queries/workouts';
import { todayDateString } from '@/lib/dates';
import { WorkoutView } from '@/components/workout/WorkoutView';

export default async function WorkoutPage() {
  const today = todayDateString();
  const [todayLog, splitDays, exercises, selections, sets] = await Promise.all([
    getDailyLog(db, today),
    listWorkoutSplitDays(db),
    listExercises(db),
    listSelectionsForDate(db, today),
    listSetsForDate(db, today),
  ]);
  const lastSessions = await lastSessionsBefore(
    db,
    selections.map((s) => s.exerciseId),
    today,
  );

  return (
    <WorkoutView
      splitDays={splitDays}
      currentSplitId={todayLog?.workoutSplitDayId ?? null}
      exercises={exercises}
      selections={selections}
      sets={sets}
      lastSessions={Object.fromEntries(lastSessions)}
    />
  );
}
