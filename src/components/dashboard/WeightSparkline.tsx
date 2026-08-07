export function WeightSparkline({ weights }: { weights: number[] }) {
  if (weights.length < 2) {
    return <p className="text-xs text-ink-faint">Not enough data yet — log a few more days.</p>;
  }
  const width = 300;
  const height = 64;
  const pad = 6;
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const coords = weights.map((w, i) => ({
    x: (i / (weights.length - 1)) * width,
    y: pad + (height - pad * 2) - ((w - min) / range) * (height - pad * 2),
  }));
  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const areaPoints = `0,${height} ${linePoints} ${width},${height}`;
  const last = coords[coords.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-moss)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--color-moss)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#sparkline-fill)" />
      <polyline points={linePoints} fill="none" stroke="var(--color-moss)" strokeWidth={2} strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r={4} fill="var(--color-ember)" />
    </svg>
  );
}
