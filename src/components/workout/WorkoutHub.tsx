'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { reopenWorkoutAction, logCardioAction, deleteCardioAction } from '@/actions/workouts';
import { dateStringDiffInDays } from '@/lib/dates';
import { SheetHeader } from '@/components/ui/SheetHeader';
import { SheetModal } from '@/components/ui/SheetModal';
import { WaypointFlag } from '@/components/ui/Waypoint';
import { XGlyph } from '@/components/ui/glyphs';
import { WorkoutView, GROUP_ORDER } from './WorkoutView';
import type { Exercise, WorkoutSelection, WorkoutSet, WorkoutSplitDay, CardioSession } from '@/db/schema';
import type { LastSession, PRBoardEntry } from '@/db/queries/workouts';

const CARDIO_TYPES = ['run', 'walk', 'cycle', 'other'] as const;

function fmtDate(date: string): string {
  return new Date(`${date}T00:00:00Z`)
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })
    .toUpperCase();
}

/** min/km as M:SS — the runner's own yardstick. */
function fmtPace(durationMin: number, distanceKm: number): string {
  const pace = durationMin / distanceKm;
  const m = Math.floor(pace);
  const s = Math.round((pace - m) * 60);
  return `${m}:${s.toString().padStart(2, '0')}/KM`;
}

/** Best weight per session, oldest → newest, drawn as one small route line. */
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return <p className="font-mono text-[10px] tracking-[0.12em] text-ink-faint">ONE SESSION CHARTED</p>;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${22 - ((v - min) / range) * 18}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-6 w-full" aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        stroke="var(--color-route)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * The workout tab's landing sheet: best ascents per exercise, the cardio
 * log, and the way into (or back out of) live session tracking.
 */
export function WorkoutHub({
  today,
  finished,
  prBoard,
  cardio,
  splitDays,
  currentSplitId,
  exercises,
  selections,
  sets,
  lastSessions,
}: {
  today: string;
  finished: boolean;
  prBoard: PRBoardEntry[];
  cardio: CardioSession[];
  splitDays: WorkoutSplitDay[];
  currentSplitId: number | null;
  exercises: Exercise[];
  selections: WorkoutSelection[];
  sets: WorkoutSet[];
  lastSessions: Record<number, LastSession>;
}) {
  const router = useRouter();
  const inProgress = selections.length > 0 && !finished;
  const [view, setView] = useState<'hub' | 'track'>(inProgress ? 'track' : 'hub');
  const [loggingCardio, setLoggingCardio] = useState(false);
  const [, startTransition] = useTransition();

  if (view === 'track') {
    return (
      <WorkoutView
        splitDays={splitDays}
        currentSplitId={currentSplitId}
        exercises={exercises}
        selections={selections}
        sets={sets}
        lastSessions={lastSessions}
        onExit={() => setView('hub')}
      />
    );
  }

  const totalSets = sets.length;
  const totalVolume = Math.round(sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0));

  const board = [...prBoard].sort(
    (a, b) =>
      GROUP_ORDER.indexOf(a.muscleGroup) - GROUP_ORDER.indexOf(b.muscleGroup) ||
      a.name.localeCompare(b.name),
  );

  // Current records per cardio type — an entry holding one gets its tag.
  const bests = new Map<string, { distance?: CardioSession; duration?: CardioSession; pace?: CardioSession }>();
  for (const s of cardio) {
    const b = bests.get(s.type) ?? {};
    if (s.distanceKm != null && (b.distance?.distanceKm ?? 0) < s.distanceKm) b.distance = s;
    if ((b.duration?.durationMin ?? 0) < s.durationMin) b.duration = s;
    if (
      s.distanceKm != null &&
      (b.pace == null || s.durationMin / s.distanceKm < b.pace.durationMin / (b.pace.distanceKm ?? 1))
    )
      b.pace = s;
    bests.set(s.type, b);
  }
  function pbTags(s: CardioSession): string[] {
    const b = bests.get(s.type);
    const tags: string[] = [];
    if (b?.distance?.id === s.id) tags.push('PB DIST');
    if (b?.pace?.id === s.id && s.distanceKm != null) tags.push('PB PACE');
    if (b?.duration?.id === s.id) tags.push('PB TIME');
    return tags;
  }

  return (
    <div className="mx-auto max-w-[880px] p-4 pb-16 md:p-8">
      <SheetHeader
        title="Workout"
        sheet="SHEET 02"
        note={
          prBoard.length > 0
            ? `${prBoard.length} ${prBoard.length === 1 ? 'lift' : 'lifts'} charted · ${cardio.length} cardio ${cardio.length === 1 ? 'outing' : 'outings'}`
            : 'Every ascent starts at the first logged set.'
        }
      />

      {/* The session gate: start, continue, or reopen today's tracking. */}
      <div className="plate mb-6 flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="sheet-title text-lg text-ink">
            {finished ? 'Session logged' : inProgress ? 'Session in progress' : 'No session today'}
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">
            {finished || inProgress
              ? `${selections.length} ${selections.length === 1 ? 'exercise' : 'exercises'} · ${totalSets} ${totalSets === 1 ? 'set' : 'sets'} · ${totalVolume} kg moved`
              : 'Open the sheet and log the first set.'}
          </p>
        </div>
        {finished ? (
          <button
            onClick={() =>
              startTransition(async () => {
                await reopenWorkoutAction();
                setView('track');
                router.refresh();
              })
            }
            className="border border-hairline-strong px-4 py-2.5 font-medium text-ink-muted transition-colors hover:text-ink"
          >
            Resume session
          </button>
        ) : (
          <button
            onClick={() => setView('track')}
            className="bg-route px-5 py-2.5 font-semibold text-route-ink transition-transform active:scale-[0.98]"
          >
            {inProgress ? 'Continue session' : 'Track workout'}
          </button>
        )}
      </div>

      {/* Best ascents: the all-time best set per exercise, with its climb. */}
      <section className="mb-6">
        <p className="map-label mb-2">Best ascents</p>
        {board.length === 0 ? (
          <div className="plate p-6 text-center text-sm text-ink-muted">
            Nothing charted yet — your first tracked session starts the board.
          </div>
        ) : (
          <div className="grid gap-px border border-hairline bg-hairline md:grid-cols-2">
            {board.map((e) => {
              const recentPR = dateStringDiffInDays(today, e.best.date) <= 14;
              return (
                <div key={e.exerciseId} className="bg-surface p-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate font-medium text-ink">{e.name}</h3>
                    <span className="shrink-0 font-mono text-[10px] tracking-[0.12em] text-ink-faint">
                      {e.muscleGroup.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="altitude text-2xl leading-none text-ink">{e.best.weightKg}</span>
                    <span className="font-mono text-[11px] text-ink-muted">kg × {e.best.reps}</span>
                    <span
                      className={`ml-auto flex items-center gap-1 font-mono text-[10px] tracking-[0.1em] ${
                        recentPR ? 'font-semibold text-route-deep' : 'text-ink-faint'
                      }`}
                    >
                      {recentPR && <WaypointFlag size={11} className="text-route" />}
                      {recentPR ? 'PR · ' : ''}
                      {fmtDate(e.best.date)}
                    </span>
                  </p>
                  <div className="mt-2">
                    <Sparkline values={e.sessionBests} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Cardio log: outings with their personal bests. */}
      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="map-label">Cardio</p>
          <button
            onClick={() => setLoggingCardio(true)}
            className="font-mono text-[10px] tracking-[0.12em] text-route-deep transition-colors hover:text-route"
          >
            + LOG CARDIO
          </button>
        </div>
        {cardio.length === 0 ? (
          <div className="plate p-6 text-center text-sm text-ink-muted">
            No cardio logged yet. A run, a walk, a ride — it all counts.
          </div>
        ) : (
          <ul className="plate divide-y divide-hairline">
            {cardio.slice(0, 10).map((s) => {
              const tags = pbTags(s);
              return (
                <li key={s.id} className="flex items-center gap-3 px-3.5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">
                      {s.type[0].toUpperCase() + s.type.slice(1)}
                      <span className="ml-2 font-mono text-[10px] tracking-[0.1em] text-ink-faint">
                        {fmtDate(s.date)}
                      </span>
                    </p>
                    <p className="tabular mt-0.5 font-mono text-[11px] text-ink-muted">
                      {s.durationMin} MIN
                      {s.distanceKm != null && ` · ${s.distanceKm} KM · ${fmtPace(s.durationMin, s.distanceKm)}`}
                      {s.caloriesKcal != null && ` · ${s.caloriesKcal} KCAL`}
                    </p>
                  </div>
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 font-mono text-[10px] tracking-[0.1em] text-pine-deep"
                    >
                      <WaypointFlag size={10} className="text-pine" />
                      {t}
                    </span>
                  ))}
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        await deleteCardioAction(s.id);
                        router.refresh();
                      })
                    }
                    aria-label={`Delete ${s.type} on ${s.date}`}
                    className="shrink-0 p-1.5 text-ink-faint transition-colors hover:text-danger"
                  >
                    <XGlyph size={12} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {loggingCardio && (
        <CardioModal
          onClose={() => setLoggingCardio(false)}
          onSaved={() => {
            setLoggingCardio(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/** Log one outing: what, how long, and optionally how far / how hard. */
function CardioModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [type, setType] = useState<string>('run');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [, startTransition] = useTransition();

  const durationMin = parseInt(duration, 10);
  const valid = Number.isInteger(durationMin) && durationMin > 0;

  function save() {
    if (!valid) return;
    const distanceKm = parseFloat(distance);
    const caloriesKcal = parseInt(calories, 10);
    startTransition(async () => {
      await logCardioAction({
        type,
        durationMin,
        distanceKm: Number.isFinite(distanceKm) ? distanceKm : undefined,
        caloriesKcal: Number.isInteger(caloriesKcal) ? caloriesKcal : undefined,
      });
      onSaved();
    });
  }

  const field =
    'tabular w-full border border-hairline bg-surface-sunken px-3 py-2.5 font-mono text-lg text-ink placeholder:text-ink-faint';

  return (
    <SheetModal title="Log cardio" onClose={onClose}>
      <div className="mb-3 grid grid-cols-4 gap-px border border-hairline bg-hairline">
        {CARDIO_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`py-2.5 font-mono text-[11px] tracking-[0.1em] transition-colors ${
              type === t ? 'bg-route font-semibold text-route-ink' : 'bg-surface text-ink-muted hover:text-ink'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2">
        <div>
          <label htmlFor="cardio-min" className="map-label mb-1 block text-[10px]">
            Minutes
          </label>
          <input
            id="cardio-min"
            type="number"
            inputMode="numeric"
            autoFocus
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="30"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="cardio-km" className="map-label mb-1 block text-[10px]">
            Km
          </label>
          <input
            id="cardio-km"
            type="number"
            inputMode="decimal"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="—"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="cardio-kcal" className="map-label mb-1 block text-[10px]">
            Kcal
          </label>
          <input
            id="cardio-kcal"
            type="number"
            inputMode="numeric"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder="—"
            className={field}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 border border-hairline-strong py-3 font-medium text-ink-muted transition-transform active:scale-[0.98]"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={!valid}
          className="flex-1 bg-route py-3 font-semibold text-route-ink transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          Log it
        </button>
      </div>
    </SheetModal>
  );
}
