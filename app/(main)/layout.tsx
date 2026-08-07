import { AppShell } from '@/components/nav/AppShell';

// Every page under this layout reads live, per-request data (today's log,
// today's habits, etc.) — never statically prerender it at build time.
// (Seeding itself now happens once in the root layout, which wraps this one.)
export const dynamic = 'force-dynamic';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
