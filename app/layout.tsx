import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { db } from '@/db/client';
import { seedIfNeeded } from '@/db/seed';
import { getProfile } from '@/db/queries/profile';
import { PWARegister } from '@/components/pwa/PWARegister';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const plexSans = IBM_Plex_Sans({
  variable: '--font-plex-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Adhyayan OS',
  description: 'Personal dashboard, to-dos, habits, and journal.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Adhyayan OS',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#12100e',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await seedIfNeeded(db);
  const profile = await getProfile(db);
  const isDark = (profile?.themeMode ?? 'dark') !== 'light';

  return (
    <html
      lang="en"
      className={`${isDark ? 'dark' : ''} ${spaceGrotesk.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
