import { db } from '@/db/client';
import { getProfile } from '@/db/queries/profile';
import { getDailyLog, listLastNDays, workoutStreak as getWorkoutStreak } from '@/db/queries/daily-log';
import { listWorkoutSplitDays } from '@/db/queries/workout-split-days';
import { listActiveHabits, listCompletedHabitIdsForDate } from '@/db/queries/habits';
import { listDueTodayOrOverdue } from '@/db/queries/todos';
import { listDashboardWidgets } from '@/db/queries/dashboard-widgets';
import { todayDateString } from '@/lib/dates';
import { DashboardView } from '@/components/dashboard/DashboardView';

export default async function DashboardPage() {
  const today = todayDateString();
  const [profile, todayLog, splitDays, activeHabits, completedIds, tasksDue, weekLogs, streak, widgets] =
    await Promise.all([
      getProfile(db),
      getDailyLog(db, today),
      listWorkoutSplitDays(db),
      listActiveHabits(db),
      listCompletedHabitIdsForDate(db, today),
      listDueTodayOrOverdue(db, today),
      listLastNDays(db, 7, today),
      getWorkoutStreak(db, today),
      listDashboardWidgets(db),
    ]);

  if (!profile) return <div className="p-4">Setting things up…</div>;

  const enabledWidgetKeys = new Set(widgets.filter((w) => w.isEnabled).map((w) => w.widgetKey));
  const habitRatio = activeHabits.length === 0 ? 0 : completedIds.size / activeHabits.length;
  const weeklyWeights = weekLogs.map((l) => l.weightKg).filter((w): w is number => w !== null);

  return (
    <DashboardView
      profile={profile}
      todayLog={todayLog}
      splitDays={splitDays}
      enabledWidgetKeys={enabledWidgetKeys}
      habitRatio={habitRatio}
      tasksRemaining={tasksDue.length}
      workoutStreak={streak}
      weeklyWeights={weeklyWeights}
    />
  );
}
