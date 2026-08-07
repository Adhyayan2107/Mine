import { notFound } from 'next/navigation';
import { db } from '@/db/client';
import { listActiveHabits, listCompletionsForHabit, currentStreak, longestStreak } from '@/db/queries/habits';
import { todayDateString } from '@/lib/dates';
import { HabitDetail } from '@/components/habits/HabitDetail';

export default async function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const habitId = Number(id);
  const habits = await listActiveHabits(db);
  const habit = habits.find((h) => h.id === habitId);
  if (!habit) notFound();

  const today = todayDateString();
  const [completions, current, longest] = await Promise.all([
    listCompletionsForHabit(db, habitId),
    currentStreak(db, habitId, today),
    longestStreak(db, habitId),
  ]);

  return (
    <HabitDetail
      habit={habit}
      completionDates={completions.map((c) => c.date)}
      currentStreak={current}
      longestStreak={longest}
    />
  );
}
