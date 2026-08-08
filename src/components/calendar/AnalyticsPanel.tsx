'use client';

import { useMemo, useState } from 'react';
import { ElevationProfile } from '@/components/dashboard/ElevationProfile';
import { addDaysToDateString } from '@/lib/dates';
import type { DailyLog } from '@/db/schema';

type Period = 'week' | 'month' | 'year';

type Bucket = { label: string; days: string[] };

type Targets = {
  goalWeightKg: number;
  dailyCaloriesKcal: number;
  dailyProteinG: number;
  dailyWaterMl: number;
  dailySteps: number;
};

const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function dayOfWeek(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** The x-axis buckets for each period: 7 days, 4 weeks, 12 months. */
function buildBuckets(period: Period, today: string): Bucket[] {
  if (period === 'week') {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDaysToDateString(today, -(6 - i));
      return { label: DAY_LETTERS[dayOfWeek(date)], days: [date] };
    });
  }
  if (period === 'month') {
    return Array.from({ length: 4 }, (_, w) => {
      const start = addDaysToDateString(today, -(27 - w * 7));
      return {
        label: `${start.slice(8)}/${start.slice(5, 7)}`,
        days: Array.from({ length: 7 }, (_, d) => addDaysToDateString(start, d)),
      };
    });
  }
  // year: the current month and the 11 before it
  const [ty, tm] = today.split('-').map(Number);
  return Array.from({ length: 12 }, (_, i) => {
    const offset = 11 - i;
    const m = ((tm - 1 - offset) % 12 + 12) % 12;
    const y = ty - (tm - 1 - offset < 0 ? 1 : 0);
    const prefix = `${y}-${String(m + 1).padStart(2, '0')}`;
    return { label: MONTH_LETTERS[m], days: [prefix] }; // month prefix, matched by startsWith
  });
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function AnalyticsPanel({
  logs,
  targets,
  athWeight,
  today,
}: {
  logs: Array<
    Pick<DailyLog, 'date' | 'weightKg' | 'caloriesKcal' | 'proteinG' | 'waterMl' | 'steps'>
  >;
  targets: Targets;
  athWeight: number | null;
  today: string;
}) {
  const [period, setPeriod] = useState<Period>('week');

  const data = useMemo(() => {
    const buckets = buildBuckets(period, today);
    const pick = (bucket: Bucket, field: 'weightKg' | 'caloriesKcal' | 'proteinG' | 'waterMl' | 'steps') => {
      const inBucket =
        period === 'year'
          ? logs.filter((l) => l.date.startsWith(bucket.days[0]))
          : logs.filter((l) => bucket.days.includes(l.date));
      return average(inBucket.map((l) => l[field]).filter((v): v is number => v != null && v > 0));
    };
    return {
      labels: buckets.map((b) => b.label),
      weight: buckets.map((b) => pick(b, 'weightKg')),
      calories: buckets.map((b) => pick(b, 'caloriesKcal')),
      protein: buckets.map((b) => pick(b, 'proteinG')),
      water: buckets.map((b) => pick(b, 'waterMl')),
      steps: buckets.map((b) => pick(b, 'steps')),
    };
  }, [logs, period, today]);

  const weights = data.weight.filter((w): w is number => w != null);
  const periodNote =
    period === 'week' ? 'LAST 7 DAYS' : period === 'month' ? '4 WEEKS · 7-DAY AVERAGES' : '12 MONTHS · MONTHLY AVERAGES';

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-3">
        <div>
          <h2 className="sheet-title text-xl text-ink">The numbers behind the route</h2>
          <p className="mt-0.5 font-mono text-[10px] tracking-[0.12em] text-ink-faint">{periodNote}</p>
        </div>
        <div className="grid grid-cols-3 gap-px border border-hairline bg-hairline" role="radiogroup" aria-label="Analytics period">
          {(
            [
              ['week', 'Days'],
              ['month', 'Weeks'],
              ['year', 'Months'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              role="radio"
              aria-checked={period === value}
              onClick={() => setPeriod(value)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === value ? 'bg-route text-route-ink' : 'bg-surface text-ink-muted hover:bg-surface-raised'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="plate p-4">
        <p className="map-label mb-3">Weight · goal ruled in pine</p>
        <ElevationProfile weights={weights} goalKg={targets.goalWeightKg} athKg={athWeight} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <MetricBars
          title="Calories"
          unit="kcal"
          labels={data.labels}
          values={data.calories}
          target={targets.dailyCaloriesKcal}
          mode="ceiling"
          ink="var(--color-pine)"
        />
        <MetricBars
          title="Protein"
          unit="g"
          labels={data.labels}
          values={data.protein}
          target={targets.dailyProteinG}
          mode="floor"
          ink="var(--color-pine)"
        />
        <MetricBars
          title="Water"
          unit="ml"
          labels={data.labels}
          values={data.water}
          target={targets.dailyWaterMl}
          mode="floor"
          ink="var(--color-glacier)"
        />
        <MetricBars
          title="Steps"
          unit=""
          labels={data.labels}
          values={data.steps}
          target={targets.dailySteps}
          mode="floor"
          ink="var(--color-pine)"
        />
      </div>
    </section>
  );
}

/**
 * One survey bar chart: bars against a dashed target rule. `ceiling` means
 * over-target is the miss (calories); `floor` means under-target is the miss.
 * Hits carry the metric's ink, misses go muted — and the miss side is named
 * in the caption, never signaled by color alone.
 */
function MetricBars({
  title,
  unit,
  labels,
  values,
  target,
  mode,
  ink,
}: {
  title: string;
  unit: string;
  labels: string[];
  values: (number | null)[];
  target: number;
  mode: 'ceiling' | 'floor';
  ink: string;
}) {
  const W = 320;
  const H = 120;
  const padTop = 14;
  const baseY = H - 18;
  const plotH = baseY - padTop;
  const maxVal = Math.max(target, ...values.filter((v): v is number => v != null)) * 1.12;
  const n = values.length;
  const gap = 2;
  const barW = (W - gap * (n - 1)) / n;
  const yOf = (v: number) => baseY - (v / maxVal) * plotH;
  const targetY = yOf(target);

  const logged = values.filter((v) => v != null).length;
  const hit = (v: number) => (mode === 'ceiling' ? v <= target : v >= target);
  const latest = [...values].reverse().find((v) => v != null);

  return (
    <div className="plate p-4">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <p className="map-label">{title}</p>
        {latest != null && (
          <p className="tabular font-mono text-[11px] text-ink-muted">
            <span className="altitude text-base text-ink">{Math.round(latest)}</span> {unit}
          </p>
        )}
      </div>
      <p className="mb-3 font-mono text-[10px] tracking-[0.1em] text-ink-faint">
        TARGET {target}
        {unit ? ` ${unit.toUpperCase()}` : ''} · {mode === 'ceiling' ? 'OVER' : 'UNDER'} SHOWS MUTED
      </p>
      {logged === 0 ? (
        <p className="py-6 text-center text-sm text-ink-faint">Nothing logged in this window.</p>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`${title}: ${values
            .map((v, i) => `${labels[i]} ${v == null ? 'no data' : Math.round(v)}`)
            .join(', ')}; target ${target}`}
        >
          {/* the target rule */}
          <line x1="0" y1={targetY} x2={W} y2={targetY} stroke="var(--color-route)" strokeWidth="1.2" strokeDasharray="5 4" />
          <text x={W - 2} y={targetY - 3} textAnchor="end" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--color-route-deep)">
            TARGET
          </text>

          {values.map((v, i) => {
            const x = i * (barW + gap);
            if (v == null) {
              return (
                <g key={i}>
                  <line x1={x} y1={baseY} x2={x + barW} y2={baseY} stroke="var(--color-hairline-strong)" strokeWidth="1" strokeDasharray="2 3" />
                  <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--color-ink-faint)">
                    {labels[i]}
                  </text>
                </g>
              );
            }
            const y = yOf(v);
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(baseY - y, 1.5)}
                  fill={hit(v) ? ink : 'var(--color-hairline-strong)'}
                >
                  <title>{`${labels[i]}: ${Math.round(v)}${unit ? ` ${unit}` : ''}`}</title>
                </rect>
                <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--color-ink-faint)">
                  {labels[i]}
                </text>
              </g>
            );
          })}
          {/* baseline */}
          <line x1="0" y1={baseY} x2={W} y2={baseY} stroke="var(--color-hairline-strong)" strokeWidth="1" />
        </svg>
      )}
    </div>
  );
}
