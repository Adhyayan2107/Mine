import { db } from '@/db/client';
import { seedIfNeeded } from '@/db/seed';
import { AppShell } from '@/components/nav/AppShell';

// Every page under this layout reads live, per-request data (today's log,
// today's habits, etc.) — never statically prerender it at build time.
export const dynamic = 'force-dynamic';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  await seedIfNeeded(db);
  return <AppShell>{children}</AppShell>;
}
