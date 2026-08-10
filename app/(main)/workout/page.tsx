import { db } from '@/db/client';
import { getDailyLog } from '@/db/queries/daily-log';
import { listWorkoutSplitDays } from '@/db/queries/workout-split-days';
import {
  listExercises,
  listSelectionsForDate,
  listSetsForDate,
  lastSessionsBefore,
  exercisePRBoard,
} from '@/db/queries/workouts';
import { listCardioSessions } from '@/db/queries/cardio';
import { todayDateString } from '@/lib/dates';
import { WorkoutHub } from '@/components/workout/WorkoutHub';

export default async function WorkoutPage() {
  const today = todayDateString();
  const [todayLog, splitDays, exercises, selections, sets, prBoard, cardio] = await Promise.all([
    getDailyLog(db, today),
    listWorkoutSplitDays(db),
    listExercises(db),
    listSelectionsForDate(db, today),
    listSetsForDate(db, today),
    exercisePRBoard(db),
    listCardioSessions(db),
  ]);
  const lastSessions = await lastSessionsBefore(
    db,
    selections.map((s) => s.exerciseId),
    today,
  );

  return (
    <WorkoutHub
      today={today}
      finished={todayLog?.workoutFinishedAt != null}
      prBoard={prBoard}
      cardio={cardio}
      splitDays={splitDays}
      currentSplitId={todayLog?.workoutSplitDayId ?? null}
      exercises={exercises}
      selections={selections}
      sets={sets}
      lastSessions={Object.fromEntries(lastSessions)}
    />
  );
}
