import { db } from '@/db/client';
import { listActiveHabits, listCompletedHabitIdsForDate } from '@/db/queries/habits';
import { todayDateString } from '@/lib/dates';
import { HabitList } from '@/components/habits/HabitList';

export default async function HabitsPage() {
  const today = todayDateString();
  const [habits, completedIds] = await Promise.all([
    listActiveHabits(db),
    listCompletedHabitIdsForDate(db, today),
  ]);
  return <HabitList habits={habits} completedIds={[...completedIds]} />;
}
