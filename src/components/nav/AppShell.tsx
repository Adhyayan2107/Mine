'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardIcon,
  TodosIcon,
  HabitsIcon,
  JournalIcon,
  CalendarIcon,
  SettingsIcon,
} from './icons';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Today', Icon: DashboardIcon },
  { href: '/todos', label: 'To-Dos', Icon: TodosIcon },
  { href: '/habits', label: 'Habits', Icon: HabitsIcon },
  { href: '/calendar', label: 'Calendar', Icon: CalendarIcon },
  { href: '/journal', label: 'Journal', Icon: JournalIcon },
  { href: '/settings', label: 'Settings', Icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <nav className="hidden w-60 shrink-0 flex-col gap-1 border-r border-hairline bg-surface p-4 md:flex">
        <p className="mb-4 px-3 font-display text-lg font-bold tracking-tight text-ink">Adhyayan OS</p>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-ember/12 text-ember' : 'text-ink-muted hover:bg-surface-raised hover:text-ink'
              }`}
            >
              <Icon className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-hairline bg-surface/95 backdrop-blur-md md:hidden">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium"
              style={{ minHeight: '60px' }}
            >
              {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-ember" />}
              <Icon className={active ? 'text-ember' : 'text-ink-faint'} />
              <span className={active ? 'text-ember' : 'text-ink-faint'}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
