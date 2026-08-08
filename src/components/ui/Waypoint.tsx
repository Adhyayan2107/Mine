/**
 * The waypoint — the atlas's unified completion mark. A pennant flag on a
 * staff, planted wherever something is done: habit checkoffs, to-dos,
 * calendar camps. Always pair its appearance with the `plant-in` animation.
 */
export function WaypointFlag({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* staff */}
      <path d="M4 1.5v11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {/* pennant */}
      <path d="M4 2h7l-2.2 2.5L11 7H4z" fill="currentColor" />
    </svg>
  );
}

/**
 * A survey plot with an optional planted flag — the checkbox of this world.
 * Square-cornered like every plate; dashed border while open, filled pine
 * with a planted flag when secured.
 */
export function PlotCheck({
  done,
  size = 'md',
  className = '',
}: {
  done: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const box = size === 'lg' ? 'h-12 w-12' : size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
  const flag = size === 'lg' ? 22 : size === 'sm' ? 12 : 15;
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center ${box} ${
        done
          ? 'border border-pine bg-pine text-surface-raised'
          : 'border border-dashed border-hairline-strong bg-surface-sunken/40 text-transparent'
      } ${className}`}
    >
      {done && (
        <>
          <WaypointFlag size={flag} className="plant-in" />
          {/* eight survey ticks burst out once as the flag lands */}
          <svg
            viewBox="0 0 40 40"
            aria-hidden="true"
            className="burst-out pointer-events-none absolute -inset-2 h-auto w-auto text-pine"
          >
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * Math.PI) / 4;
              const x1 = 20 + Math.cos(a) * 14;
              const y1 = 20 + Math.sin(a) * 14;
              const x2 = 20 + Math.cos(a) * 19;
              const y2 = 20 + Math.sin(a) * 19;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        </>
      )}
    </span>
  );
}
