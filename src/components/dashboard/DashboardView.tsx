'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  logWeightAction,
  logCaloriesAction,
  logProteinAction,
  logStepsAction,
  addWaterAction,
  setWorkoutSplitDayAction,
} from '@/actions/daily-log';
import { QuickNumberModal } from '@/components/ui/QuickNumberModal';
import { DashboardCard } from './DashboardCard';
import { WeightSparkline } from './WeightSparkline';
import type { Profile, DailyLog, WorkoutSplitDay } from '@/db/schema';

type QuickField = 'weight' | 'calories' | 'protein' | 'steps' | null;

export function DashboardView({
  profile,
  todayLog,
  splitDays,
  enabledWidgetKeys,
  habitRatio,
  tasksRemaining,
  workoutStreak,
  weeklyWeights,
}: {
  profile: Profile;
  todayLog: DailyLog | null;
  splitDays: WorkoutSplitDay[];
  enabledWidgetKeys: Set<string>;
  habitRatio: number;
  tasksRemaining: number;
  workoutStreak: number;
  weeklyWeights: number[];
}) {
  const router = useRouter();
  const [quickField, setQuickField] = useState<QuickField>(null);
  const show = (key: string) => enabledWidgetKeys.has(key);
  const currentSplit = splitDays.find((d) => d.id === todayLog?.workoutSplitDayId);

  async function submit(value: number) {
    if (quickField === 'weight') await logWeightAction(value);
    if (quickField === 'calories') await logCaloriesAction(value);
    if (quickField === 'protein') await logProteinAction(value);
    if (quickField === 'steps') await logStepsAction(value);
    setQuickField(null);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
      <div className="flex items-center justify-between sm:col-span-2">
        <h1 className="text-xl font-semibold">Hello, {profile.name.split(' ')[0]}</h1>
        <Link href="/dashboard/widgets" className="text-sm text-teal-400">
          Widgets
        </Link>
      </div>

      {show('todaysWeight') && (
        <DashboardCard
          title="Today's Weight"
          value={todayLog?.weightKg ? `${todayLog.weightKg} kg` : 'Log weight'}
          onClick={() => setQuickField('weight')}
        />
      )}

      {show('caloriesRemaining') && (
        <DashboardCard
          title="Calories Remaining"
          value={`${profile.dailyCaloriesKcal - (todayLog?.caloriesKcal ?? 0)} kcal`}
          onClick={() => setQuickField('calories')}
        />
      )}

      {show('proteinProgress') && (
        <DashboardCard
          title="Protein Progress"
          value={`${todayLog?.proteinG ?? 0} / ${profile.dailyProteinG} g`}
          onClick={() => setQuickField('protein')}
        />
      )}

      {show('waterIntake') && (
        <DashboardCard
          title="Water Intake"
          value={`${todayLog?.waterMl ?? 0} / ${profile.dailyWaterMl} ml`}
          subtitle="Tap to add 250ml"
          onClick={async () => {
            await addWaterAction(250);
            router.refresh();
          }}
        />
      )}

      {/* No seeded widget key for Steps in the original plan — always shown, matching Flutter parity. */}
      <DashboardCard
        title="Steps"
        value={todayLog?.steps ? `${todayLog.steps}` : 'Log steps'}
        onClick={() => setQuickField('steps')}
      />

      {show('todaysWorkout') && (
        <div className="rounded-lg bg-neutral-900 p-4">
          <p className="text-xs font-medium text-neutral-400">Today&apos;s Workout</p>
          <select
            value={todayLog?.workoutSplitDayId ?? ''}
            onChange={async (e) => {
              await setWorkoutSplitDayAction(Number(e.target.value));
              router.refresh();
            }}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-2 text-neutral-100"
          >
            <option value="" disabled>
              {currentSplit?.label ?? 'Pick split day'}
            </option>
            {splitDays.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {show('habitCompletion') && (
        <DashboardCard title="Habit Completion" value={`${Math.round(habitRatio * 100)}%`} />
      )}

      {show('tasksRemaining') && <DashboardCard title="Tasks Remaining" value={`${tasksRemaining}`} />}

      {show('weeklyWeightGraph') && (
        <div className="rounded-lg bg-neutral-900 p-4 sm:col-span-2">
          <p className="mb-2 text-xs font-medium text-neutral-400">Weekly Weight</p>
          <WeightSparkline weights={weeklyWeights} />
        </div>
      )}

      {show('workoutStreak') && <DashboardCard title="Workout Streak" value={`${workoutStreak} days`} />}

      {show('currentGoal') && (
        <DashboardCard
          title="Current Goal"
          value={`${profile.goalWeightKg} kg @ ${profile.goalBodyFatPercent}%`}
        />
      )}

      <QuickNumberModal
        open={quickField !== null}
        title={
          quickField === 'weight'
            ? 'Weight (kg)'
            : quickField === 'calories'
              ? 'Calories eaten'
              : quickField === 'protein'
                ? 'Protein (g)'
                : 'Steps'
        }
        unit={
          quickField === 'weight' ? 'kg' : quickField === 'steps' ? 'steps' : quickField === 'protein' ? 'g' : 'kcal'
        }
        onSubmit={submit}
        onClose={() => setQuickField(null)}
      />
    </div>
  );
}
