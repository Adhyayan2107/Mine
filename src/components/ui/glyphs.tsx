type GlyphProps = { className?: string; size?: number };

/* Small drawn glyphs — the atlas never borrows unicode symbols for icons. */

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
});

export function XGlyph({ className, size = 16 }: GlyphProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
  );
}

export function PlusGlyph({ className, size = 16 }: GlyphProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M8 2.5v11M2.5 8h11" />
    </svg>
  );
}

export function ChevronUpGlyph({ className, size = 16 }: GlyphProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3.5 10l4.5-4.5L12.5 10" />
    </svg>
  );
}

export function ChevronDownGlyph({ className, size = 16 }: GlyphProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3.5 6l4.5 4.5L12.5 6" />
    </svg>
  );
}

export function ArrowLeftGlyph({ className, size = 16 }: GlyphProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M9.5 3.5L5 8l4.5 4.5" />
    </svg>
  );
}

export function ArrowRightGlyph({ className, size = 16 }: GlyphProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M6.5 3.5L11 8l-4.5 4.5" />
    </svg>
  );
}

/* Trend markers for the workout log — drawn, never unicode. */

export function TrendUpGlyph({ className, size = 14 }: GlyphProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M2.5 11.5l4-4 2.5 2.5 4.5-5" />
      <path d="M10 5h3.5V8.5" />
    </svg>
  );
}

export function TrendDownGlyph({ className, size = 14 }: GlyphProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M2.5 4.5l4 4L9 6l4.5 5" />
      <path d="M10 11h3.5V7.5" />
    </svg>
  );
}

export function TrendFlatGlyph({ className, size = 14 }: GlyphProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M2.5 8h11" />
      <path d="M10.5 5l3 3-3 3" />
    </svg>
  );
}
