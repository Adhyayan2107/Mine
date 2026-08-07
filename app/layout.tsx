import type { Metadata, Viewport } from 'next';
import './globals.css';
import { db } from '@/db/client';
import { seedIfNeeded } from '@/db/seed';
import { getProfile } from '@/db/queries/profile';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Adhyayan OS',
  description: 'Personal dashboard, to-dos, habits, and journal.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f766e',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await seedIfNeeded(db);
  const profile = await getProfile(db);
  const isDark = (profile?.themeMode ?? 'dark') !== 'light';

  return (
    <html lang="en" className={isDark ? 'dark' : ''}>
      <body>{children}</body>
    </html>
  );
}
