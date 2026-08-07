type IconProps = { className?: string };

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function DashboardIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.2" />
      <rect x="11" y="2.5" width="6.5" height="4" rx="1.2" />
      <rect x="11" y="8.5" width="6.5" height="9" rx="1.2" />
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.2" />
    </svg>
  );
}

export function TodosIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M6.5 10l2 2 4.5-4.5" />
    </svg>
  );
}

export function HabitsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M10 2.5c1.3 2.2 4 3.9 4 7.3a4 4 0 0 1-8 0c0-.9.3-1.6.7-2.3.4.9 1.3 1.4 1.8.6-.3-1.6.4-3.4 1.5-5.6z" />
    </svg>
  );
}

export function JournalIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 4.5c1.8-.9 3.8-1 6-.3v11.6c-2.2-.7-4.2-.6-6 .3z" />
      <path d="M16 4.5c-1.8-.9-3.8-1-6-.3v11.6c2.2-.7 4.2-.6 6 .3z" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="4" width="15" height="13.5" rx="1.5" />
      <path d="M2.5 8h15" />
      <path d="M6.5 2.5v3" />
      <path d="M13.5 2.5v3" />
      <rect x="6" y="10.5" width="2" height="2" rx="0.4" fill="currentColor" stroke="none" />
      <rect x="9" y="10.5" width="2" height="2" rx="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 2.5v2.3M10 15.2v2.3M17.5 10h-2.3M4.8 10H2.5M15.3 4.7l-1.6 1.6M6.3 13.7l-1.6 1.6M15.3 15.3l-1.6-1.6M6.3 6.3L4.7 4.7" />
    </svg>
  );
}
