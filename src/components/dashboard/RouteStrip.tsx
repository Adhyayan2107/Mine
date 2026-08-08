import { WaypointFlag } from '@/components/ui/Waypoint';

/**
 * The month as an ascent. One line climbs from the 1st to the last day;
 * every day you logged something is a camp on the line, today carries the
 * flag, and the unclimbed remainder is dashed. This is the first thing the
 * sheet says: where you are on the route.
 */
export function RouteStrip({
  daysInMonth,
  todayDay,
  activeDays,
  monthLabel,
}: {
  daysInMonth: number;
  todayDay: number;
  activeDays: Set<number>;
  monthLabel: string;
}) {
  const W = 640;
  const H = 88;
  const padX = 10;
  const x = (i: number) => padX + (i / (daysInMonth - 1)) * (W - padX * 2);
  const y = (i: number) => 72 - (i / (daysInMonth - 1)) * 46 + 5 * Math.sin(i * 0.85);

  const pts = Array.from({ length: daysInMonth }, (_, i) => ({ x: x(i), y: y(i), day: i + 1 }));
  const climbed = pts.slice(0, todayDay);
  const ahead = pts.slice(todayDay - 1);
  const toPath = (list: { x: number; y: number }[]) =>
    list.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const todayPt = pts[todayDay - 1];
  const campCount = [...activeDays].filter((d) => d <= todayDay).length;

  return (
    <div className="plate p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Route through ${monthLabel}: camps made on ${campCount} of ${todayDay} days so far`}
      >
        {/* elevation grid rules */}
        {[24, 48, 72].map((gy) => (
          <line key={gy} x1="0" y1={gy} x2={W} y2={gy} stroke="var(--color-contour)" strokeWidth="1" />
        ))}
        {/* the route ahead — dashed, unclimbed */}
        <path d={toPath(ahead)} fill="none" stroke="var(--color-hairline-strong)" strokeWidth="1.5" strokeDasharray="3 5" />
        {/* the route behind — climbed */}
        <path d={toPath(climbed)} fill="none" stroke="var(--color-route)" strokeWidth="2" strokeLinecap="round" />
        {/* camps: days with something logged */}
        {pts
          .filter((p) => p.day !== todayDay && activeDays.has(p.day) && p.day <= todayDay)
          .map((p) => (
            <circle key={p.day} cx={p.x} cy={p.y} r="3.2" fill="var(--color-pine)" />
          ))}
        {/* passed days with nothing logged */}
        {pts
          .filter((p) => p.day < todayDay && !activeDays.has(p.day))
          .map((p) => (
            <circle key={p.day} cx={p.x} cy={p.y} r="2" fill="none" stroke="var(--color-hairline-strong)" strokeWidth="1" />
          ))}
        {/* today's camp carries the flag */}
        <g transform={`translate(${todayPt.x - 4}, ${todayPt.y - 15})`} className="text-route">
          <WaypointFlag size={14} />
        </g>
        <circle cx={todayPt.x} cy={todayPt.y} r="3.4" fill="var(--color-route)" />
      </svg>
      <div className="mt-2 flex items-baseline justify-between font-mono text-[11px] tracking-[0.12em] text-ink-faint">
        <span>{monthLabel.toUpperCase()}</span>
        <span>
          <span className="text-pine-deep">{campCount} CAMPS</span> · LEG {todayDay}/{daysInMonth}
        </span>
      </div>
    </div>
  );
}
