# Adhyayan OS — Web

Personal dashboard, to-dos, habits, and journal — the web/PWA companion to the
offline-first Flutter app. Single user, password-gated, deployed on Vercel
with Postgres persistence and push notifications.

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
development (e.g. `brew install postgresql@16 && brew services start postgresql@16 && createdb adhyayan_os_dev`).

## Tests

```bash
npm test
```

Query and rule logic is tested against an in-memory Postgres (PGlite) — no
external database needed to run the suite.

## Linting

```bash
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

## Architecture notes

- Next.js App Router, Server Components for reads, Server Actions for writes
  (no REST/tRPC layer, no client cache library).
- Drizzle ORM: `drizzle-orm/postgres-js` in production, `drizzle-orm/pglite`
  (in-memory) in tests. Query functions in `src/db/queries/` take a db
  instance as their first parameter, so the same function is exercised by
  both.
- Single shared password (`APP_PASSWORD`), HMAC-signed session cookie via the
  Web Crypto API (works in both the Node and Edge runtimes) — no user
  accounts, checked in `proxy.ts`.
- Tailwind v4 (no `tailwind.config.ts`) — dark-mode class strategy is opted
  into via `@custom-variant dark` in `app/globals.css`.
- Push notifications: `app/manifest.ts` + code-generated icons
  (`app/icon.tsx`/`app/apple-icon.tsx` via `next/og`) + a hand-written service
  worker (`src/lib/service-worker.js`) for installability, `web-push` +
  `push_subscriptions` table for delivery, three Vercel Cron routes
  (`app/api/cron/*`) running fixed, non-configurable rules in
  `src/lib/notification-rules.ts`.
