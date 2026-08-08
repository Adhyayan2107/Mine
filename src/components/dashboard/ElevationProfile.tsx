/**
 * The week's weight drawn as a mountain cross-section with survey grammar:
 * filled slope under the line, a station tick on the baseline for each day,
 * spot heights in the right margin, the goal altitude ruled in pine ink
 * (or noted in the margin when it sits outside this week's window), and the
 * latest reading flagged in route orange.
 */
export function ElevationProfile({ weights, goalKg }: { weights: number[]; goalKg?: number }) {
  if (weights.length < 2) {
    return (
      <p className="text-sm text-ink-faint">
        Not enough readings for a profile yet — log weight a few more days.
      </p>
    );
  }
  const W = 320;
  const H = 96;
  const padY = 14;
  const padR = 46;
  const baseY = H - 10;
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const plotW = W - padR;
  const yOf = (w: number) => padY + (baseY - 6 - padY) * (1 - (w - min) / range);
  const coords = weights.map((w, i) => ({
    x: (i / (weights.length - 1)) * plotW,
    y: yOf(w),
  }));
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1].x} ${baseY} L0 ${baseY} Z`;
  const last = coords[coords.length - 1];
  const goalInWindow = goalKg !== undefined && goalKg >= min - range * 0.25 && goalKg <= max + range * 0.25;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Weight over the last ${weights.length} days: from ${weights[0]} to ${weights[weights.length - 1]} kilograms${goalKg !== undefined ? `, goal ${goalKg}` : ''}`}
    >
      {[0.3, 0.6].map((f) => (
        <line key={f} x1="0" y1={padY + (baseY - padY) * f} x2={plotW} y2={padY + (baseY - padY) * f} stroke="var(--color-contour)" strokeWidth="1" />
      ))}
      <path d={area} fill="var(--color-glacier)" opacity="0.16" />
      <path d={line} fill="none" stroke="var(--color-glacier-deep)" strokeWidth="1.8" strokeLinecap="round" />

      {/* goal altitude: ruled across when near this week's window */}
      {goalInWindow && (
        <g>
          <line x1="0" y1={yOf(goalKg!)} x2={plotW} y2={yOf(goalKg!)} stroke="var(--color-pine-deep)" strokeWidth="1.2" strokeDasharray="5 4" />
          <text x={plotW - 4} y={yOf(goalKg!) - 3} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-pine-deep)">
            GOAL {goalKg}
          </text>
        </g>
      )}

      {/* baseline with a station tick per day */}
      <line x1="0" y1={baseY} x2={plotW} y2={baseY} stroke="var(--color-hairline-strong)" strokeWidth="1" />
      {coords.map((c, i) => (
        <line key={i} x1={c.x} y1={baseY} x2={c.x} y2={baseY - 4} stroke="var(--color-hairline-strong)" strokeWidth="1" />
      ))}

      <circle cx={last.x} cy={last.y} r="3.2" fill="var(--color-route)" />

      {/* spot heights in the right margin */}
      <text x={plotW + 8} y={padY + 4} fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-ink-faint)">
        {max.toFixed(1)}
      </text>
      <text x={plotW + 8} y={baseY - 4} fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-ink-faint)">
        {min.toFixed(1)}
      </text>
      {!goalInWindow && goalKg !== undefined && (
        <text x={plotW + 8} y={baseY + 8} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--color-pine-deep)">
          →{goalKg}
        </text>
      )}
    </svg>
  );
}
