'use client';

import { useRouter } from 'next/navigation';
import { setDashboardWidgetEnabledAction, moveDashboardWidgetAction } from '@/actions/dashboard-widgets';
import type { DashboardWidgetConfig } from '@/db/schema';

const WIDGET_LABELS: Record<string, string> = {
  todaysWeight: "Today's Weight",
  todaysWorkout: "Today's Workout",
  caloriesRemaining: 'Calories Remaining',
  proteinProgress: 'Protein Progress',
  waterIntake: 'Water Intake',
  habitCompletion: 'Habit Completion',
  tasksRemaining: 'Tasks Remaining',
  weeklyWeightGraph: 'Weekly Weight Graph',
  workoutStreak: 'Workout Streak',
  currentGoal: 'Current Goal',
};

export function WidgetSettingsList({ widgets }: { widgets: DashboardWidgetConfig[] }) {
  const router = useRouter();

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-semibold">Dashboard Widgets</h1>
      <ul className="space-y-2">
        {widgets.map((widget, i) => (
          <li key={widget.id} className="flex items-center gap-3 rounded-lg bg-neutral-900 p-3">
            <div className="flex flex-col">
              <button
                disabled={i === 0}
                onClick={async () => {
                  await moveDashboardWidgetAction(widget.id, 'up');
                  router.refresh();
                }}
                aria-label="Move up"
                className="px-1 text-neutral-400 disabled:opacity-30"
              >
                ▲
              </button>
              <button
                disabled={i === widgets.length - 1}
                onClick={async () => {
                  await moveDashboardWidgetAction(widget.id, 'down');
                  router.refresh();
                }}
                aria-label="Move down"
                className="px-1 text-neutral-400 disabled:opacity-30"
              >
                ▼
              </button>
            </div>
            <span className="flex-1 text-neutral-100">
              {WIDGET_LABELS[widget.widgetKey] ?? widget.widgetKey}
            </span>
            <input
              type="checkbox"
              checked={widget.isEnabled}
              onChange={async (e) => {
                await setDashboardWidgetEnabledAction(widget.id, e.target.checked);
                router.refresh();
              }}
              className="h-6 w-6"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
