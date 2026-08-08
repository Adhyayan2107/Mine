/**
 * The masthead every sheet of the atlas shares: condensed title on the left,
 * the mono coordinate line (sheet number · date) in the sheet corner like a
 * map margin, actions on the right, one rule underneath. Keeps every page
 * opening in the same grammar.
 */
export function SheetHeader({
  title,
  sheet,
  note,
  action,
}: {
  title: string;
  sheet: string;
  note?: string;
  action?: React.ReactNode;
}) {
  const today = new Date();
  const coord = today
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();

  return (
    <header className="mb-5 border-b border-hairline pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="sheet-title truncate text-[2rem] leading-none text-ink">{title}</h1>
          {note && <p className="mt-1.5 text-sm text-ink-muted">{note}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <p className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">
            {sheet} · {coord}
          </p>
          {action}
        </div>
      </div>
    </header>
  );
}
