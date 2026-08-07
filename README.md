# Adhyayan OS — Web

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F)
![Postgres](https://img.shields.io/badge/Postgres-database-336791?logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8)

A personal dashboard, to-do list, habit tracker, and daily journal — the
installable web/PWA companion to the offline-first Flutter app of the same
name. Single user, password-gated, no ads, no accounts. Built to be used
one-handed, mid-gym, on a phone.

## Features

- **Dashboard** — one-tap quick-log cards for weight, calories, protein,
  water, and steps; a weekly weight sparkline; today's workout split;
  habit-completion and tasks-remaining at a glance. Widgets are reorderable
  and can be hidden.
- **To-Dos** — priorities, due dates, categories, one-tap complete.
- **Habits** — one-tap daily checkoff, current/longest streaks, full history.
- **Journal** — morning plan, wins, lessons, tomorrow's focus, mood & energy.
- **Settings** — edit profile & daily targets, theme preference, full JSON
  export/import, and a guarded (type-to-confirm) full data reset.
- **Push notifications** — installs to your home screen like a native app and
  sends three daily nudges: unlogged weight / tasks due (morning), water
  intake behind pace (midday), open habits / overdue tasks (evening).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in POSTGRES_URL, APP_PASSWORD, SESSION_SECRET, CRON_SECRET
npx web-push generate-vapid-keys   # paste output into NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY
npx drizzle-kit generate     # only needed after a schema change
npx drizzle-kit migrate      # applies drizzle/ migrations to POSTGRES_URL
npm run dev
```

`POSTGRES_URL` needs a real reachable Postgres — a local one works fine for
development:

```bash
brew install postgresql@16 && brew services start postgresql@16 && createdb adhyayan_os_dev
```

## Tests & linting

```bash
npm test    # query and rule logic against an in-memory Postgres (PGlite) — no external DB needed
npm run lint
```

## Deploying to Vercel

1. Create a Postgres database (Vercel Postgres/Neon integration, or any
   Postgres) and copy its connection string into `POSTGRES_URL`.
2. Run `npx drizzle-kit migrate` once, pointed at that connection string, to
   create the schema.
3. Push this repo to a git remote, import it into a new Vercel project.
4. In the Vercel project's Environment Variables, set `POSTGRES_URL`,
   `APP_PASSWORD`, `SESSION_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`,
   `VAPID_PRIVATE_KEY`.
5. Deploy. `vercel.json`'s three cron entries (morning/midday/evening push
   notification checks) register automatically.
6. On your phone, open the deployed URL in Safari, "Add to Home Screen," open
   the installed app, and enable notifications from Settings.

## Architecture

| Area | Choice |
|---|---|
| Framework | Next.js App Router — Server Components for reads, Server Actions for writes (no REST/tRPC layer, no client cache library) |
| Database | Drizzle ORM — `drizzle-orm/postgres-js` in production, `drizzle-orm/pglite` (in-memory) in tests. Query functions in `src/db/queries/` take a db instance as their first parameter, so the same function is exercised by both |
| Auth | Single shared password (`APP_PASSWORD`), HMAC-signed session cookie via the Web Crypto API (works in both the Node and Edge runtimes) — no user accounts, checked in `proxy.ts` |
| Styling | Tailwind v4 (no `tailwind.config.ts`) — dark-mode class strategy opted into via `@custom-variant dark` in `app/globals.css` |
| Push | `app/manifest.ts` + code-generated icons (`app/icon.tsx`/`app/apple-icon.tsx` via `next/og`) + a hand-written service worker (`src/lib/service-worker.js`) for installability, `web-push` + `push_subscriptions` table for delivery, three Vercel Cron routes (`app/api/cron/*`) running fixed rules from `src/lib/notification-rules.ts` |

## Project structure

```text
app/                  routes, layouts, manifest, icons, cron API routes
src/
├── db/
│   ├── schema.ts      Drizzle table definitions
│   ├── client.ts      production db (Postgres)
│   ├── test-client.ts createTestDb() via PGlite
│   └── queries/        testable query functions, one file per feature
├── actions/            'use server' wrappers around queries
├── components/         client UI, grouped by feature
└── lib/                dates, auth, push, notification rules
tests/                 mirrors src/, Vitest against PGlite
```
