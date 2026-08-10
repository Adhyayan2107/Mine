import type { Metadata, Viewport } from 'next';
import { Barlow, Barlow_Condensed, Chivo_Mono } from 'next/font/google';
import './globals.css';
import { db } from '@/db/client';
import { seedIfNeeded } from '@/db/seed';
import { getProfile } from '@/db/queries/profile';
import { PWARegister } from '@/components/pwa/PWARegister';

const barlow = Barlow({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const chivoMono = Chivo_Mono({
  variable: '--font-chivo-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const dynamic = 'force-dynamic';
// Vercel's default function limit 504s while a paused/cold database resumes;
// give slow starts room to finish instead of erroring the whole page.
export const maxDuration = 60;

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
  themeColor: '#e9ede8',
  // Android: resize the layout viewport when the keyboard opens so bottom
  // sheets stay above it. iOS ignores this; SheetModal handles it there.
  interactiveWidget: 'resizes-content',
};

const DIRECTION_CONTRACT = `
impeccable:direction-contract
THESIS: The month is a mountain route — every day a leg, every metric a
station, every PR a summit. Refuses the dark card-grid fitness dashboard
(hero-metric cards, rings, one neon accent).
OWN-WORLD: Expedition atlas. Glacier-paper day chart / pine-black night
chart, faint topo contour ground, square-cornered ruled plates sharing
neatlines, overlay inks: route orange (act/today/due), pine green (secured),
glacier blue (water). Barlow Condensed altitude numerals, Barlow marginalia
caps, Chivo Mono coordinates. Completion = a planted waypoint flag.
STORY: Open the atlas, see today's camp on the route, plant waypoints for
what you log; the overview reads as one chart, not a pile of cards.
FIRST VIEWPORT: Dashboard sheet — masthead title bar with date coordinates,
month route-line strip with camp dots, stations in a ruled chart table,
weight elevation profile; primary action = tap a station to log.
FORM: Expedition route log, candidate 6 of 7, seed ce7e3fac.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md.
`;

// Seeding is idempotent and race-safe, but it still cost a write round trip
// on every request when awaited inline. Run it once per server process; on
// failure the memo resets so the next request retries.
let seedOnce: Promise<void> | null = null;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  seedOnce ??= seedIfNeeded(db).catch((err) => {
    seedOnce = null;
    throw err;
  });
  await seedOnce;
  const profile = await getProfile(db);
  const themeMode = profile?.themeMode ?? 'dark';
  const isDark = themeMode !== 'light';

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${isDark ? 'dark' : ''} ${barlow.variable} ${barlowCondensed.variable} ${chivoMono.variable}`}
    >
      <body>
        <script type="text/impeccable-contract" dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        {themeMode === 'system' && (
          // "System" ships dark from the server; this flips to the day chart
          // before first paint when the device actually prefers light.
          <script
            dangerouslySetInnerHTML={{
              __html:
                "if(!window.matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.classList.remove('dark')",
            }}
          />
        )}
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
