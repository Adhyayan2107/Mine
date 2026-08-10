'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setWorkoutSplitDayAction } from '@/actions/daily-log';
import {
  addExerciseAction,
  removeExerciseAction,
  logSetAction,
  deleteSetAction,
  createExerciseAction,
  pairSupersetAction,
  unpairSupersetAction,
  finishWorkoutAction,
} from '@/actions/workouts';
import { SheetHeader } from '@/components/ui/SheetHeader';
import { SheetModal } from '@/components/ui/SheetModal';
import { PlotCheck, WaypointFlag } from '@/components/ui/Waypoint';
import {
  PlusGlyph,
  XGlyph,
  TrendUpGlyph,
  TrendDownGlyph,
  TrendFlatGlyph,
} from '@/components/ui/glyphs';
import type { Exercise, WorkoutSelection, WorkoutSet, WorkoutSplitDay } from '@/db/schema';
import type { LastSession } from '@/db/queries/workouts';

/** Which muscle groups a split day trains — those surface first in the picker. */
const SPLIT_GROUPS: Record<string, string[]> = {
  push: ['chest', 'shoulders', 'triceps'],
  pull: ['lats', 'biceps'],
  legs: ['legs', 'abs'],
  upper: ['chest', 'lats', 'shoulders', 'biceps', 'triceps'],
  lower: ['legs', 'abs'],
  'arms + core': ['biceps', 'triceps', 'abs'],
};

export const GROUP_ORDER = ['chest', 'lats', 'shoulders', 'biceps', 'triceps', 'legs', 'abs'];

export function WorkoutView({
  splitDays,
  currentSplitId,
  exercises,
  selections,
  sets,
  lastSessions,
  onExit,
}: {
  splitDays: WorkoutSplitDay[];
  currentSplitId: number | null;
  exercises: Exercise[];
  selections: WorkoutSelection[];
  sets: WorkoutSet[];
  lastSessions: Record<number, LastSession>;
  /** Back to the hub; finishing the session also routes through it. */
  onExit?: () => void;
}) {
  const router = useRouter();
  const [picking, setPicking] = useState(false);
  const [removing, setRemoving] = useState<Exercise | null>(null);
  const [pairingFor, setPairingFor] = useState<Exercise | null>(null);
  const [, startTransition] = useTransition();

  const currentSplit = splitDays.find((d) => d.id === currentSplitId);
  const relevantGroups = SPLIT_GROUPS[currentSplit?.label.toLowerCase() ?? ''] ?? [];
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const setsByExercise = new Map<number, WorkoutSet[]>();
  for (const s of sets) {
    const list = setsByExercise.get(s.exerciseId) ?? [];
    list.push(s);
    setsByExercise.set(s.exerciseId, list);
  }
  const selectedIds = new Set(selections.map((s) => s.exerciseId));

  // Picker ordering: the split day's groups first, the rest after.
  const groupsInOrder = [
    ...relevantGroups,
    ...GROUP_ORDER.filter((g) => !relevantGroups.includes(g)),
  ];

  const totalSets = sets.length;
  const totalVolume = Math.round(sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0));

  function plateFor(sel: WorkoutSelection, opts: { bare?: boolean; tag?: string } = {}) {
    const exercise = byId.get(sel.exerciseId);
    if (!exercise) return null;
    return (
      <ExercisePlate
        key={sel.exerciseId}
        exercise={exercise}
        sets={setsByExercise.get(sel.exerciseId) ?? []}
        last={lastSessions[sel.exerciseId] ?? null}
        bare={opts.bare}
        tag={opts.tag}
        onSuperset={
          sel.supersetGroup == null && selections.length > 1 ? () => setPairingFor(exercise) : undefined
        }
        onRemove={() => {
          const hasSets = (setsByExercise.get(sel.exerciseId) ?? []).length > 0;
          if (hasSets) setRemoving(exercise);
          else
            startTransition(async () => {
              await removeExerciseAction(sel.exerciseId);
              router.refresh();
            });
        }}
        onLog={(w, r, type) =>
          startTransition(async () => {
            await logSetAction(sel.exerciseId, w, r, type);
            router.refresh();
          })
        }
        onDeleteSet={(id) =>
          startTransition(async () => {
            await deleteSetAction(id);
            router.refresh();
          })
        }
      />
    );
  }

  // Superset partners render as one joined plate, in first-member order.
  const byGroup = new Map<number, WorkoutSelection[]>();
  for (const sel of selections) {
    if (sel.supersetGroup == null) continue;
    const list = byGroup.get(sel.supersetGroup) ?? [];
    list.push(sel);
    byGroup.set(sel.supersetGroup, list);
  }
  const renderedIds = new Set<number>();
  const plates: React.ReactNode[] = [];
  for (const sel of selections) {
    if (renderedIds.has(sel.exerciseId)) continue;
    const group = sel.supersetGroup != null ? (byGroup.get(sel.supersetGroup) ?? [sel]) : [sel];
    group.forEach((g) => renderedIds.add(g.exerciseId));
    if (group.length > 1) {
      plates.push(
        <section key={`ss-${sel.supersetGroup}`} className="plate">
          <div className="flex items-center justify-between bg-surface-sunken px-4 py-2">
            <p className="font-mono text-[10px] tracking-[0.16em] text-route-deep">
              SUPERSET · BACK TO BACK, NO REST
            </p>
            <button
              onClick={() =>
                startTransition(async () => {
                  await unpairSupersetAction(sel.exerciseId);
                  router.refresh();
                })
              }
              className="font-mono text-[10px] tracking-[0.12em] text-ink-faint transition-colors hover:text-danger"
            >
              BREAK
            </button>
          </div>
          <div className="divide-y divide-hairline-strong border-t border-hairline">
            {group.map((g, gi) => plateFor(g, { bare: true, tag: `A${gi + 1}` }))}
          </div>
        </section>,
      );
    } else {
      plates.push(plateFor(sel));
    }
  }

  return (
    <div className="mx-auto max-w-[880px] p-4 pb-44 md:p-8 md:pb-28">
      <SheetHeader
        title="Workout"
        sheet="SHEET 02"
        note={
          totalSets > 0
            ? `${selections.length} ${selections.length === 1 ? 'exercise' : 'exercises'} · ${totalSets} ${totalSets === 1 ? 'set' : 'sets'} · ${totalVolume} kg moved`
            : 'Log the session as you climb it.'
        }
        action={
          onExit && (
            <button
              onClick={onExit}
              className="border border-hairline-strong px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Back to hub
            </button>
          )
        }
      />

      {/* The day's split sets which exercises lead the picker. */}
      <div className="plate mb-5 flex items-center gap-3 p-3.5">
        <label htmlFor="split-select" className="map-label shrink-0">
          Split day
        </label>
        <select
          id="split-select"
          value={currentSplitId ?? ''}
          onChange={async (e) => {
            await setWorkoutSplitDayAction(Number(e.target.value));
            router.refresh();
          }}
          className="sheet-title min-w-0 flex-1 border border-hairline bg-surface-sunken px-3 py-2 text-lg text-ink"
        >
          <option value="" disabled>
            Pick split day
          </option>
          {splitDays.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {selections.length === 0 ? (
        <div className="plate p-8 text-center">
          <p className="sheet-title text-lg text-ink">Nothing on the bar yet</p>
          <p className="mt-1 text-sm text-ink-muted">
            {currentSplit
              ? `Add the first ${currentSplit.label.toLowerCase()} exercise.`
              : 'Pick a split day, then add exercises.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">{plates}</div>
      )}

      {/* Submitting plants the day's flag and hands the tab back to the hub. */}
      {totalSets > 0 && (
        <button
          onClick={() =>
            startTransition(async () => {
              await finishWorkoutAction();
              router.refresh();
              onExit?.();
            })
          }
          className="mt-6 flex w-full items-center justify-center gap-2 bg-pine py-3.5 font-semibold text-surface-raised transition-transform active:scale-[0.99]"
        >
          <WaypointFlag size={14} />
          Finish workout · {totalSets} {totalSets === 1 ? 'set' : 'sets'} · {totalVolume} kg
        </button>
      )}

      <button
        onClick={() => setPicking(true)}
        className="fixed bottom-24 right-4 flex h-14 w-14 items-center justify-center bg-route text-route-ink shadow-[0_10px_28px_-8px_rgba(120,40,5,0.55)] transition-transform active:scale-90 md:bottom-8 md:right-8"
        aria-label="Add exercise"
      >
        <PlusGlyph size={22} />
      </button>

      {picking && (
        <SheetModal title="Add exercises" onClose={() => setPicking(false)}>
          {relevantGroups.length > 0 && (
            <p className="mb-3 font-mono text-[10px] tracking-[0.12em] text-ink-faint">
              {currentSplit?.label.toUpperCase()} DAY — ITS MUSCLES LEAD THE LIST
            </p>
          )}
          <div className="space-y-4">
            {groupsInOrder.map((group) => {
              const groupExercises = exercises.filter((e) => e.muscleGroup === group);
              if (groupExercises.length === 0) return null;
              const relevant = relevantGroups.includes(group);
              return (
                <div key={group}>
                  <p className={`map-label mb-1.5 ${relevant ? 'text-route-deep' : ''}`}>{group}</p>
                  <ul className="plate divide-y divide-hairline">
                    {groupExercises.map((e) => {
                      const chosen = selectedIds.has(e.id);
                      return (
                        <li key={e.id}>
                          <button
                            onClick={() =>
                              startTransition(async () => {
                                if (chosen) await removeExerciseAction(e.id);
                                else await addExerciseAction(e.id);
                                router.refresh();
                              })
                            }
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-raised"
                          >
                            <PlotCheck done={chosen} size="sm" />
                            <span className={chosen ? 'font-medium text-ink' : 'text-ink-muted'}>
                              {e.name}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
          <NewExerciseForm
            defaultGroup={relevantGroups[0] ?? 'chest'}
            onCreate={(name, group) =>
              startTransition(async () => {
                await createExerciseAction(name, group);
                router.refresh();
              })
            }
          />
          <button
            onClick={() => setPicking(false)}
            className="mt-4 w-full bg-route py-3 font-semibold text-route-ink transition-transform active:scale-[0.98]"
          >
            Done
          </button>
        </SheetModal>
      )}

      {pairingFor && (
        <SheetModal title={`Superset ${pairingFor.name} with…`} onClose={() => setPairingFor(null)}>
          <p className="mb-3 text-sm leading-relaxed text-ink-muted">
            Pick the exercise you do back to back with it. Pairing again re-pairs.
          </p>
          <ul className="plate divide-y divide-hairline">
            {selections
              .filter((s) => s.exerciseId !== pairingFor.id)
              .map((s) => {
                const e = byId.get(s.exerciseId);
                if (!e) return null;
                return (
                  <li key={e.id}>
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          await pairSupersetAction(pairingFor.id, e.id);
                          setPairingFor(null);
                          router.refresh();
                        })
                      }
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-raised"
                    >
                      <span className="text-ink">{e.name}</span>
                      {s.supersetGroup != null && (
                        <span className="font-mono text-[10px] tracking-[0.12em] text-ink-faint">
                          PAIRED — WILL RE-PAIR
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
          </ul>
        </SheetModal>
      )}

      {removing && (
        <SheetModal title={`Remove ${removing.name}?`} onClose={() => setRemoving(null)}>
          <p className="mb-4 text-sm leading-relaxed text-ink-muted">
            This drops the exercise and today&apos;s{' '}
            {(setsByExercise.get(removing.id) ?? []).length} logged{' '}
            {(setsByExercise.get(removing.id) ?? []).length === 1 ? 'set' : 'sets'} with it.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setRemoving(null)}
              className="flex-1 border border-hairline-strong py-3 font-medium text-ink-muted transition-transform active:scale-[0.98]"
            >
              Keep it
            </button>
            <button
              onClick={() =>
                startTransition(async () => {
                  await removeExerciseAction(removing.id);
                  setRemoving(null);
                  router.refresh();
                })
              }
              className="flex-1 bg-danger py-3 font-semibold text-surface-raised transition-transform active:scale-[0.98]"
            >
              Remove
            </button>
          </div>
        </SheetModal>
      )}
    </div>
  );
}

/** Add a movement the catalog doesn't have: name + the part it targets. */
function NewExerciseForm({
  defaultGroup,
  onCreate,
}: {
  defaultGroup: string;
  onCreate: (name: string, group: string) => void;
}) {
  const [name, setName] = useState('');
  const [group, setGroup] = useState(defaultGroup);

  function create() {
    if (!name.trim()) return;
    onCreate(name.trim(), group);
    setName('');
  }

  return (
    <div className="mt-4 border-t border-hairline pt-4">
      <p className="map-label mb-1.5">Not in the catalog? Add it</p>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && create()}
          placeholder="Exercise name"
          className="min-w-0 flex-1 border border-hairline bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint"
        />
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          aria-label="Muscle group"
          className="border border-hairline bg-surface px-2 py-2.5 text-sm text-ink"
        >
          {GROUP_ORDER.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <button
          onClick={create}
          disabled={!name.trim()}
          className="shrink-0 bg-route px-3.5 py-2.5 text-sm font-semibold text-route-ink transition-transform active:scale-95 disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}

/** One exercise of the session: header with trend, logged sets, the log row. */
function ExercisePlate({
  exercise,
  sets,
  last,
  bare,
  tag,
  onSuperset,
  onRemove,
  onLog,
  onDeleteSet,
}: {
  exercise: Exercise;
  sets: WorkoutSet[];
  last: LastSession | null;
  /** Rendered inside a superset frame — the frame owns the plate chrome. */
  bare?: boolean;
  /** Superset position label (A1 / A2). */
  tag?: string;
  /** Offered only while solo; pairing UI lives on the parent. */
  onSuperset?: () => void;
  onRemove: () => void;
  onLog: (weightKg: number, reps: number, setType: 'normal' | 'drop') => void;
  onDeleteSet: (id: number) => void;
}) {
  const lastSet = sets[sets.length - 1];
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const todayBest = sets.reduce<{ w: number; r: number } | null>((best, s) => {
    if (!best || s.weightKg > best.w || (s.weightKg === best.w && s.reps > best.r)) {
      return { w: s.weightKg, r: s.reps };
    }
    return best;
  }, null);

  let trend: 'up' | 'down' | 'flat' | null = null;
  if (todayBest && last) {
    if (todayBest.w > last.bestWeightKg || (todayBest.w === last.bestWeightKg && todayBest.r > last.bestReps))
      trend = 'up';
    else if (todayBest.w === last.bestWeightKg && todayBest.r === last.bestReps) trend = 'flat';
    else trend = 'down';
  }

  function log(setType: 'normal' | 'drop') {
    const w = parseFloat(weight || `${lastSet?.weightKg ?? last?.bestWeightKg ?? ''}`);
    const r = parseInt(reps || `${lastSet?.reps ?? last?.bestReps ?? ''}`, 10);
    if (Number.isNaN(w) || Number.isNaN(r)) return;
    onLog(w, r, setType);
    setWeight('');
    setReps('');
  }

  // Drop sets ride along unnumbered; only working sets count up.
  let workingSets = 0;
  const setLabels: string[] = [];
  for (const s of sets) {
    if (s.setType !== 'drop') workingSets += 1;
    setLabels.push(s.setType === 'drop' ? '↳ DROP' : `SET ${workingSets}`);
  }

  return (
    <section className={bare ? '' : 'plate'}>
      <div className="flex items-center gap-2.5 border-b border-hairline px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-medium text-ink">
            {tag && <span className="mr-1.5 font-mono text-[11px] tracking-[0.1em] text-route-deep">{tag}</span>}
            {exercise.name}
          </h2>
          <p className="mt-0.5 font-mono text-[10px] tracking-[0.12em] text-ink-faint">
            {exercise.muscleGroup.toUpperCase()}
            {!last && ' · FIRST ASCENT'}
          </p>
          {last && (
            <p className="tabular mt-1 font-mono text-[11px] text-ink-muted">
              <span className="tracking-[0.1em] text-ink-faint">LAST · {last.date.slice(5)} </span>
              {last.detail.map((d, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-ink-faint"> · </span>}
                  {d.setType === 'drop' && <span className="text-ink-faint">↳</span>}
                  {d.weightKg}×{d.reps}
                </span>
              ))}
            </p>
          )}
          {onSuperset && (
            <button
              onClick={onSuperset}
              className="mt-1.5 font-mono text-[10px] tracking-[0.12em] text-route-deep transition-colors hover:text-route"
            >
              + SUPERSET
            </button>
          )}
        </div>
        {trend === 'up' && <TrendUpGlyph className="shrink-0 text-pine" />}
        {trend === 'down' && <TrendDownGlyph className="shrink-0 text-danger" />}
        {trend === 'flat' && <TrendFlatGlyph className="shrink-0 text-ink-faint" />}
        <button
          onClick={onRemove}
          aria-label={`Remove ${exercise.name}`}
          className="shrink-0 p-1.5 text-ink-faint transition-colors hover:text-danger"
        >
          <XGlyph size={14} />
        </button>
      </div>

      {sets.length > 0 && (
        <ul className="divide-y divide-hairline border-b border-hairline">
          {sets.map((s, i) => {
            const isDrop = s.setType === 'drop';
            return (
              <li key={s.id} className={`flex items-center gap-3 py-2 pr-3.5 ${isDrop ? 'pl-8' : 'pl-4'}`}>
                <span
                  className={`font-mono text-[10px] tracking-[0.12em] ${isDrop ? 'text-route-deep' : 'text-ink-faint'}`}
                >
                  {setLabels[i]}
                </span>
                <span className="tabular flex-1 text-right font-mono text-sm text-ink">
                  <span className="altitude text-lg">{s.weightKg}</span> kg ×{' '}
                  <span className="altitude text-lg">{s.reps}</span>
                </span>
                {/* a set heavier than last session's best plants the PR flag */}
                {last && s.weightKg > last.bestWeightKg && (
                  <WaypointFlag size={11} className="text-route" />
                )}
                <button
                  onClick={() => onDeleteSet(s.id)}
                  aria-label={`Delete set ${s.setNumber}`}
                  className="p-1.5 text-ink-faint transition-colors hover:text-danger"
                >
                  <XGlyph size={12} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-end gap-2 px-4 py-3">
        <div className="flex-1">
          <label htmlFor={`w-${exercise.id}`} className="map-label mb-1 block text-[10px]">
            Weight (kg)
          </label>
          <input
            id={`w-${exercise.id}`}
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={`${lastSet?.weightKg ?? last?.bestWeightKg ?? 0}`}
            className="tabular w-full border border-hairline bg-surface-sunken px-3 py-2.5 font-mono text-lg text-ink placeholder:text-ink-faint"
          />
        </div>
        <div className="flex-1">
          <label htmlFor={`r-${exercise.id}`} className="map-label mb-1 block text-[10px]">
            Reps
          </label>
          <input
            id={`r-${exercise.id}`}
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && log('normal')}
            placeholder={`${lastSet?.reps ?? last?.bestReps ?? 0}`}
            className="tabular w-full border border-hairline bg-surface-sunken px-3 py-2.5 font-mono text-lg text-ink placeholder:text-ink-faint"
          />
        </div>
        {sets.length > 0 && (
          <button
            onClick={() => log('drop')}
            title="Log a drop set — lower the weight, no rest"
            className="shrink-0 border border-hairline-strong px-3 py-2.5 font-mono text-[11px] tracking-[0.08em] text-ink-muted transition-transform active:scale-[0.97]"
          >
            DROP
          </button>
        )}
        <button
          onClick={() => log('normal')}
          className="shrink-0 bg-route px-4 py-2.5 font-semibold text-route-ink transition-transform active:scale-[0.97]"
        >
          Log set {workingSets + 1}
        </button>
      </div>
    </section>
  );
}
