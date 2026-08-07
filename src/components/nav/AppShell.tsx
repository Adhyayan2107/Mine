'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/todos', label: 'To-Dos' },
  { href: '/habits', label: 'Habits' },
  { href: '/journal', label: 'Journal' },
  { href: '/settings', label: 'Settings' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <nav className="hidden w-56 shrink-0 flex-col gap-1 border-r border-neutral-800 p-4 md:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              pathname.startsWith(item.href)
                ? 'bg-teal-900/60 text-teal-200'
                : 'text-neutral-300 hover:bg-neutral-900'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 flex border-t border-neutral-800 bg-neutral-950 md:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium ${
              pathname.startsWith(item.href) ? 'text-teal-300' : 'text-neutral-400'
            }`}
            style={{ minHeight: '56px' }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
