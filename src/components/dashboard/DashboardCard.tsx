export function DashboardCard({
  title,
  value,
  subtitle,
  onClick,
}: {
  title: string;
  value: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className={`w-full rounded-xl border border-hairline bg-surface p-4 text-left transition-transform ${
        onClick ? 'active:scale-[0.97] active:border-hairline-strong' : ''
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{title}</p>
      <p className="mt-1.5 font-display text-2xl font-bold text-ink">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-ink-faint">{subtitle}</p>}
    </Comp>
  );
}
