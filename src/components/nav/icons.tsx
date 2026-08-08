type IconProps = { className?: string };

/* One-stroke cartographic set — drawn like map legend symbols: 1.5px line,
   square joins where the world is ruled, round caps where it is drawn. */
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Today — the planted waypoint flag. */
export function DashboardIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6.5 17.5v-14" />
      <path d="M6.5 4h8l-2.5 2.75L14.5 9.5h-8" />
      <path d="M3.5 17.5h6" />
    </svg>
  );
}

/** Workout — the loaded bar: plates on a barbell. */
export function WorkoutIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M1.5 10h2M16.5 10h2" />
      <path d="M6.5 10h7" />
      <rect x="3.5" y="6" width="1.8" height="8" rx="0.4" fill="currentColor" stroke="none" />
      <rect x="14.7" y="6" width="1.8" height="8" rx="0.4" fill="currentColor" stroke="none" />
      <rect x="5.8" y="7.5" width="1.4" height="5" rx="0.4" fill="currentColor" stroke="none" />
      <rect x="12.8" y="7.5" width="1.4" height="5" rx="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** To-Dos — the expedition manifest: ruled entries, one ticked. */
export function TodosIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 4.5h2.5M8.5 4.5H17" />
      <path d="M3 10h2.5M8.5 10H17" />
      <path d="M3 15.5h2.5M8.5 15.5H17" />
      <path d="M3.2 9.2l1 1.3 1.6-2" strokeWidth="1.3" />
    </svg>
  );
}

/** Habits — the fixed rope: camps linked in a line up the face. */
export function HabitsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 16.5c3.5-1 3-4.5 6-6s6-4 6-7" />
      <circle cx="4" cy="16.5" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="10" cy="10.4" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="16" cy="3.5" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Journal — the summit logbook. */
export function JournalIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="2.5" width="12" height="15" />
      <path d="M7 2.5v15" />
      <path d="M10 6.5h3.5M10 9.5h3.5" />
    </svg>
  );
}

/** Calendar — the survey grid sheet. */
export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="3.5" width="15" height="14" />
      <path d="M2.5 8h15" />
      <path d="M7.5 8v9.5M12.5 8v9.5" />
      <path d="M2.5 12.75h15" />
      <path d="M6.5 1.5v3M13.5 1.5v3" />
    </svg>
  );
}

/** Settings — the compass. */
export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M12.8 7.2l-1.6 4-4 1.6 1.6-4z" fill="currentColor" stroke="none" />
      <path d="M10 1v1.5M10 17.5V19M1 10h1.5M17.5 10H19" strokeWidth="1.2" />
    </svg>
  );
}
