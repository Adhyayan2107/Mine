import { db } from '@/db/client';
import { getProfile } from '@/db/queries/profile';
import { listLastNDays, allTimeHighWeight, workoutStreak as getWorkoutStreak } from '@/db/queries/daily-log';
import { listWorkoutSplitDays } from '@/db/queries/workout-split-days';
import { listActiveHabits, listCompletedHabitIdsForDate } from '@/db/queries/habits';
import { listDueTodayOrOverdue } from '@/db/queries/todos';
import { listDashboardWidgets } from '@/db/queries/dashboard-widgets';
import { getMonthActivity } from '@/db/queries/calendar';
import { todayDateString } from '@/lib/dates';
import { DashboardView } from '@/components/dashboard/DashboardView';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export default async function DashboardPage() {
  const today = todayDateString();
  const [year, month, todayDay] = today.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthStart = `${year}-${pad(month)}-01`;
  const monthEnd = `${year}-${pad(month)}-${pad(daysInMonth)}`;

  const [
    profile,
    splitDays,
    activeHabits,
    completedIds,
    tasksDue,
    weekLogs,
    streak,
    widgets,
    monthActivity,
    athWeight,
  ] = await Promise.all([
    getProfile(db),
    listWorkoutSplitDays(db),
    listActiveHabits(db),
    listCompletedHabitIdsForDate(db, today),
    listDueTodayOrOverdue(db, today),
    listLastNDays(db, 7, today),
    getWorkoutStreak(db, today),
    listDashboardWidgets(db),
    getMonthActivity(db, monthStart, monthEnd),
    allTimeHighWeight(db),
  ]);
  // The 7-day window ends today — today's log rides along instead of being
  // its own round trip.
  const todayLog = weekLogs.find((l) => l.date === today) ?? null;

  if (!profile) return <div className="p-4">Setting things up…</div>;

  const enabledWidgetKeys = new Set(widgets.filter((w) => w.isEnabled).map((w) => w.widgetKey));
  const habitRatio = activeHabits.length === 0 ? 0 : completedIds.size / activeHabits.length;
  const weeklyWeights = weekLogs.map((l) => l.weightKg).filter((w): w is number => w !== null);

  // Days of this month with anything logged — the camps on the route strip.
  // A day with all four logged (weight, workout, habits, journal) is a full
  // log and gets its flag planted.
  const activeDays = new Set<number>();
  const fullDays = new Set<number>();
  for (const [date, a] of monthActivity) {
    const parts = [a.hasWeight, a.hasWorkout, a.habitsCompleted > 0, a.hasJournal];
    if (parts.some(Boolean)) activeDays.add(Number(date.slice(8)));
    if (parts.every(Boolean)) fullDays.add(Number(date.slice(8)));
  }

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
      athWeight={athWeight}
      daysInMonth={daysInMonth}
      todayDay={todayDay}
      activeDays={activeDays}
      fullDays={fullDays}
      monthLabel={`${MONTH_NAMES[month - 1]} ${year}`}
    />
  );
}
