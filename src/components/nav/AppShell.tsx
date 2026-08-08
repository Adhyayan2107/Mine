'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardIcon,
  WorkoutIcon,
  TodosIcon,
  HabitsIcon,
  JournalIcon,
  CalendarIcon,
  SettingsIcon,
} from './icons';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Today', sheet: '01', Icon: DashboardIcon },
  { href: '/workout', label: 'Workout', sheet: '02', Icon: WorkoutIcon },
  { href: '/todos', label: 'To-Dos', sheet: '03', Icon: TodosIcon },
  { href: '/habits', label: 'Habits', sheet: '04', Icon: HabitsIcon },
  { href: '/calendar', label: 'Calendar', sheet: '05', Icon: CalendarIcon },
  { href: '/journal', label: 'Journal', sheet: '06', Icon: JournalIcon },
  { href: '/settings', label: 'Settings', sheet: '07', Icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Desktop: the map legend column. */}
      <nav className="hidden w-56 shrink-0 flex-col border-r border-hairline bg-surface md:flex">
        <div className="border-b border-hairline px-5 pb-4 pt-5">
          <p className="sheet-title text-xl leading-none text-ink">Adhyayan OS</p>
          <p className="mt-1.5 font-mono text-[10px] tracking-[0.16em] text-ink-faint">
            EXPEDITION ATLAS
          </p>
        </div>
        <div className="flex flex-1 flex-col py-3">
          {NAV_ITEMS.map(({ href, label, sheet, Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-surface-sunken text-ink'
                    : 'text-ink-muted hover:bg-surface-raised hover:text-ink'
                }`}
              >
                <Icon className={`shrink-0 ${active ? 'text-route' : 'text-ink-faint group-hover:text-ink-muted'}`} />
                <span className="flex-1">{label}</span>
                <span
                  className={`font-mono text-[10px] tracking-[0.1em] ${
                    active ? 'text-route-deep' : 'text-ink-faint'
                  }`}
                >
                  {sheet}
                </span>
              </Link>
            );
          })}
        </div>
        <p className="border-t border-hairline px-5 py-3 font-mono text-[10px] leading-relaxed tracking-[0.1em] text-ink-faint">
          ONE USER · ONE ROUTE
        </p>
      </nav>

      <main className="min-w-0 flex-1 pb-24 md:pb-0">{children}</main>

      {/* Phone: the legend bar, within thumb reach. */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-hairline bg-surface/95 backdrop-blur-md md:hidden">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium"
              style={{ minHeight: '60px' }}
            >
              {active && <span className="absolute top-0 h-0.5 w-9 bg-route" />}
              <Icon className={active ? 'text-route' : 'text-ink-faint'} />
              <span className={`tracking-wide ${active ? 'text-ink' : 'text-ink-faint'}`}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
