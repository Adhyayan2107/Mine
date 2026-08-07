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
    <Comp onClick={onClick} className="w-full rounded-lg bg-neutral-900 p-4 text-left">
      <p className="text-xs font-medium text-neutral-400">{title}</p>
      <p className="mt-1 text-lg font-semibold text-neutral-100">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>}
    </Comp>
  );
}
