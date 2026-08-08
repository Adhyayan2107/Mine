'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  logWeightAction,
  addCaloriesAction,
  addProteinAction,
  logStepsAction,
  addWaterAction,
  setWorkoutSplitDayAction,
} from '@/actions/daily-log';
import { QuickNumberModal } from '@/components/ui/QuickNumberModal';
import { SheetHeader } from '@/components/ui/SheetHeader';
import { RouteStrip } from './RouteStrip';
import { ElevationProfile } from './ElevationProfile';
import type { Profile, DailyLog, WorkoutSplitDay } from '@/db/schema';

type QuickField = 'weight' | 'calories' | 'protein' | 'steps' | null;

/**
 * One row of the chart table — a surveyor's data line, not a metric tile:
 * station name, reading, survey gauge, and target sit in aligned columns
 * (stacked into two lines on the phone), and the rows share one set of rules.
 */
function Station({
  label,
  value,
  unit,
  hint,
  progress,
  progressColor = 'bg-route',
  annotation,
  onClick,
}: {
  label: string;
  value: string | null;
  unit?: string;
  hint?: string;
  progress?: number;
  progressColor?: string;
  annotation?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-3.5 py-3 text-left transition-colors md:grid-cols-[10.5rem_9rem_minmax(0,1fr)_auto] md:py-3.5 ${
        onClick ? 'cursor-pointer hover:bg-surface-raised active:bg-surface-sunken' : ''
      }`}
    >
      <p className="map-label">{label}</p>
      <div className="flex items-baseline justify-end gap-1.5 md:justify-start">
        {value !== null ? (
          <>
            <span className="altitude text-[1.6rem] leading-none text-ink">{value}</span>
            {unit && <span className="font-mono text-[11px] text-ink-muted">{unit}</span>}
          </>
        ) : (
          <>
            <span className="altitude text-[1.6rem] leading-none text-ink-faint">– –</span>
            <span className="font-mono text-[10px] tracking-[0.12em] text-route-deep">TAP TO LOG</span>
          </>
        )}
      </div>
      {progress !== undefined ? (
        <div className="col-span-2 h-[3px] bg-surface-sunken md:col-span-1">
          <div
            className={`h-full ${progressColor} transition-[width] duration-300`}
            style={{ width: `${Math.min(progress, 1) * 100}%` }}
          />
        </div>
      ) : (
        <div className="hidden md:block" />
      )}
      {(annotation || hint) && (
        <p className="col-span-2 -mt-1 text-right font-mono text-[10px] tracking-[0.08em] text-ink-faint md:col-span-1 md:mt-0 md:text-left">
          {annotation ?? hint}
        </p>
      )}
    </Comp>
  );
}

export function DashboardView({
  profile,
  todayLog,
  splitDays,
  enabledWidgetKeys,
  habitRatio,
  tasksRemaining,
  workoutStreak,
  weeklyWeights,
  athWeight,
  daysInMonth,
  todayDay,
  activeDays,
  fullDays,
  monthLabel,
}: {
  profile: Profile;
  todayLog: DailyLog | null;
  splitDays: WorkoutSplitDay[];
  enabledWidgetKeys: Set<string>;
  habitRatio: number;
  tasksRemaining: number;
  workoutStreak: number;
  weeklyWeights: number[];
  athWeight: number | null;
  daysInMonth: number;
  todayDay: number;
  activeDays: Set<number>;
  fullDays: Set<number>;
  monthLabel: string;
}) {
  const router = useRouter();
  const [quickField, setQuickField] = useState<QuickField>(null);
  const show = (key: string) => enabledWidgetKeys.has(key);
  const currentSplit = splitDays.find((d) => d.id === todayLog?.workoutSplitDayId);

  async function submit(value: number) {
    if (quickField === 'weight') await logWeightAction(value);
    if (quickField === 'calories') await addCaloriesAction(value);
    if (quickField === 'protein') await addProteinAction(value);
    if (quickField === 'steps') await logStepsAction(value);
    setQuickField(null);
    router.refresh();
  }

  const caloriesEaten = todayLog?.caloriesKcal ?? 0;
  const caloriesLeft = profile.dailyCaloriesKcal - caloriesEaten;
  const protein = todayLog?.proteinG ?? 0;
  const water = todayLog?.waterMl ?? 0;
  const steps = todayLog?.steps ?? 0;

  // Build the station list first so the chart table can pad its final row
  // with hatched "unassigned plot" cells instead of leaving raw gaps.
  const stations: React.ReactNode[] = [];
  if (show('todaysWeight'))
    stations.push(
      <Station
        key="weight"
        label="Weight"
        value={todayLog?.weightKg ? `${todayLog.weightKg}` : null}
        unit="kg"
        hint={todayLog?.weightKg ? `GOAL ${profile.goalWeightKg} KG` : undefined}
        onClick={() => setQuickField('weight')}
      />,
    );
  if (show('caloriesRemaining'))
    stations.push(
      <Station
        key="calories"
        label="Calories left"
        value={`${caloriesLeft}`}
        unit="kcal"
        progress={profile.dailyCaloriesKcal ? caloriesEaten / profile.dailyCaloriesKcal : 0}
        progressColor={caloriesLeft < 0 ? 'bg-danger' : 'bg-route'}
        annotation={`${caloriesEaten}/${profile.dailyCaloriesKcal}`}
        onClick={() => setQuickField('calories')}
      />,
    );
  if (show('proteinProgress'))
    stations.push(
      <Station
        key="protein"
        label="Protein"
        value={`${protein}`}
        unit={`/ ${profile.dailyProteinG} g`}
        progress={profile.dailyProteinG ? protein / profile.dailyProteinG : 0}
        progressColor={protein >= profile.dailyProteinG ? 'bg-pine' : 'bg-route'}
        onClick={() => setQuickField('protein')}
      />,
    );
  if (show('waterIntake'))
    stations.push(
      <Station
        key="water"
        label="Water · +250 ml a tap"
        value={`${water}`}
        unit={`/ ${profile.dailyWaterMl} ml`}
        progress={profile.dailyWaterMl ? water / profile.dailyWaterMl : 0}
        progressColor="bg-glacier"
        onClick={async () => {
          await addWaterAction(250);
          router.refresh();
        }}
      />,
    );
  // No seeded widget key for Steps in the original plan — always shown, matching Flutter parity.
  stations.push(
    <Station
      key="steps"
      label="Steps"
      value={todayLog?.steps ? `${steps}` : null}
      unit={todayLog?.steps ? `/ ${profile.dailySteps}` : undefined}
      progress={todayLog?.steps ? steps / profile.dailySteps : undefined}
      progressColor={steps >= profile.dailySteps ? 'bg-pine' : 'bg-route'}
      onClick={() => setQuickField('steps')}
    />,
  );
  if (show('habitCompletion'))
    stations.push(
      <Station
        key="habits"
        label="Habits secured"
        value={`${Math.round(habitRatio * 100)}`}
        unit="%"
        progress={habitRatio}
        progressColor="bg-pine"
      />,
    );
  if (show('tasksRemaining'))
    stations.push(
      <Station
        key="tasks"
        label="Tasks due"
        value={`${tasksRemaining}`}
        hint={tasksRemaining > 0 ? 'ON THE MANIFEST' : 'ALL CLEAR'}
      />,
    );
  if (show('workoutStreak'))
    stations.push(
      <Station key="streak" label="Workout streak" value={`${workoutStreak}`} unit="days" hint="ROPE UNBROKEN" />,
    );
  if (show('currentGoal'))
    stations.push(
      <Station
        key="goal"
        label="Summit"
        value={`${profile.goalWeightKg}`}
        unit="kg"
        hint={`@ ${profile.goalBodyFatPercent}% BODY FAT`}
      />,
    );


  return (
    <div className="mx-auto max-w-[1160px] p-4 md:p-8">
      <SheetHeader
        title="Today"
        sheet="SHEET 01"
        note={`${profile.name.split(' ')[0]}'s route — day ${todayDay} of ${daysInMonth}`}
        action={
          <Link
            href="/dashboard/widgets"
            className="border border-hairline-strong px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
          >
            Arrange sheet
          </Link>
        }
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-6">
        <div className="min-w-0">
          <RouteStrip
            daysInMonth={daysInMonth}
            todayDay={todayDay}
            activeDays={activeDays}
            fullDays={fullDays}
            monthLabel={monthLabel}
          />

          {/* The chart table: one data line per station, rows sharing rules. */}
          <div className="plate mt-4 divide-y divide-hairline">{stations}</div>
        </div>

        {/* The sheet's margin column: today's plan and the week's profile. */}
        <div className="mt-4 space-y-4 lg:mt-0">
          {show('todaysWorkout') && (
            <div className="plate p-4">
              <div className="flex items-baseline justify-between">
                <p className="map-label">Today&apos;s workout</p>
                <Link
                  href="/workout"
                  className="font-mono text-[10px] tracking-[0.12em] text-route-deep hover:text-route"
                >
                  OPEN THE SESSION
                </Link>
              </div>
              <select
                value={todayLog?.workoutSplitDayId ?? ''}
                onChange={async (e) => {
                  await setWorkoutSplitDayAction(Number(e.target.value));
                  router.refresh();
                }}
                className="sheet-title mt-2 w-full border border-hairline bg-surface-sunken px-3 py-2.5 text-lg text-ink"
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

          {show('weeklyWeightGraph') && (
            <div className="plate p-4">
              <p className="map-label mb-3">Weight profile · 7 days</p>
              <ElevationProfile weights={weeklyWeights} goalKg={profile.goalWeightKg} athKg={athWeight} />
            </div>
          )}
        </div>
      </div>

      <QuickNumberModal
        open={quickField !== null}
        title={
          quickField === 'weight'
            ? 'Log weight'
            : quickField === 'calories'
              ? `Add calories · ${caloriesEaten} so far`
              : quickField === 'protein'
                ? `Add protein · ${protein} g so far`
                : 'Log steps'
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
