/**
 * The week's weight drawn as a mountain cross-section with survey grammar:
 * filled slope under the line, a station tick on the baseline per day, spot
 * heights in the right margin, the goal altitude ruled in pine ink and the
 * all-time high in hairline (each dropping to a margin note when it sits
 * outside this week's window), and the current reading flagged in route
 * orange with its value. A single reading still plots: one surveyed point
 * on the baseline, annotated.
 */
export function ElevationProfile({
  weights,
  goalKg,
  athKg,
}: {
  weights: number[];
  goalKg?: number;
  athKg?: number | null;
}) {
  if (weights.length === 0) {
    return (
      <p className="text-sm text-ink-faint">No readings yet — log a weight to start the profile.</p>
    );
  }

  const W = 320;
  const H = 104;
  const padY = 16;
  const padR = 52;
  const baseY = H - 12;
  const plotW = W - padR;
  // The goal altitude is always part of the picture: the y-domain stretches
  // to include it, so the dashed goal rule and the weight line share a scale
  // and the distance between them reads truthfully.
  const min = Math.min(...weights, ...(goalKg !== undefined ? [goalKg] : []));
  const max = Math.max(...weights, ...(goalKg !== undefined ? [goalKg] : []));
  const range = max - min || 1;
  const yOf = (w: number) => padY + (baseY - 6 - padY) * (1 - (w - min) / range);
  const single = weights.length === 1;
  const coords = weights.map((w, i) => ({
    x: single ? plotW / 2 : (i / (weights.length - 1)) * plotW,
    y: single ? (padY + baseY - 6) / 2 : yOf(w),
  }));
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1].x} ${baseY} L0 ${baseY} Z`;
  const last = coords[coords.length - 1];
  const current = weights[weights.length - 1];

  // The goal is in-domain by construction; the ATH rules across only when it
  // falls inside, otherwise it becomes a margin note.
  const inDomain = (v: number) => v >= min && v <= max;
  const showGoalRule = goalKg !== undefined && !single;
  const showAthRule = athKg != null && !single && inDomain(athKg) && athKg !== max;
  const marginNotes: Array<{ text: string; color: string }> = [];
  if (athKg != null && !showAthRule && athKg > max) marginNotes.push({ text: `ATH ${athKg}`, color: 'var(--color-ink-faint)' });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Weight profile: current ${current} kilograms${athKg != null ? `, all-time high ${athKg}` : ''}${goalKg !== undefined ? `, goal ${goalKg}` : ''}`}
    >
      {[0.3, 0.6].map((f) => (
        <line key={f} x1="0" y1={padY + (baseY - padY) * f} x2={plotW} y2={padY + (baseY - padY) * f} stroke="var(--color-contour)" strokeWidth="1" />
      ))}

      {!single && (
        <>
          <path d={area} fill="var(--color-glacier)" opacity="0.16" />
          <path d={line} fill="none" stroke="var(--color-glacier-deep)" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}

      {/* all-time high ruled across when inside the window */}
      {showAthRule && (
        <g>
          <line x1="0" y1={yOf(athKg!)} x2={plotW} y2={yOf(athKg!)} stroke="var(--color-hairline-strong)" strokeWidth="1" strokeDasharray="2 4" />
          <text x={4} y={yOf(athKg!) - 3} fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-ink-faint)">
            ATH {athKg}
          </text>
        </g>
      )}

      {/* goal altitude ruled across when inside the window */}
      {showGoalRule && (
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

      {/* the current reading, flagged and valued */}
      <circle cx={last.x} cy={last.y} r="3.4" fill="var(--color-route)" />
      <text
        x={single ? last.x + 8 : Math.min(last.x + 7, plotW - 2)}
        y={last.y - 6}
        textAnchor={single ? 'start' : 'end'}
        fontSize="10"
        fontFamily="var(--font-mono)"
        fontWeight="500"
        fill="var(--color-route-deep)"
      >
        NOW {current}
      </text>

      {/* spot heights and out-of-window notes in the right margin */}
      {!single && (
        <>
          {max !== goalKg && (
            <text x={plotW + 8} y={padY + 4} fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-ink-faint)">
              {max.toFixed(1)}
            </text>
          )}
          {min !== goalKg && (
            <text x={plotW + 8} y={baseY - 4} fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-ink-faint)">
              {min.toFixed(1)}
            </text>
          )}
        </>
      )}
      {marginNotes.map((n, i) => (
        <text key={n.text} x={plotW + 8} y={padY + 18 + i * 12} fontSize="8.5" fontFamily="var(--font-mono)" fill={n.color}>
          {n.text}
        </text>
      ))}
    </svg>
  );
}
