'use client';

import { useRouter } from 'next/navigation';
import { setDashboardWidgetEnabledAction, moveDashboardWidgetAction } from '@/actions/dashboard-widgets';
import { SheetHeader } from '@/components/ui/SheetHeader';
import { ChevronUpGlyph, ChevronDownGlyph } from '@/components/ui/glyphs';
import type { DashboardWidgetConfig } from '@/db/schema';

const WIDGET_LABELS: Record<string, string> = {
  todaysWeight: 'Weight',
  todaysWorkout: "Today's Workout",
  caloriesRemaining: 'Calories Left',
  proteinProgress: 'Protein',
  waterIntake: 'Water',
  habitCompletion: 'Habits Secured',
  tasksRemaining: 'Tasks Due',
  weeklyWeightGraph: 'Weight Profile',
  workoutStreak: 'Workout Streak',
  currentGoal: 'Summit Goal',
};

export function WidgetSettingsList({ widgets }: { widgets: DashboardWidgetConfig[] }) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-[720px] p-4 md:p-8">
      <SheetHeader
        title="Arrange the sheet"
        sheet="SHEET 01 · A"
        note="Reorder or hide the stations on Today."
      />
      <ul className="plate divide-y divide-hairline">
        {widgets.map((widget, i) => (
          <li key={widget.id} className="flex items-center gap-3 px-3 py-2.5 md:px-4">
            <div className="flex flex-col">
              <button
                disabled={i === 0}
                onClick={async () => {
                  await moveDashboardWidgetAction(widget.id, 'up');
                  router.refresh();
                }}
                aria-label={`Move ${WIDGET_LABELS[widget.widgetKey] ?? widget.widgetKey} up`}
                className="px-1 py-0.5 text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
              >
                <ChevronUpGlyph size={13} />
              </button>
              <button
                disabled={i === widgets.length - 1}
                onClick={async () => {
                  await moveDashboardWidgetAction(widget.id, 'down');
                  router.refresh();
                }}
                aria-label={`Move ${WIDGET_LABELS[widget.widgetKey] ?? widget.widgetKey} down`}
                className="px-1 py-0.5 text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
              >
                <ChevronDownGlyph size={13} />
              </button>
            </div>
            <span className="flex-1 font-medium text-ink">
              {WIDGET_LABELS[widget.widgetKey] ?? widget.widgetKey}
            </span>
            <input
              type="checkbox"
              checked={widget.isEnabled}
              onChange={async (e) => {
                await setDashboardWidgetEnabledAction(widget.id, e.target.checked);
                router.refresh();
              }}
              aria-label={`Show ${WIDGET_LABELS[widget.widgetKey] ?? widget.widgetKey}`}
              className="h-5 w-5"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
