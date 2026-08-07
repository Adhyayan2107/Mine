import { db } from '@/db/client';
import { listActiveHabits, listCompletedHabitIdsForDate, listRecentCompletionsForHabits } from '@/db/queries/habits';
import { todayDateString, addDaysToDateString } from '@/lib/dates';
import { HabitList } from '@/components/habits/HabitList';

export default async function HabitsPage() {
  const today = todayDateString();
  const [habits, completedIds] = await Promise.all([
    listActiveHabits(db),
    listCompletedHabitIdsForDate(db, today),
  ]);
  const completionsMap = await listRecentCompletionsForHabits(
    db,
    habits.map((h) => h.id),
    addDaysToDateString(today, -29),
  );
  const recentCompletions: Record<number, string[]> = {};
  for (const [habitId, dates] of completionsMap) {
    recentCompletions[habitId] = [...dates];
  }

  return (
    <HabitList
      habits={habits}
      completedIds={[...completedIds]}
      recentCompletions={recentCompletions}
      today={today}
    />
  );
}
