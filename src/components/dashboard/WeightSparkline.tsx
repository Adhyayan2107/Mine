export function WeightSparkline({ weights }: { weights: number[] }) {
  if (weights.length < 2) {
    return <p className="text-xs text-neutral-500">Not enough data yet</p>;
  }
  const width = 280;
  const height = 60;
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const points = weights
    .map((w, i) => {
      const x = (i / (weights.length - 1)) * width;
      const y = height - ((w - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="text-teal-400">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth={2} />
    </svg>
  );
}
