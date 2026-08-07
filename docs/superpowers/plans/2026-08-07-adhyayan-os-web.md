# Adhyayan OS Web — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the web version of Adhyayan OS (Dashboard, To-Dos, Habits, Journal, Settings) as a Next.js app on Vercel with real Postgres persistence and installable-PWA push notifications, per `docs/superpowers/specs/plan.md`.

**Architecture:** Next.js App Router (TypeScript) with Server Components for reads and Server Actions for writes (no REST/tRPC layer, no client cache library). Drizzle ORM query functions take a db instance as a parameter — testable against an in-memory PGlite Postgres, mirroring the reference Flutter plan's DAO-test pattern — with thin `'use server'` action wrappers calling them against the real Vercel Postgres connection. A Vercel Cron job hits three protected routes daily that evaluate today's data and send Web Push notifications.

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS, Drizzle ORM (`drizzle-orm/vercel-postgres` in production, `drizzle-orm/pglite` in tests), Vercel Postgres, `web-push`, Vitest.

## Global Constraints

- This project lives entirely in `/Users/adhyayan/Documents/ME` as its own fresh git repo — never touch `~/Documents/Mine` (the separate, offline-first Flutter app repo).
- Single user, single shared password (`APP_PASSWORD` env var) — no user accounts, no NextAuth.
- No new dependency where a native platform feature, Next.js built-in, or a few lines of code already covers it: no chart library (hand-written SVG sparkline), no drag-and-drop library (up/down buttons for widget reorder), no SWR/React Query (Server Components + `revalidatePath`), no NextAuth (HMAC cookie via Node's `crypto`).
- Query functions accept a db instance as their first parameter and contain all query logic; `'use server'` action files are thin wrappers that call a query function with the real db and then `revalidatePath(...)`. This is what makes every mutation/query testable without a live Postgres connection.
- Every date stored in the database is a plain `YYYY-MM-DD` string (Postgres `date` column, Drizzle `mode: 'string'`) — never a `Date`/timestamp for calendar dates. This avoids timezone bugs entirely; see `src/lib/dates.ts` (Task 3).
- `HOME_TIMEZONE` in `src/lib/dates.ts` is the one constant controlling "what day is it" for seeding, dashboards, and notification cron rules — a single, easily-editable value, not a settings-screen option.
- Responsive nav: sidebar ≥768px, bottom tab bar below — the bottom tab bar is the primary, most-used surface (real-world use is mid-gym on an iPhone 16 Pro / 390pt width), so its tap targets and spacing get real attention, not an afterthought.
- To-Dos and Habits are the highest user-priority features — their tasks (9 and 10) get the most thorough tests.
- Push notifications are the most emphasized feature — hardcoded, non-configurable rules (no rules engine): morning (unlogged weight + todos due today), midday (water pace), evening (open habits + overdue todos). Task 17's tests are the most thorough in the plan.
- Test with Vitest against PGlite (in-memory Postgres, zero external services) for all query/logic modules. No React component or E2E test infrastructure — a personal single-user app doesn't earn that investment; a couple of build/smoke checks are enough.
- Use the `impeccable` Claude Code plugin (already installed) for visual-design passes — run `/impeccable init` once early, then `/impeccable polish <area>` per feature area as noted in each UI task. This plan does not prescribe visual details; that's impeccable's job.

## File Structure

```text
adhyayan-os-web/
├── package.json, tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.mjs
├── drizzle.config.ts, vercel.json, .env.example, .gitignore, vitest.config.ts
├── drizzle/                          # generated SQL migrations (committed)
├── src/
│   ├── db/
│   │   ├── schema.ts                 # all 10 tables + inferred types
│   │   ├── types.ts                  # AppDatabase union type
│   │   ├── client.ts                 # prod db (Vercel Postgres)
│   │   ├── test-client.ts            # createTestDb() via PGlite
│   │   ├── seed-data.ts              # seed constants
│   │   ├── seed.ts                   # seedIfNeeded(db)
│   │   └── queries/
│   │       ├── profile.ts
│   │       ├── daily-log.ts
│   │       ├── workout-split-days.ts
│   │       ├── categories.ts
│   │       ├── todos.ts
│   │       ├── habits.ts
│   │       ├── journal.ts
│   │       ├── dashboard-widgets.ts
│   │       └── push-subscriptions.ts
│   ├── lib/
│   │   ├── dates.ts                  # HOME_TIMEZONE, todayDateString, addDaysToDateString, dateStringDiffInDays
│   │   ├── auth.ts                   # createSessionCookieValue, isValidSessionCookie
│   │   ├── push.ts                   # sendPushToAll
│   │   ├── push-client.ts            # urlBase64ToUint8Array
│   │   ├── notification-rules.ts     # morningNotifications, middayNotifications, eveningNotifications
│   │   └── service-worker.js         # push event handler
│   ├── actions/
│   │   ├── auth.ts, profile.ts, daily-log.ts, todos.ts, categories.ts,
│   │   │   habits.ts, journal.ts, dashboard-widgets.ts, data-portability.ts,
│   │   │   push-subscription.ts      # all 'use server'
│   ├── components/
│   │   ├── nav/AppShell.tsx
│   │   ├── ui/QuickNumberModal.tsx, ConfirmTypeDialog.tsx, PushNotificationManager.tsx
│   │   ├── dashboard/DashboardCard.tsx, WeightSparkline.tsx, WidgetSettingsList.tsx
│   │   ├── todos/TodoList.tsx, TodoEditModal.tsx, CategoryManager.tsx
│   │   ├── habits/HabitList.tsx, HabitEditModal.tsx, HabitHistory.tsx
│   │   ├── journal/JournalForm.tsx, JournalHistoryList.tsx
│   │   └── settings/ProfileEditForm.tsx, ThemePicker.tsx, DataPortabilitySection.tsx
│   └── middleware.ts
├── app/
│   ├── layout.tsx, globals.css, manifest.ts, icon.tsx, apple-icon.tsx
│   ├── login/page.tsx
│   ├── (main)/layout.tsx             # AppShell wrapper, calls seedIfNeeded
│   ├── (main)/dashboard/page.tsx, (main)/dashboard/widgets/page.tsx
│   ├── (main)/todos/page.tsx, (main)/todos/categories/page.tsx
│   ├── (main)/habits/page.tsx, (main)/habits/[id]/page.tsx
│   ├── (main)/journal/page.tsx, (main)/journal/history/page.tsx
│   ├── (main)/settings/page.tsx
│   └── api/cron/{morning,midday,evening}/route.ts
└── tests/
    ├── db/{profile,daily-log,todos,habits,journal,dashboard-widgets,seed}.test.ts
    └── lib/{dates,auth,notification-rules}.test.ts
```

---

### Task 1: Project scaffold, git init, Tailwind, Vitest

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `.gitignore`, `.env.example`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Test: `tests/smoke.test.ts`

**Interfaces:**
- Produces: a runnable Next.js app skeleton every later task builds on. No app-specific types yet.

- [ ] **Step 1: Confirm Node and initialize git**

Run: `node --version` (need 20+). Then:
```bash
cd /Users/adhyayan/Documents/ME
git init
```

- [ ] **Step 2: Scaffold Next.js**

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint --use-npm
```
When prompted about the non-empty directory (it contains `docs/`), confirm to continue. This creates `app/`, `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `.gitignore`.

Note: this plan's file structure above shows a `src/` tree for `db/`, `lib/`, `actions/`, `components/`, `middleware.ts` even though we passed `--no-src-dir` (which only affects where Next.js puts `app/` — `app/` stays at the repo root, everything else goes under `src/`, which we create ourselves starting Task 2).

- [ ] **Step 3: Add production dependencies**

```bash
npm install drizzle-orm @vercel/postgres web-push
npm install -D drizzle-kit @electric-sql/pglite vitest @types/web-push dotenv
```

- [ ] **Step 4: Write `.env.example`**

```bash
# .env.example
POSTGRES_URL=postgres://user:password@host:5432/dbname
APP_PASSWORD=change-me
SESSION_SECRET=change-me-to-a-long-random-string
CRON_SECRET=change-me-to-a-long-random-string
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

- [ ] **Step 5: Write `vitest.config.ts`**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 6: Add npm scripts**

Edit `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate"
```

- [ ] **Step 7: Write the smoke test**

```ts
// tests/smoke.test.ts
import { describe, it, expect } from 'vitest';

describe('project setup', () => {
  it('basic arithmetic works (sanity check that vitest runs)', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 8: Run the test suite**

Run: `npm test`
Expected: PASS (1 test).

- [ ] **Step 9: Run the Next.js build to confirm the scaffold compiles**

Run: `npm run build`
Expected: build succeeds (default Next.js starter page).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind, Drizzle, and Vitest"
```

---

### Task 2: Drizzle schema, prod/test db clients

**Files:**
- Create: `src/db/schema.ts`, `src/db/types.ts`, `src/db/client.ts`, `src/db/test-client.ts`
- Create: `drizzle.config.ts`
- Test: `tests/db/schema.test.ts`

**Interfaces:**
- Produces: tables `profile`, `workoutSplitDays`, `dailyLogs`, `categories`, `todos`, `habits`, `habitCompletions`, `journalEntries`, `dashboardWidgetConfigs`, `pushSubscriptions`. Inferred types `Profile`/`NewProfile`, `WorkoutSplitDay`, `DailyLog`/`NewDailyLog`, `Category`/`NewCategory`, `Todo`/`NewTodo`, `Habit`/`NewHabit`, `HabitCompletion`, `JournalEntry`/`NewJournalEntry`, `DashboardWidgetConfig`, `PushSubscription`/`NewPushSubscription`. Type `AppDatabase` (union of the prod and test driver types — every query function in later tasks takes `db: AppDatabase` as its first parameter). `db` (the prod instance, from `client.ts`). `createTestDb(): Promise<AppDatabase>` (from `test-client.ts`, used by every test file in later tasks).

- [ ] **Step 1: Write the schema**

```ts
// src/db/schema.ts
import {
  pgTable,
  serial,
  text,
  real,
  integer,
  boolean,
  date,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

export const profile = pgTable('profile', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  heightCm: real('height_cm').notNull(),
  currentWeightKg: real('current_weight_kg').notNull(),
  goalWeightKg: real('goal_weight_kg').notNull(),
  goalBodyFatPercent: real('goal_body_fat_percent').notNull(),
  dailyCaloriesKcal: integer('daily_calories_kcal').notNull(),
  dailyProteinG: integer('daily_protein_g').notNull(),
  dailyWaterMl: integer('daily_water_ml').notNull(),
  dailySteps: integer('daily_steps').notNull(),
  sleepTargetHours: real('sleep_target_hours').notNull(),
  themeMode: text('theme_mode').notNull().default('dark'),
  motivationalQuoteEnabled: boolean('motivational_quote_enabled').notNull().default(false),
});

export const workoutSplitDays = pgTable('workout_split_days', {
  id: serial('id').primaryKey(),
  orderIndex: integer('order_index').notNull(),
  label: text('label').notNull(),
});

export const dailyLogs = pgTable('daily_logs', {
  id: serial('id').primaryKey(),
  date: date('date', { mode: 'string' }).notNull().unique(),
  weightKg: real('weight_kg'),
  caloriesKcal: integer('calories_kcal'),
  proteinG: integer('protein_g'),
  waterMl: integer('water_ml').notNull().default(0),
  steps: integer('steps'),
  workoutSplitDayId: integer('workout_split_day_id').references(() => workoutSplitDays.id),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  colorValue: integer('color_value').notNull(),
});

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  notes: text('notes'),
  dueDate: date('due_date', { mode: 'string' }),
  priority: text('priority').notNull().default('medium'),
  categoryId: integer('category_id').references(() => categories.id),
  isCompleted: boolean('is_completed').notNull().default(false),
  completedAt: timestamp('completed_at', { mode: 'string' }),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

export const habits = pgTable('habits', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const habitCompletions = pgTable(
  'habit_completions',
  {
    id: serial('id').primaryKey(),
    habitId: integer('habit_id').notNull().references(() => habits.id),
    date: date('date', { mode: 'string' }).notNull(),
  },
  (table) => ({
    habitDateUnique: unique().on(table.habitId, table.date),
  }),
);

export const journalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  date: date('date', { mode: 'string' }).notNull().unique(),
  morningPlan: text('morning_plan'),
  wins: text('wins'),
  lessons: text('lessons'),
  tomorrowFocus: text('tomorrow_focus'),
  mood: integer('mood'),
  energy: integer('energy'),
});

export const dashboardWidgetConfigs = pgTable('dashboard_widget_configs', {
  id: serial('id').primaryKey(),
  widgetKey: text('widget_key').notNull(),
  sortOrder: integer('sort_order').notNull(),
  isEnabled: boolean('is_enabled').notNull().default(true),
});

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: serial('id').primaryKey(),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

export type Profile = typeof profile.$inferSelect;
export type NewProfile = typeof profile.$inferInsert;
export type WorkoutSplitDay = typeof workoutSplitDays.$inferSelect;
export type NewWorkoutSplitDay = typeof workoutSplitDays.$inferInsert;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type NewDailyLog = typeof dailyLogs.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type DashboardWidgetConfig = typeof dashboardWidgetConfigs.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
```

- [ ] **Step 2: Write `drizzle.config.ts`**

```ts
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
});
```

- [ ] **Step 3: Generate the initial migration**

Run: `npx drizzle-kit generate`
Expected: creates `drizzle/0000_*.sql` plus `drizzle/meta/`. This does not need a live database — `generate` only reads the schema file.

- [ ] **Step 4: Write the `AppDatabase` type**

```ts
// src/db/types.ts
import type { VercelPgDatabase } from 'drizzle-orm/vercel-postgres';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type * as schema from './schema';

export type AppDatabase = VercelPgDatabase<typeof schema> | PgliteDatabase<typeof schema>;
```

- [ ] **Step 5: Write the production client**

```ts
// src/db/client.ts
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';
import type { AppDatabase } from './types';

export const db: AppDatabase = drizzle({ client: sql, schema });
```

- [ ] **Step 6: Write the test client**

```ts
// src/db/test-client.ts
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from './schema';
import type { AppDatabase } from './types';

export async function createTestDb(): Promise<AppDatabase> {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: './drizzle' });
  return db;
}
```

- [ ] **Step 7: Write a schema sanity test**

```ts
// tests/db/schema.test.ts
import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { profile } from '@/db/schema';

describe('schema migrations', () => {
  it('applies cleanly and every table is queryable', async () => {
    const db = await createTestDb();
    const rows = await db.select().from(profile);
    expect(rows).toEqual([]);
  });
});
```

- [ ] **Step 8: Run the test**

Run: `npm test -- tests/db/schema.test.ts`
Expected: PASS. If it fails with a missing-table error, re-run `npx drizzle-kit generate` — the migration wasn't regenerated after a schema edit.

- [ ] **Step 9: Commit**

```bash
git add src/db drizzle drizzle.config.ts tests/db/schema.test.ts
git commit -m "feat: add Drizzle schema for all 10 tables with prod and test db clients"
```

---

### Task 3: Date helpers + seed data + SeedService

**Files:**
- Create: `src/lib/dates.ts`, `src/db/seed-data.ts`, `src/db/seed.ts`
- Test: `tests/lib/dates.test.ts`, `tests/db/seed.test.ts`

**Interfaces:**
- Produces: `HOME_TIMEZONE` (string constant), `todayDateString(): string`, `addDaysToDateString(date: string, days: number): string`, `dateStringDiffInDays(a: string, b: string): number` (from `dates.ts`). `seedIfNeeded(db: AppDatabase): Promise<void>` (from `seed.ts`) — called once from the authenticated root layout in Task 5.
- Consumes: `AppDatabase`, all schema tables (Task 2).

- [ ] **Step 1: Write the date helpers**

```ts
// src/lib/dates.ts

// Single constant controlling "what day is it" for seeding, dashboards, and
// notification cron rules — edit this if you move timezones. Not a settings
// screen option; there is exactly one of you using this app.
export const HOME_TIMEZONE = 'Asia/Kolkata';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: HOME_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function todayDateString(): string {
  return dateFormatter.format(new Date());
}

export function addDaysToDateString(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function dateStringDiffInDays(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((Date.UTC(ay, am - 1, ad) - Date.UTC(by, bm - 1, bd)) / msPerDay);
}
```

- [ ] **Step 2: Write the date helper tests**

```ts
// tests/lib/dates.test.ts
import { describe, it, expect } from 'vitest';
import { todayDateString, addDaysToDateString, dateStringDiffInDays } from '@/lib/dates';

describe('todayDateString', () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(todayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('addDaysToDateString', () => {
  it('adds positive days, rolling over month boundaries', () => {
    expect(addDaysToDateString('2026-08-31', 1)).toBe('2026-09-01');
  });

  it('subtracts with negative days, rolling backward over year boundaries', () => {
    expect(addDaysToDateString('2026-01-01', -1)).toBe('2025-12-31');
  });
});

describe('dateStringDiffInDays', () => {
  it('returns the number of days between two dates, a minus b', () => {
    expect(dateStringDiffInDays('2026-08-07', '2026-08-05')).toBe(2);
    expect(dateStringDiffInDays('2026-08-05', '2026-08-07')).toBe(-2);
  });
});
```

- [ ] **Step 3: Run the date tests**

Run: `npm test -- tests/lib/dates.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 4: Write the seed data constants**

```ts
// src/db/seed-data.ts
export const SEED_PROFILE = {
  name: 'Adhyayan Gupta',
  age: 20,
  heightCm: 188.0,
  currentWeightKg: 107.0,
  goalWeightKg: 94.0,
  goalBodyFatPercent: 20.0,
  dailyCaloriesKcal: 2500,
  dailyProteinG: 160,
  dailyWaterMl: 4000,
  dailySteps: 10000,
  sleepTargetHours: 8.0,
};

export const SEED_WORKOUT_SPLIT = ['Push', 'Pull', 'Legs', 'Rest', 'Upper', 'Lower', 'Arms + Core'];

export const SEED_CATEGORIES = ['Career', 'Fitness', 'College', 'Personal', 'Shopping'];

export const SEED_HABITS = [
  'Gym',
  '10k Steps',
  'Protein Goal',
  'Calories Goal',
  'Drink 4L Water',
  'Read 30 Minutes',
  'Sleep Before Midnight',
  'Journal',
  'Apply to 5 Companies',
  'Study GTM 2 Hours',
];

export const SEED_DASHBOARD_WIDGET_ORDER = [
  'todaysWeight',
  'todaysWorkout',
  'caloriesRemaining',
  'proteinProgress',
  'waterIntake',
  'habitCompletion',
  'tasksRemaining',
  'weeklyWeightGraph',
  'workoutStreak',
  'currentGoal',
] as const;
```

- [ ] **Step 5: Write `seedIfNeeded`**

```ts
// src/db/seed.ts
import type { AppDatabase } from './types';
import { profile, workoutSplitDays, categories, habits, dashboardWidgetConfigs } from './schema';
import {
  SEED_PROFILE,
  SEED_WORKOUT_SPLIT,
  SEED_CATEGORIES,
  SEED_HABITS,
  SEED_DASHBOARD_WIDGET_ORDER,
} from './seed-data';

export async function seedIfNeeded(db: AppDatabase): Promise<void> {
  const existing = await db.select().from(profile).limit(1);
  if (existing.length > 0) return;

  await db.insert(profile).values(SEED_PROFILE);

  await db.insert(workoutSplitDays).values(
    SEED_WORKOUT_SPLIT.map((label, i) => ({ orderIndex: i, label })),
  );

  await db.insert(categories).values(
    SEED_CATEGORIES.map((name) => ({ name, colorValue: 0xff4db6ac })),
  );

  await db.insert(habits).values(
    SEED_HABITS.map((name, i) => ({ name, sortOrder: i })),
  );

  await db.insert(dashboardWidgetConfigs).values(
    SEED_DASHBOARD_WIDGET_ORDER.map((widgetKey, i) => ({ widgetKey, sortOrder: i })),
  );
}
```

- [ ] **Step 6: Write the seed test**

```ts
// tests/db/seed.test.ts
import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { seedIfNeeded } from '@/db/seed';
import { profile, workoutSplitDays, categories, habits, dashboardWidgetConfigs } from '@/db/schema';

describe('seedIfNeeded', () => {
  it('populates all defaults exactly once', async () => {
    const db = await createTestDb();

    await seedIfNeeded(db);

    const profileRows = await db.select().from(profile);
    expect(profileRows).toHaveLength(1);
    expect(profileRows[0].name).toBe('Adhyayan Gupta');
    expect(await db.select().from(workoutSplitDays)).toHaveLength(7);
    expect(await db.select().from(categories)).toHaveLength(5);
    expect(await db.select().from(habits)).toHaveLength(10);
    expect(await db.select().from(dashboardWidgetConfigs)).toHaveLength(10);

    // idempotent: second call is a no-op
    await seedIfNeeded(db);
    expect(await db.select().from(habits)).toHaveLength(10);
  });
});
```

- [ ] **Step 7: Run the seed test**

Run: `npm test -- tests/db/seed.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/dates.ts src/db/seed-data.ts src/db/seed.ts tests/lib/dates.test.ts tests/db/seed.test.ts
git commit -m "feat: add date helpers and idempotent seed service"
```

---

### Task 4: Password-gate auth (login page, session cookie, middleware)

**Files:**
- Create: `src/lib/auth.ts`, `src/actions/auth.ts`, `app/login/page.tsx`, `src/middleware.ts`
- Test: `tests/lib/auth.test.ts`

**Interfaces:**
- Produces: `createSessionCookieValue(): string`, `isValidSessionCookie(value: string | undefined): boolean` (from `auth.ts` — used by `middleware.ts` and by the `login` action). Server action `login(formData: FormData): Promise<void>` — redirects to `/dashboard` on success, back to `/login?error=1` on failure.
- Consumes: env vars `APP_PASSWORD`, `SESSION_SECRET`.

- [ ] **Step 1: Write the failing auth test**

```ts
// tests/lib/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createSessionCookieValue, isValidSessionCookie } from '@/lib/auth';

describe('session cookie signing', () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = 'test-secret';
  });

  it('a freshly created cookie value is valid', () => {
    const value = createSessionCookieValue();
    expect(isValidSessionCookie(value)).toBe(true);
  });

  it('rejects a tampered cookie value', () => {
    const value = createSessionCookieValue();
    expect(isValidSessionCookie(value.slice(0, -1) + 'x')).toBe(false);
  });

  it('rejects undefined and empty values', () => {
    expect(isValidSessionCookie(undefined)).toBe(false);
    expect(isValidSessionCookie('')).toBe(false);
  });

  it('rejects a cookie signed with a different secret', () => {
    const value = createSessionCookieValue();
    process.env.SESSION_SECRET = 'a-different-secret';
    expect(isValidSessionCookie(value)).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- tests/lib/auth.test.ts`
Expected: FAIL — `src/lib/auth.ts` does not exist yet.

- [ ] **Step 3: Write `src/lib/auth.ts`**

```ts
// src/lib/auth.ts
import { createHmac, timingSafeEqual } from 'crypto';

const SESSION_PAYLOAD = 'authenticated';

function sign(secret: string): string {
  return createHmac('sha256', secret).update(SESSION_PAYLOAD).digest('hex');
}

export function createSessionCookieValue(): string {
  return `${SESSION_PAYLOAD}.${sign(process.env.SESSION_SECRET!)}`;
}

export function isValidSessionCookie(value: string | undefined): boolean {
  if (!value) return false;
  const [payload, signature] = value.split('.');
  if (payload !== SESSION_PAYLOAD || !signature) return false;

  const expected = sign(process.env.SESSION_SECRET!);
  const actual = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (actual.length !== expectedBuf.length) return false;
  return timingSafeEqual(actual, expectedBuf);
}
```

- [ ] **Step 4: Run the test again to verify it passes**

Run: `npm test -- tests/lib/auth.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Write the login server action**

```ts
// src/actions/auth.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionCookieValue } from '@/lib/auth';

export async function login(formData: FormData): Promise<void> {
  const password = formData.get('password');
  if (password !== process.env.APP_PASSWORD) {
    redirect('/login?error=1');
  }

  const cookieStore = await cookies();
  cookieStore.set('session', createSessionCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });
  redirect('/dashboard');
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}
```

- [ ] **Step 6: Write the login page**

```tsx
// app/login/page.tsx
import { login } from '@/actions/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <form action={login} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-neutral-100">Adhyayan OS</h1>
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          required
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-4 py-3 text-neutral-100"
        />
        {error && <p className="text-sm text-red-400">Wrong password.</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-teal-600 px-4 py-3 font-medium text-white"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 7: Write the middleware**

```ts
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValidSessionCookie } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!isValidSessionCookie(session)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!login|api/cron|manifest\\.webmanifest|icon|apple-icon|_next/static|_next/image|favicon\\.ico).*)',
  ],
};
```

- [ ] **Step 8: Manual verification**

Run: `npm run dev`, visit `http://localhost:3000/dashboard` (a stub page created in Task 5) — expect a redirect to `/login`. Set `APP_PASSWORD=test` and `SESSION_SECRET=some-long-string` in `.env.local`, submit the login form with `test` — expect a redirect to `/dashboard` and the `session` cookie set (check DevTools → Application → Cookies).

- [ ] **Step 9: Commit**

```bash
git add src/lib/auth.ts src/actions/auth.ts app/login src/middleware.ts tests/lib/auth.test.ts
git commit -m "feat: add password-gate auth with signed session cookie"
```

---

### Task 5: Responsive app shell (sidebar / bottom tabs) + root layout

**Files:**
- Create: `src/components/nav/AppShell.tsx`
- Create: `app/layout.tsx`, `app/globals.css`, `app/(main)/layout.tsx`
- Create: `app/(main)/dashboard/page.tsx`, `app/(main)/todos/page.tsx`, `app/(main)/habits/page.tsx`, `app/(main)/journal/page.tsx`, `app/(main)/settings/page.tsx` (stubs — real content lands in Tasks 9–13)

**Interfaces:**
- Produces: `<AppShell>{children}</AppShell>` — renders a left sidebar (≥768px) or bottom tab bar (<768px) around its children, links to `/dashboard`, `/todos`, `/habits`, `/journal`, `/settings`.
- Consumes: `seedIfNeeded` (Task 3), `db` (Task 2).

- [ ] **Step 1: Write `app/globals.css`**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  color-scheme: dark;
}

body {
  background-color: #0a0a0a;
  color: #f5f5f5;
}
```

- [ ] **Step 2: Write the root layout**

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Adhyayan OS',
  description: 'Personal dashboard, to-dos, habits, and journal.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f766e',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Write the `AppShell` component**

Tap targets sized for one-handed, mid-gym use on an iPhone 16 Pro: 56px-tall bottom bar items, generous horizontal padding, no reliance on hover states.

```tsx
// src/components/nav/AppShell.tsx
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
```

- [ ] **Step 4: Write the authenticated layout that seeds and wraps `AppShell`**

```tsx
// app/(main)/layout.tsx
import { db } from '@/db/client';
import { seedIfNeeded } from '@/db/seed';
import { AppShell } from '@/components/nav/AppShell';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  await seedIfNeeded(db);
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Step 5: Write stub pages for the 5 sections**

```tsx
// app/(main)/dashboard/page.tsx
export default function DashboardPage() {
  return <div className="p-4">Dashboard</div>;
}
```
(repeat the same one-line stub pattern for `app/(main)/todos/page.tsx`, `app/(main)/habits/page.tsx`, `app/(main)/journal/page.tsx`, `app/(main)/settings/page.tsx`, swapping the label text to "To-Dos", "Habits", "Journal", "Settings" — each later task replaces its stub wholesale.)

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, log in, confirm all 5 nav links render their stub and the active link is highlighted. Resize the browser below 768px width and confirm the sidebar disappears and the bottom tab bar appears.

- [ ] **Step 7: Design pass**

Run `/impeccable init` once now (answer "product" — this is app UI, not a marketing page) to set up `PRODUCT.md`/`DESIGN.md`, then `/impeccable polish nav` to refine the shell's spacing, color, and active-state treatment before moving on.

- [ ] **Step 8: Commit**

```bash
git add app src/components/nav
git commit -m "feat: add responsive app shell with sidebar/bottom-tab navigation"
```

---

### Task 6: Shared UI — quick-number modal + confirm-type dialog

**Files:**
- Create: `src/components/ui/QuickNumberModal.tsx`, `src/components/ui/ConfirmTypeDialog.tsx`

**Interfaces:**
- Produces: `<QuickNumberModal open title unit initialValue? onSubmit={(value: number) => void} onClose={() => void} />` — used by Task 10's dashboard cards. `<ConfirmTypeDialog open title body confirmWord onConfirm={() => void} onCancel={() => void} />` — used by Task 13's guarded reset.

Both are controlled components (parent owns `open` state) rather than Flutter's imperative `showModalBottomSheet`/`await`-returning pattern — this is the idiomatic React equivalent and needs no extra state-management library.

- [ ] **Step 1: Write the quick-number modal**

```tsx
// src/components/ui/QuickNumberModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export function QuickNumberModal({
  open,
  title,
  unit,
  initialValue,
  onSubmit,
  onClose,
}: {
  open: boolean;
  title: string;
  unit: string;
  initialValue?: number;
  onSubmit: (value: number) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialValue?.toString() ?? '');

  useEffect(() => {
    if (open) setValue(initialValue?.toString() ?? '');
  }, [open, initialValue]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 md:items-center md:justify-center">
      <div className="w-full rounded-t-2xl bg-neutral-900 p-6 md:w-96 md:rounded-2xl">
        <h2 className="mb-4 text-lg font-semibold text-neutral-100">{title}</h2>
        <div className="mb-4 flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-lg text-neutral-100"
          />
          <span className="text-neutral-400">{unit}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-md border border-neutral-700 py-3 text-neutral-300">
            Cancel
          </button>
          <button
            onClick={() => {
              const parsed = parseFloat(value);
              if (!Number.isNaN(parsed)) onSubmit(parsed);
            }}
            className="flex-1 rounded-md bg-teal-600 py-3 font-medium text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
```

- [ ] **Step 2: Write the confirm-type dialog**

```tsx
// src/components/ui/ConfirmTypeDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export function ConfirmTypeDialog({
  open,
  title,
  body,
  confirmWord,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmWord: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-neutral-900 p-6">
        <h2 className="mb-2 text-lg font-semibold text-neutral-100">{title}</h2>
        <p className="mb-4 text-sm text-neutral-400">{body}</p>
        <p className="mb-2 text-sm text-neutral-300">
          Type <span className="font-mono text-red-400">{confirmWord}</span> to confirm.
        </p>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoFocus
          className="mb-4 w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-100"
        />
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-md border border-neutral-700 py-3 text-neutral-300">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={typed !== confirmWord}
            className="flex-1 rounded-md bg-red-600 py-3 font-medium text-white disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
```

- [ ] **Step 3: Manual verification**

These are plain controlled components with no logic beyond a string-equality check — not worth standing up React Testing Library for (see Global Constraints). Verify visually once they're wired into Dashboard (Task 10) and Settings (Task 13).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/QuickNumberModal.tsx src/components/ui/ConfirmTypeDialog.tsx
git commit -m "feat: add shared quick-number modal and confirm-type dialog"
```

---

### Task 7: Profile + Daily Log queries and actions

**Files:**
- Create: `src/db/queries/profile.ts`, `src/db/queries/daily-log.ts`, `src/db/queries/workout-split-days.ts`
- Create: `src/actions/profile.ts`, `src/actions/daily-log.ts`
- Test: `tests/db/profile.test.ts`, `tests/db/daily-log.test.ts`

**Interfaces:**
- Produces: `getProfile(db): Promise<Profile | null>`, `updateProfile(db, patch: Partial<NewProfile>): Promise<void>`. `getDailyLog(db, date: string): Promise<DailyLog | null>`, `upsertDailyLog(db, date: string, patch: Partial<NewDailyLog>): Promise<void>`, `listLastNDays(db, n: number, today: string): Promise<DailyLog[]>`. `listWorkoutSplitDays(db): Promise<WorkoutSplitDay[]>`. Server actions `updateProfileAction(patch)`, `setThemeModeAction(mode)`, `logWeightAction(kg)`, `logCaloriesAction(kcal)`, `logProteinAction(g)`, `logStepsAction(steps)`, `addWaterAction(addMl)`, `setWorkoutSplitDayAction(id)` — all used by Task 9 (Dashboard) and Task 12 (Settings).
- Consumes: `AppDatabase`, schema (Task 2), `addDaysToDateString`, `todayDateString` (Task 3).

- [ ] **Step 1: Write the profile query test**

```ts
// tests/db/profile.test.ts
import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { seedIfNeeded } from '@/db/seed';
import { getProfile, updateProfile } from '@/db/queries/profile';

describe('profile queries', () => {
  it('getProfile returns null before seeding, then the seeded row after', async () => {
    const db = await createTestDb();
    expect(await getProfile(db)).toBeNull();
    await seedIfNeeded(db);
    const profile = await getProfile(db);
    expect(profile?.name).toBe('Adhyayan Gupta');
  });

  it('updateProfile patches only the given fields', async () => {
    const db = await createTestDb();
    await seedIfNeeded(db);
    await updateProfile(db, { goalWeightKg: 92 });
    const profile = await getProfile(db);
    expect(profile?.goalWeightKg).toBe(92);
    expect(profile?.dailyCaloriesKcal).toBe(2500);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- tests/db/profile.test.ts`
Expected: FAIL — `src/db/queries/profile.ts` does not exist yet.

- [ ] **Step 3: Write `src/db/queries/profile.ts`**

```ts
// src/db/queries/profile.ts
import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { profile, type Profile, type NewProfile } from '../schema';

export async function getProfile(db: AppDatabase): Promise<Profile | null> {
  const rows = await db.select().from(profile).limit(1);
  return rows[0] ?? null;
}

export async function updateProfile(db: AppDatabase, patch: Partial<NewProfile>): Promise<void> {
  const existing = await getProfile(db);
  if (!existing) throw new Error('Profile has not been seeded yet');
  await db.update(profile).set(patch).where(eq(profile.id, existing.id));
}
```

- [ ] **Step 4: Run the profile test again**

Run: `npm test -- tests/db/profile.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the daily-log query test**

```ts
// tests/db/daily-log.test.ts
import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { getDailyLog, upsertDailyLog, listLastNDays } from '@/db/queries/daily-log';

describe('daily log queries', () => {
  it('upsertDailyLog creates then patches a single row per date', async () => {
    const db = await createTestDb();
    const day = '2026-08-04';

    await upsertDailyLog(db, day, { weightKg: 107.0 });
    let row = await getDailyLog(db, day);
    expect(row?.weightKg).toBe(107.0);
    expect(row?.caloriesKcal).toBeNull();

    await upsertDailyLog(db, day, { caloriesKcal: 2200 });
    row = await getDailyLog(db, day);
    expect(row?.weightKg).toBe(107.0);
    expect(row?.caloriesKcal).toBe(2200);
  });

  it('listLastNDays only returns rows within the window', async () => {
    const db = await createTestDb();
    await upsertDailyLog(db, '2026-07-01', { steps: 1000 });
    await upsertDailyLog(db, '2026-08-04', { steps: 9000 });

    const rows = await listLastNDays(db, 7, '2026-08-04');
    expect(rows).toHaveLength(1);
    expect(rows[0].steps).toBe(9000);
  });
});
```

- [ ] **Step 6: Write `src/db/queries/daily-log.ts` and `src/db/queries/workout-split-days.ts`**

```ts
// src/db/queries/daily-log.ts
import { eq, gte } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { dailyLogs, type DailyLog, type NewDailyLog } from '../schema';
import { addDaysToDateString } from '../../lib/dates';

export async function getDailyLog(db: AppDatabase, date: string): Promise<DailyLog | null> {
  const rows = await db.select().from(dailyLogs).where(eq(dailyLogs.date, date)).limit(1);
  return rows[0] ?? null;
}

export async function upsertDailyLog(
  db: AppDatabase,
  date: string,
  patch: Partial<NewDailyLog>,
): Promise<void> {
  const existing = await getDailyLog(db, date);
  if (existing) {
    await db.update(dailyLogs).set(patch).where(eq(dailyLogs.id, existing.id));
  } else {
    await db.insert(dailyLogs).values({ ...patch, date });
  }
}

export async function listLastNDays(db: AppDatabase, n: number, today: string): Promise<DailyLog[]> {
  const cutoff = addDaysToDateString(today, -(n - 1));
  return db.select().from(dailyLogs).where(gte(dailyLogs.date, cutoff)).orderBy(dailyLogs.date);
}
```

```ts
// src/db/queries/workout-split-days.ts
import type { AppDatabase } from '../types';
import { workoutSplitDays, type WorkoutSplitDay } from '../schema';

export async function listWorkoutSplitDays(db: AppDatabase): Promise<WorkoutSplitDay[]> {
  return db.select().from(workoutSplitDays).orderBy(workoutSplitDays.orderIndex);
}
```

- [ ] **Step 7: Run the daily-log test**

Run: `npm test -- tests/db/daily-log.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 8: Write the server actions**

```ts
// src/actions/profile.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { updateProfile } from '@/db/queries/profile';
import type { NewProfile } from '@/db/schema';

export async function updateProfileAction(patch: Partial<NewProfile>): Promise<void> {
  await updateProfile(db, patch);
  revalidatePath('/settings');
  revalidatePath('/dashboard');
}

export async function setThemeModeAction(themeMode: 'dark' | 'light' | 'system'): Promise<void> {
  await updateProfile(db, { themeMode });
  revalidatePath('/settings');
  revalidatePath('/', 'layout');
}
```

```ts
// src/actions/daily-log.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { todayDateString } from '@/lib/dates';
import { getDailyLog, upsertDailyLog } from '@/db/queries/daily-log';

export async function logWeightAction(weightKg: number): Promise<void> {
  await upsertDailyLog(db, todayDateString(), { weightKg });
  revalidatePath('/dashboard');
}

export async function logCaloriesAction(caloriesKcal: number): Promise<void> {
  await upsertDailyLog(db, todayDateString(), { caloriesKcal: Math.round(caloriesKcal) });
  revalidatePath('/dashboard');
}

export async function logProteinAction(proteinG: number): Promise<void> {
  await upsertDailyLog(db, todayDateString(), { proteinG: Math.round(proteinG) });
  revalidatePath('/dashboard');
}

export async function logStepsAction(steps: number): Promise<void> {
  await upsertDailyLog(db, todayDateString(), { steps: Math.round(steps) });
  revalidatePath('/dashboard');
}

export async function addWaterAction(addMl: number): Promise<void> {
  const today = todayDateString();
  const existing = await getDailyLog(db, today);
  await upsertDailyLog(db, today, { waterMl: (existing?.waterMl ?? 0) + addMl });
  revalidatePath('/dashboard');
}

export async function setWorkoutSplitDayAction(workoutSplitDayId: number): Promise<void> {
  await upsertDailyLog(db, todayDateString(), { workoutSplitDayId });
  revalidatePath('/dashboard');
}
```

- [ ] **Step 9: Commit**

```bash
git add src/db/queries/profile.ts src/db/queries/daily-log.ts src/db/queries/workout-split-days.ts src/actions/profile.ts src/actions/daily-log.ts tests/db/profile.test.ts tests/db/daily-log.test.ts
git commit -m "feat: add profile and daily-log queries with server actions"
```

---

### Task 8: To-Dos feature (HIGH PRIORITY — most-used feature besides Habits)

**Files:**
- Create: `src/db/queries/categories.ts`, `src/db/queries/todos.ts`
- Create: `src/actions/categories.ts`, `src/actions/todos.ts`
- Create: `src/components/todos/TodoList.tsx`, `src/components/todos/TodoEditModal.tsx`, `src/components/todos/CategoryManager.tsx`
- Modify: `app/(main)/todos/page.tsx` (replace stub)
- Create: `app/(main)/todos/categories/page.tsx`
- Test: `tests/db/todos.test.ts`

**Interfaces:**
- Produces: `listCategories(db)`, `insertCategory(db, entry)`, `deleteCategory(db, id)`. `listTodos(db)`, `listDueTodayOrOverdue(db, today)`, `insertTodo(db, entry)`, `updateTodo(db, id, patch)`, `toggleTodoComplete(db, id, isCompleted)`, `deleteTodo(db, id)`. Actions `createTodoAction`, `updateTodoAction`, `toggleTodoCompleteAction`, `deleteTodoAction`, `createCategoryAction`, `deleteCategoryAction`. `listDueTodayOrOverdue` is consumed by Task 9 (Dashboard's "Tasks Remaining" card) and Task 16 (morning/evening notification rules).
- Consumes: `AppDatabase` (Task 2), `QuickNumberModal`/`ConfirmTypeDialog` pattern conventions from Task 6 (not the components themselves — to-dos use their own modal, not a number modal).

- [ ] **Step 1: Write the failing todos query test**

```ts
// tests/db/todos.test.ts
import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { insertTodo, toggleTodoComplete, listTodos, listDueTodayOrOverdue } from '@/db/queries/todos';
import { addDaysToDateString } from '@/lib/dates';

describe('todo queries', () => {
  it('listDueTodayOrOverdue excludes completed and future todos', async () => {
    const db = await createTestDb();
    const today = '2026-08-07';

    await insertTodo(db, { title: 'Overdue task', dueDate: addDaysToDateString(today, -2) });
    const future = await insertTodo(db, { title: 'Future task', dueDate: addDaysToDateString(today, 5) });
    const completed = await insertTodo(db, { title: 'Completed today', dueDate: today });
    await toggleTodoComplete(db, completed.id, true);

    const results = await listDueTodayOrOverdue(db, today);

    expect(results.map((t) => t.title)).toContain('Overdue task');
    expect(results.some((t) => t.id === future.id)).toBe(false);
    expect(results.some((t) => t.id === completed.id)).toBe(false);
  });

  it('toggleTodoComplete sets and clears completedAt', async () => {
    const db = await createTestDb();
    const todo = await insertTodo(db, { title: 'Buy protein' });

    await toggleTodoComplete(db, todo.id, true);
    let all = await listTodos(db);
    expect(all[0].completedAt).not.toBeNull();

    await toggleTodoComplete(db, todo.id, false);
    all = await listTodos(db);
    expect(all[0].completedAt).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- tests/db/todos.test.ts`
Expected: FAIL — `src/db/queries/todos.ts` does not exist yet.

- [ ] **Step 3: Write the query modules**

```ts
// src/db/queries/categories.ts
import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { categories, type Category, type NewCategory } from '../schema';

export async function listCategories(db: AppDatabase): Promise<Category[]> {
  return db.select().from(categories);
}

export async function insertCategory(db: AppDatabase, entry: NewCategory): Promise<Category> {
  const [row] = await db.insert(categories).values(entry).returning();
  return row;
}

export async function deleteCategory(db: AppDatabase, id: number): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id));
}
```

```ts
// src/db/queries/todos.ts
import { and, eq, isNotNull, lte } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { todos, type Todo, type NewTodo } from '../schema';

export async function listTodos(db: AppDatabase): Promise<Todo[]> {
  return db.select().from(todos).orderBy(todos.dueDate);
}

export async function listDueTodayOrOverdue(db: AppDatabase, today: string): Promise<Todo[]> {
  return db
    .select()
    .from(todos)
    .where(and(eq(todos.isCompleted, false), isNotNull(todos.dueDate), lte(todos.dueDate, today)));
}

export async function insertTodo(db: AppDatabase, entry: NewTodo): Promise<Todo> {
  const [row] = await db.insert(todos).values(entry).returning();
  return row;
}

export async function updateTodo(db: AppDatabase, id: number, patch: Partial<NewTodo>): Promise<void> {
  await db.update(todos).set(patch).where(eq(todos.id, id));
}

export async function toggleTodoComplete(db: AppDatabase, id: number, isCompleted: boolean): Promise<void> {
  await db
    .update(todos)
    .set({ isCompleted, completedAt: isCompleted ? new Date().toISOString() : null })
    .where(eq(todos.id, id));
}

export async function deleteTodo(db: AppDatabase, id: number): Promise<void> {
  await db.delete(todos).where(eq(todos.id, id));
}
```

- [ ] **Step 4: Run the test again**

Run: `npm test -- tests/db/todos.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the server actions**

```ts
// src/actions/todos.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { insertTodo, updateTodo, toggleTodoComplete, deleteTodo } from '@/db/queries/todos';
import type { NewTodo } from '@/db/schema';

export async function createTodoAction(entry: NewTodo): Promise<void> {
  await insertTodo(db, entry);
  revalidatePath('/todos');
  revalidatePath('/dashboard');
}

export async function updateTodoAction(id: number, patch: Partial<NewTodo>): Promise<void> {
  await updateTodo(db, id, patch);
  revalidatePath('/todos');
  revalidatePath('/dashboard');
}

export async function toggleTodoCompleteAction(id: number, isCompleted: boolean): Promise<void> {
  await toggleTodoComplete(db, id, isCompleted);
  revalidatePath('/todos');
  revalidatePath('/dashboard');
}

export async function deleteTodoAction(id: number): Promise<void> {
  await deleteTodo(db, id);
  revalidatePath('/todos');
  revalidatePath('/dashboard');
}
```

```ts
// src/actions/categories.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { insertCategory, deleteCategory } from '@/db/queries/categories';

export async function createCategoryAction(name: string): Promise<void> {
  await insertCategory(db, { name, colorValue: 0xff4db6ac });
  revalidatePath('/todos/categories');
  revalidatePath('/todos');
}

export async function deleteCategoryAction(id: number): Promise<void> {
  await deleteCategory(db, id);
  revalidatePath('/todos/categories');
  revalidatePath('/todos');
}
```

- [ ] **Step 6: Write `TodoList` and `TodoEditModal`**

The due-date field uses the native `<input type="date">` — no date-picker library needed.

```tsx
// src/components/todos/TodoList.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toggleTodoCompleteAction, deleteTodoAction } from '@/actions/todos';
import { TodoEditModal } from './TodoEditModal';
import type { Todo, Category } from '@/db/schema';

export function TodoList({ todos, categories }: { todos: Todo[]; categories: Category[] }) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<Record<number, boolean>>({});
  const [editing, setEditing] = useState<Todo | 'new' | null>(null);
  const [, startTransition] = useTransition();

  function toggle(todo: Todo) {
    const next = !(optimistic[todo.id] ?? todo.isCompleted);
    setOptimistic((prev) => ({ ...prev, [todo.id]: next }));
    startTransition(async () => {
      await toggleTodoCompleteAction(todo.id, next);
      router.refresh();
    });
  }

  function remove(id: number) {
    startTransition(async () => {
      await deleteTodoAction(id);
      router.refresh();
    });
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">To-Dos</h1>
        <Link href="/todos/categories" className="text-sm text-teal-400">
          Categories
        </Link>
      </div>

      <ul className="space-y-2">
        {todos.map((todo) => {
          const isCompleted = optimistic[todo.id] ?? todo.isCompleted;
          return (
            <li key={todo.id} className="flex items-center gap-3 rounded-lg bg-neutral-900 p-3">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={() => toggle(todo)}
                className="h-6 w-6 shrink-0"
              />
              <button onClick={() => setEditing(todo)} className="flex-1 text-left">
                <span className={isCompleted ? 'text-neutral-500 line-through' : 'text-neutral-100'}>
                  {todo.title}
                </span>
              </button>
              <button onClick={() => remove(todo.id)} aria-label="Delete" className="p-2 text-neutral-500">
                ✕
              </button>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => setEditing('new')}
        className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-2xl text-white shadow-lg md:bottom-4"
        aria-label="Add to-do"
      >
        +
      </button>

      <TodoEditModal
        open={editing !== null}
        existing={editing === 'new' ? null : editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </div>
  );
}
```

```tsx
// src/components/todos/TodoEditModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createTodoAction, updateTodoAction } from '@/actions/todos';
import type { Todo, Category } from '@/db/schema';

export function TodoEditModal({
  open,
  existing,
  categories,
  onClose,
  onSaved,
}: {
  open: boolean;
  existing: Todo | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(existing?.title ?? '');
    setPriority((existing?.priority as 'low' | 'medium' | 'high') ?? 'medium');
    setCategoryId(existing?.categoryId ?? null);
    setDueDate(existing?.dueDate ?? '');
  }, [open, existing]);

  if (!open) return null;

  async function save() {
    const patch = { title, priority, categoryId, dueDate: dueDate || null };
    if (existing) {
      await updateTodoAction(existing.id, patch);
    } else {
      await createTodoAction(patch);
    }
    onSaved();
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 md:items-center md:justify-center">
      <div className="w-full space-y-3 rounded-t-2xl bg-neutral-900 p-6 md:w-96 md:rounded-2xl">
        <h2 className="text-lg font-semibold text-neutral-100">{existing ? 'Edit To-Do' : 'New To-Do'}</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          autoFocus
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-100"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-100"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={categoryId ?? ''}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-100"
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-100"
        />
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 rounded-md border border-neutral-700 py-3 text-neutral-300">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!title}
            className="flex-1 rounded-md bg-teal-600 py-3 font-medium text-white disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
```

- [ ] **Step 7: Write `CategoryManager` and the categories page**

```tsx
// src/components/todos/CategoryManager.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategoryAction, deleteCategoryAction } from '@/actions/categories';
import type { Category } from '@/db/schema';

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState('');

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Categories</h1>
      <div className="mb-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category"
          className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-100"
        />
        <button
          onClick={async () => {
            if (!name) return;
            await createCategoryAction(name);
            setName('');
            router.refresh();
          }}
          className="rounded-md bg-teal-600 px-4 py-3 font-medium text-white"
        >
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-lg bg-neutral-900 p-3">
            <span>{c.name}</span>
            <button
              onClick={async () => {
                await deleteCategoryAction(c.id);
                router.refresh();
              }}
              className="p-2 text-neutral-500"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

```tsx
// app/(main)/todos/categories/page.tsx
import { db } from '@/db/client';
import { listCategories } from '@/db/queries/categories';
import { CategoryManager } from '@/components/todos/CategoryManager';

export default async function CategoriesPage() {
  const categories = await listCategories(db);
  return (
    <div className="p-4">
      <CategoryManager categories={categories} />
    </div>
  );
}
```

- [ ] **Step 8: Replace the todos page stub**

```tsx
// app/(main)/todos/page.tsx
import { db } from '@/db/client';
import { listTodos } from '@/db/queries/todos';
import { listCategories } from '@/db/queries/categories';
import { TodoList } from '@/components/todos/TodoList';

export default async function TodosPage() {
  const [todos, categories] = await Promise.all([listTodos(db), listCategories(db)]);
  return <TodoList todos={todos} categories={categories} />;
}
```

- [ ] **Step 9: Manual verification**

Run: `npm run dev`, go to `/todos`. Add a todo with a due date of today, confirm it appears; check it off and confirm the strike-through applies immediately (before the network round-trip finishes); delete it; add/delete a category from `/todos/categories`.

- [ ] **Step 10: Design pass**

`/impeccable polish todos` — this is the single most-used screen; worth a dedicated pass on list density, checkbox size/feel, and the FAB placement relative to the bottom tab bar.

- [ ] **Step 11: Commit**

```bash
git add src/db/queries/categories.ts src/db/queries/todos.ts src/actions/categories.ts src/actions/todos.ts src/components/todos app/\(main\)/todos tests/db/todos.test.ts
git commit -m "feat: implement To-Dos list, edit modal, and category management"
```

---

### Task 9: Habits feature (HIGH PRIORITY — most-used feature besides To-Dos)

**Files:**
- Create: `src/db/queries/habits.ts`
- Create: `src/actions/habits.ts`
- Create: `src/components/habits/HabitList.tsx`, `src/components/habits/HabitEditModal.tsx`, `src/components/habits/HabitDetail.tsx`
- Modify: `app/(main)/habits/page.tsx` (replace stub)
- Create: `app/(main)/habits/[id]/page.tsx`
- Test: `tests/db/habits.test.ts`

**Interfaces:**
- Produces: `listActiveHabits(db)`, `insertHabit(db, entry)`, `updateHabit(db, id, patch)`, `archiveHabit(db, id)`, `listCompletionsForHabit(db, habitId)`, `listCompletedHabitIdsForDate(db, date): Promise<Set<number>>`, `toggleHabitToday(db, habitId, date)`, `currentStreak(db, habitId, today): Promise<number>`, `longestStreak(db, habitId): Promise<number>`. Actions `createHabitAction`, `updateHabitAction`, `archiveHabitAction`, `toggleHabitTodayAction(habitId)`. `listActiveHabits`/`listCompletedHabitIdsForDate` are consumed by Task 10 (Dashboard's habit-completion card) and Task 16 (evening notification rule).
- Consumes: `addDaysToDateString`, `dateStringDiffInDays`, `todayDateString` (Task 3).

- [ ] **Step 1: Write the failing habits query test**

```ts
// tests/db/habits.test.ts
import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import {
  insertHabit,
  toggleHabitToday,
  listCompletedHabitIdsForDate,
  currentStreak,
  longestStreak,
} from '@/db/queries/habits';
import { addDaysToDateString } from '@/lib/dates';

describe('habit queries', () => {
  it('toggleHabitToday completes then undoes', async () => {
    const db = await createTestDb();
    const habit = await insertHabit(db, { name: 'Gym' });
    const today = '2026-08-07';

    await toggleHabitToday(db, habit.id, today);
    let completed = await listCompletedHabitIdsForDate(db, today);
    expect(completed.has(habit.id)).toBe(true);

    await toggleHabitToday(db, habit.id, today);
    completed = await listCompletedHabitIdsForDate(db, today);
    expect(completed.has(habit.id)).toBe(false);
  });

  it('currentStreak counts consecutive days ending today, longestStreak finds the longest run', async () => {
    const db = await createTestDb();
    const habit = await insertHabit(db, { name: 'Journal' });
    const today = '2026-08-07';

    await toggleHabitToday(db, habit.id, today);
    await toggleHabitToday(db, habit.id, addDaysToDateString(today, -1));
    await toggleHabitToday(db, habit.id, addDaysToDateString(today, -2));
    await toggleHabitToday(db, habit.id, addDaysToDateString(today, -5)); // gap — must not extend the streak

    expect(await currentStreak(db, habit.id, today)).toBe(3);
    expect(await longestStreak(db, habit.id)).toBe(3);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- tests/db/habits.test.ts`
Expected: FAIL — `src/db/queries/habits.ts` does not exist yet.

- [ ] **Step 3: Write `src/db/queries/habits.ts`**

```ts
// src/db/queries/habits.ts
import { and, eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { habits, habitCompletions, type Habit, type NewHabit, type HabitCompletion } from '../schema';
import { addDaysToDateString, dateStringDiffInDays } from '../../lib/dates';

export async function listActiveHabits(db: AppDatabase): Promise<Habit[]> {
  return db.select().from(habits).where(eq(habits.isActive, true)).orderBy(habits.sortOrder);
}

export async function insertHabit(db: AppDatabase, entry: NewHabit): Promise<Habit> {
  const [row] = await db.insert(habits).values(entry).returning();
  return row;
}

export async function updateHabit(db: AppDatabase, id: number, patch: Partial<NewHabit>): Promise<void> {
  await db.update(habits).set(patch).where(eq(habits.id, id));
}

export async function archiveHabit(db: AppDatabase, id: number): Promise<void> {
  await db.update(habits).set({ isActive: false }).where(eq(habits.id, id));
}

export async function listCompletionsForHabit(db: AppDatabase, habitId: number): Promise<HabitCompletion[]> {
  return db.select().from(habitCompletions).where(eq(habitCompletions.habitId, habitId));
}

export async function listCompletedHabitIdsForDate(db: AppDatabase, date: string): Promise<Set<number>> {
  const rows = await db.select().from(habitCompletions).where(eq(habitCompletions.date, date));
  return new Set(rows.map((r) => r.habitId));
}

/** One-tap checkoff: inserts if today's row is absent, deletes it if present. */
export async function toggleHabitToday(db: AppDatabase, habitId: number, date: string): Promise<void> {
  const existing = await db
    .select()
    .from(habitCompletions)
    .where(and(eq(habitCompletions.habitId, habitId), eq(habitCompletions.date, date)))
    .limit(1);
  if (existing.length > 0) {
    await db.delete(habitCompletions).where(eq(habitCompletions.id, existing[0].id));
  } else {
    await db.insert(habitCompletions).values({ habitId, date });
  }
}

export async function currentStreak(db: AppDatabase, habitId: number, today: string): Promise<number> {
  const rows = await db.select().from(habitCompletions).where(eq(habitCompletions.habitId, habitId));
  const dates = new Set(rows.map((r) => r.date));
  let streak = 0;
  let cursor = today;
  while (dates.has(cursor)) {
    streak++;
    cursor = addDaysToDateString(cursor, -1);
  }
  return streak;
}

export async function longestStreak(db: AppDatabase, habitId: number): Promise<number> {
  const rows = await db
    .select()
    .from(habitCompletions)
    .where(eq(habitCompletions.habitId, habitId))
    .orderBy(habitCompletions.date);
  if (rows.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < rows.length; i++) {
    const gap = dateStringDiffInDays(rows[i].date, rows[i - 1].date);
    current = gap === 1 ? current + 1 : 1;
    if (current > longest) longest = current;
  }
  return longest;
}
```

- [ ] **Step 4: Run the test again**

Run: `npm test -- tests/db/habits.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the server actions**

```ts
// src/actions/habits.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { insertHabit, updateHabit, archiveHabit, toggleHabitToday } from '@/db/queries/habits';
import { todayDateString } from '@/lib/dates';
import type { NewHabit } from '@/db/schema';

export async function createHabitAction(entry: NewHabit): Promise<void> {
  await insertHabit(db, entry);
  revalidatePath('/habits');
}

export async function updateHabitAction(id: number, patch: Partial<NewHabit>): Promise<void> {
  await updateHabit(db, id, patch);
  revalidatePath('/habits');
  revalidatePath(`/habits/${id}`);
}

export async function archiveHabitAction(id: number): Promise<void> {
  await archiveHabit(db, id);
  revalidatePath('/habits');
}

export async function toggleHabitTodayAction(habitId: number): Promise<void> {
  await toggleHabitToday(db, habitId, todayDateString());
  revalidatePath('/habits');
  revalidatePath(`/habits/${habitId}`);
  revalidatePath('/dashboard');
}
```

- [ ] **Step 6: Write `HabitList` (one-tap checkoff) and `HabitEditModal`**

```tsx
// src/components/habits/HabitList.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toggleHabitTodayAction } from '@/actions/habits';
import { HabitEditModal } from './HabitEditModal';
import type { Habit } from '@/db/schema';

export function HabitList({ habits, completedIds }: { habits: Habit[]; completedIds: number[] }) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<Record<number, boolean>>({});
  const [creating, setCreating] = useState(false);
  const [, startTransition] = useTransition();
  const completedSet = new Set(completedIds);

  function toggle(habit: Habit) {
    const next = !(optimistic[habit.id] ?? completedSet.has(habit.id));
    setOptimistic((prev) => ({ ...prev, [habit.id]: next }));
    startTransition(async () => {
      await toggleHabitTodayAction(habit.id);
      router.refresh();
    });
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-semibold">Habits</h1>
      <ul className="space-y-2">
        {habits.map((habit) => {
          const isDone = optimistic[habit.id] ?? completedSet.has(habit.id);
          return (
            <li key={habit.id} className="flex items-center gap-3 rounded-lg bg-neutral-900 p-3">
              <button
                onClick={() => toggle(habit)}
                aria-label={isDone ? 'Mark not done' : 'Mark done'}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-lg ${
                  isDone
                    ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                    : 'border-neutral-600 text-transparent'
                }`}
              >
                ✓
              </button>
              <Link href={`/habits/${habit.id}`} className="flex-1 text-neutral-100">
                {habit.name}
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => setCreating(true)}
        className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-2xl text-white shadow-lg md:bottom-4"
        aria-label="Add habit"
      >
        +
      </button>

      <HabitEditModal
        open={creating}
        existing={null}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          router.refresh();
        }}
      />
    </div>
  );
}
```

```tsx
// src/components/habits/HabitEditModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createHabitAction, updateHabitAction } from '@/actions/habits';
import type { Habit } from '@/db/schema';

export function HabitEditModal({
  open,
  existing,
  onClose,
  onSaved,
}: {
  open: boolean;
  existing: Habit | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) setName(existing?.name ?? '');
  }, [open, existing]);

  if (!open) return null;

  async function save() {
    if (existing) {
      await updateHabitAction(existing.id, { name });
    } else {
      await createHabitAction({ name });
    }
    onSaved();
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 md:items-center md:justify-center">
      <div className="w-full space-y-3 rounded-t-2xl bg-neutral-900 p-6 md:w-96 md:rounded-2xl">
        <h2 className="text-lg font-semibold text-neutral-100">{existing ? 'Edit Habit' : 'New Habit'}</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Habit name"
          autoFocus
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-neutral-100"
        />
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 rounded-md border border-neutral-700 py-3 text-neutral-300">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!name}
            className="flex-1 rounded-md bg-teal-600 py-3 font-medium text-white disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
```

- [ ] **Step 7: Write `HabitDetail` and its page**

```tsx
// src/components/habits/HabitDetail.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { archiveHabitAction } from '@/actions/habits';
import { HabitEditModal } from './HabitEditModal';
import type { Habit } from '@/db/schema';

export function HabitDetail({
  habit,
  completionDates,
  currentStreak,
  longestStreak,
}: {
  habit: Habit;
  completionDates: string[];
  currentStreak: number;
  longestStreak: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const sortedDates = [...completionDates].sort().reverse();

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{habit.name}</h1>
        <div className="flex gap-3 text-sm">
          <button onClick={() => setEditing(true)} className="text-teal-400">
            Edit
          </button>
          <button
            onClick={async () => {
              await archiveHabitAction(habit.id);
              router.push('/habits');
            }}
            className="text-red-400"
          >
            Archive
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="rounded-lg bg-neutral-900 p-4">
          <p className="text-2xl font-semibold text-teal-300">{currentStreak}</p>
          <p className="text-xs text-neutral-400">Current streak</p>
        </div>
        <div className="rounded-lg bg-neutral-900 p-4">
          <p className="text-2xl font-semibold text-neutral-100">{longestStreak}</p>
          <p className="text-xs text-neutral-400">Longest streak</p>
        </div>
      </div>

      <h2 className="mb-2 text-sm font-medium text-neutral-400">History</h2>
      <ul className="space-y-1">
        {sortedDates.map((date) => (
          <li key={date} className="rounded bg-neutral-900 px-3 py-2 text-sm text-neutral-300">
            {date}
          </li>
        ))}
      </ul>

      <HabitEditModal
        open={editing}
        existing={habit}
        onClose={() => setEditing(false)}
        onSaved={() => {
          setEditing(false);
          router.refresh();
        }}
      />
    </div>
  );
}
```

```tsx
// app/(main)/habits/[id]/page.tsx
import { notFound } from 'next/navigation';
import { db } from '@/db/client';
import { listActiveHabits, listCompletionsForHabit, currentStreak, longestStreak } from '@/db/queries/habits';
import { todayDateString } from '@/lib/dates';
import { HabitDetail } from '@/components/habits/HabitDetail';

export default async function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const habitId = Number(id);
  const habits = await listActiveHabits(db);
  const habit = habits.find((h) => h.id === habitId);
  if (!habit) notFound();

  const today = todayDateString();
  const [completions, current, longest] = await Promise.all([
    listCompletionsForHabit(db, habitId),
    currentStreak(db, habitId, today),
    longestStreak(db, habitId),
  ]);

  return (
    <HabitDetail
      habit={habit}
      completionDates={completions.map((c) => c.date)}
      currentStreak={current}
      longestStreak={longest}
    />
  );
}
```

- [ ] **Step 8: Replace the habits page stub**

```tsx
// app/(main)/habits/page.tsx
import { db } from '@/db/client';
import { listActiveHabits, listCompletedHabitIdsForDate } from '@/db/queries/habits';
import { todayDateString } from '@/lib/dates';
import { HabitList } from '@/components/habits/HabitList';

export default async function HabitsPage() {
  const today = todayDateString();
  const [habits, completedIds] = await Promise.all([
    listActiveHabits(db),
    listCompletedHabitIdsForDate(db, today),
  ]);
  return <HabitList habits={habits} completedIds={[...completedIds]} />;
}
```

- [ ] **Step 9: Manual verification**

Run: `npm run dev`, go to `/habits`. Tap a habit's checkoff circle once and confirm it fills in immediately (one tap, matching the "two taps or less" bar from the original Flutter plan). Open a habit's detail page, confirm current/longest streak numbers and history list render. Archive a habit and confirm it disappears from the list.

- [ ] **Step 10: Design pass**

`/impeccable polish habits` — the checkoff circle is the single most-tapped element in the whole app; worth dedicated attention to its size, contrast, and tap feedback.

- [ ] **Step 11: Commit**

```bash
git add src/db/queries/habits.ts src/actions/habits.ts src/components/habits app/\(main\)/habits tests/db/habits.test.ts
git commit -m "feat: implement Habits list with one-tap checkoff, streaks, and detail view"
```

---

### Task 10: Dashboard feature

**Files:**
- Modify: `src/db/queries/daily-log.ts` (add `workoutStreak`)
- Create: `src/db/queries/dashboard-widgets.ts`
- Create: `src/actions/dashboard-widgets.ts`
- Create: `src/components/dashboard/DashboardCard.tsx`, `WeightSparkline.tsx`, `WidgetSettingsList.tsx`, `DashboardView.tsx`
- Modify: `app/(main)/dashboard/page.tsx` (replace stub)
- Create: `app/(main)/dashboard/widgets/page.tsx`
- Test: `tests/db/dashboard-widgets.test.ts`

**Interfaces:**
- Produces: `workoutStreak(db, today): Promise<number>`. `listDashboardWidgets(db)`, `setDashboardWidgetEnabled(db, id, isEnabled)`, `moveDashboardWidget(db, id, direction: 'up' | 'down')`. Actions `setDashboardWidgetEnabledAction`, `moveDashboardWidgetAction`.
- Consumes: `getProfile` (Task 7), `getDailyLog`/`listLastNDays` (Task 7), `listWorkoutSplitDays` (Task 7), `listActiveHabits`/`listCompletedHabitIdsForDate` (Task 9), `listDueTodayOrOverdue` (Task 8), `logWeightAction`/`logCaloriesAction`/`logProteinAction`/`logStepsAction`/`addWaterAction`/`setWorkoutSplitDayAction` (Task 7), `QuickNumberModal` (Task 6).

- [ ] **Step 1: Add `workoutStreak` to `src/db/queries/daily-log.ts`**

Sequential per-day lookups are simplest and correct at this data volume (one profile's worth of history).

```ts
// append to src/db/queries/daily-log.ts
// ponytail: one query per day walking backward from today; fine at personal-app
// scale (streak rarely exceeds a few hundred days) — batch into a single range
// query with a gap-scan if this ever needs to handle years of unbroken data.
export async function workoutStreak(db: AppDatabase, today: string): Promise<number> {
  let streak = 0;
  let cursor = today;
  while (true) {
    const log = await getDailyLog(db, cursor);
    if (!log?.workoutSplitDayId) break;
    streak++;
    cursor = addDaysToDateString(cursor, -1);
  }
  return streak;
}
```

- [ ] **Step 2: Write the failing dashboard-widgets test**

```ts
// tests/db/dashboard-widgets.test.ts
import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { seedIfNeeded } from '@/db/seed';
import {
  listDashboardWidgets,
  setDashboardWidgetEnabled,
  moveDashboardWidget,
} from '@/db/queries/dashboard-widgets';

describe('dashboard widget queries', () => {
  it('setDashboardWidgetEnabled toggles a single widget', async () => {
    const db = await createTestDb();
    await seedIfNeeded(db);
    const [first] = await listDashboardWidgets(db);

    await setDashboardWidgetEnabled(db, first.id, false);
    const after = await listDashboardWidgets(db);
    expect(after.find((w) => w.id === first.id)?.isEnabled).toBe(false);
  });

  it('moveDashboardWidget swaps sortOrder with its neighbor', async () => {
    const db = await createTestDb();
    await seedIfNeeded(db);
    const [first, second] = await listDashboardWidgets(db);

    await moveDashboardWidget(db, second.id, 'up');

    const after = await listDashboardWidgets(db);
    expect(after[0].id).toBe(second.id);
    expect(after[1].id).toBe(first.id);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test -- tests/db/dashboard-widgets.test.ts`
Expected: FAIL — `src/db/queries/dashboard-widgets.ts` does not exist yet.

- [ ] **Step 4: Write `src/db/queries/dashboard-widgets.ts`**

```ts
// src/db/queries/dashboard-widgets.ts
import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { dashboardWidgetConfigs, type DashboardWidgetConfig } from '../schema';

export async function listDashboardWidgets(db: AppDatabase): Promise<DashboardWidgetConfig[]> {
  return db.select().from(dashboardWidgetConfigs).orderBy(dashboardWidgetConfigs.sortOrder);
}

export async function setDashboardWidgetEnabled(
  db: AppDatabase,
  id: number,
  isEnabled: boolean,
): Promise<void> {
  await db.update(dashboardWidgetConfigs).set({ isEnabled }).where(eq(dashboardWidgetConfigs.id, id));
}

export async function moveDashboardWidget(
  db: AppDatabase,
  id: number,
  direction: 'up' | 'down',
): Promise<void> {
  const all = await listDashboardWidgets(db);
  const index = all.findIndex((w) => w.id === id);
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= all.length) return;

  const a = all[index];
  const b = all[swapIndex];
  await db
    .update(dashboardWidgetConfigs)
    .set({ sortOrder: b.sortOrder })
    .where(eq(dashboardWidgetConfigs.id, a.id));
  await db
    .update(dashboardWidgetConfigs)
    .set({ sortOrder: a.sortOrder })
    .where(eq(dashboardWidgetConfigs.id, b.id));
}
```

- [ ] **Step 5: Run the test again**

Run: `npm test -- tests/db/dashboard-widgets.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Write the server actions**

```ts
// src/actions/dashboard-widgets.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { setDashboardWidgetEnabled, moveDashboardWidget } from '@/db/queries/dashboard-widgets';

export async function setDashboardWidgetEnabledAction(id: number, isEnabled: boolean): Promise<void> {
  await setDashboardWidgetEnabled(db, id, isEnabled);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/widgets');
}

export async function moveDashboardWidgetAction(id: number, direction: 'up' | 'down'): Promise<void> {
  await moveDashboardWidget(db, id, direction);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/widgets');
}
```

- [ ] **Step 7: Write `DashboardCard` and `WeightSparkline`**

No chart library — a hand-written inline SVG polyline is all a 7-point sparkline needs.

```tsx
// src/components/dashboard/DashboardCard.tsx
export function DashboardCard({
  title,
  value,
  subtitle,
  onClick,
}: {
  title: string;
  value: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp onClick={onClick} className="w-full rounded-lg bg-neutral-900 p-4 text-left">
      <p className="text-xs font-medium text-neutral-400">{title}</p>
      <p className="mt-1 text-lg font-semibold text-neutral-100">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>}
    </Comp>
  );
}
```

```tsx
// src/components/dashboard/WeightSparkline.tsx
export function WeightSparkline({ weights }: { weights: number[] }) {
  if (weights.length < 2) {
    return <p className="text-xs text-neutral-500">Not enough data yet</p>;
  }
  const width = 280;
  const height = 60;
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const points = weights
    .map((w, i) => {
      const x = (i / (weights.length - 1)) * width;
      const y = height - ((w - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="text-teal-400">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth={2} />
    </svg>
  );
}
```

- [ ] **Step 8: Write `WidgetSettingsList` (up/down buttons, no drag-and-drop library)**

```tsx
// src/components/dashboard/WidgetSettingsList.tsx
'use client';

import { useRouter } from 'next/navigation';
import { setDashboardWidgetEnabledAction, moveDashboardWidgetAction } from '@/actions/dashboard-widgets';
import type { DashboardWidgetConfig } from '@/db/schema';

const WIDGET_LABELS: Record<string, string> = {
  todaysWeight: "Today's Weight",
  todaysWorkout: "Today's Workout",
  caloriesRemaining: 'Calories Remaining',
  proteinProgress: 'Protein Progress',
  waterIntake: 'Water Intake',
  habitCompletion: 'Habit Completion',
  tasksRemaining: 'Tasks Remaining',
  weeklyWeightGraph: 'Weekly Weight Graph',
  workoutStreak: 'Workout Streak',
  currentGoal: 'Current Goal',
};

export function WidgetSettingsList({ widgets }: { widgets: DashboardWidgetConfig[] }) {
  const router = useRouter();

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-semibold">Dashboard Widgets</h1>
      <ul className="space-y-2">
        {widgets.map((widget, i) => (
          <li key={widget.id} className="flex items-center gap-3 rounded-lg bg-neutral-900 p-3">
            <div className="flex flex-col">
              <button
                disabled={i === 0}
                onClick={async () => {
                  await moveDashboardWidgetAction(widget.id, 'up');
                  router.refresh();
                }}
                aria-label="Move up"
                className="px-1 text-neutral-400 disabled:opacity-30"
              >
                ▲
              </button>
              <button
                disabled={i === widgets.length - 1}
                onClick={async () => {
                  await moveDashboardWidgetAction(widget.id, 'down');
                  router.refresh();
                }}
                aria-label="Move down"
                className="px-1 text-neutral-400 disabled:opacity-30"
              >
                ▼
              </button>
            </div>
            <span className="flex-1 text-neutral-100">
              {WIDGET_LABELS[widget.widgetKey] ?? widget.widgetKey}
            </span>
            <input
              type="checkbox"
              checked={widget.isEnabled}
              onChange={async (e) => {
                await setDashboardWidgetEnabledAction(widget.id, e.target.checked);
                router.refresh();
              }}
              className="h-6 w-6"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 9: Write `DashboardView`**

```tsx
// src/components/dashboard/DashboardView.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  logWeightAction,
  logCaloriesAction,
  logProteinAction,
  logStepsAction,
  addWaterAction,
  setWorkoutSplitDayAction,
} from '@/actions/daily-log';
import { QuickNumberModal } from '@/components/ui/QuickNumberModal';
import { DashboardCard } from './DashboardCard';
import { WeightSparkline } from './WeightSparkline';
import type { Profile, DailyLog, WorkoutSplitDay } from '@/db/schema';

type QuickField = 'weight' | 'calories' | 'protein' | 'steps' | null;

export function DashboardView({
  profile,
  todayLog,
  splitDays,
  enabledWidgetKeys,
  habitRatio,
  tasksRemaining,
  workoutStreak,
  weeklyWeights,
}: {
  profile: Profile;
  todayLog: DailyLog | null;
  splitDays: WorkoutSplitDay[];
  enabledWidgetKeys: Set<string>;
  habitRatio: number;
  tasksRemaining: number;
  workoutStreak: number;
  weeklyWeights: number[];
}) {
  const router = useRouter();
  const [quickField, setQuickField] = useState<QuickField>(null);
  const show = (key: string) => enabledWidgetKeys.has(key);
  const currentSplit = splitDays.find((d) => d.id === todayLog?.workoutSplitDayId);

  async function submit(value: number) {
    if (quickField === 'weight') await logWeightAction(value);
    if (quickField === 'calories') await logCaloriesAction(value);
    if (quickField === 'protein') await logProteinAction(value);
    if (quickField === 'steps') await logStepsAction(value);
    setQuickField(null);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
      <div className="flex items-center justify-between sm:col-span-2">
        <h1 className="text-xl font-semibold">Hello, {profile.name.split(' ')[0]}</h1>
        <Link href="/dashboard/widgets" className="text-sm text-teal-400">
          Widgets
        </Link>
      </div>

      {show('todaysWeight') && (
        <DashboardCard
          title="Today's Weight"
          value={todayLog?.weightKg ? `${todayLog.weightKg} kg` : 'Log weight'}
          onClick={() => setQuickField('weight')}
        />
      )}

      {show('caloriesRemaining') && (
        <DashboardCard
          title="Calories Remaining"
          value={`${profile.dailyCaloriesKcal - (todayLog?.caloriesKcal ?? 0)} kcal`}
          onClick={() => setQuickField('calories')}
        />
      )}

      {show('proteinProgress') && (
        <DashboardCard
          title="Protein Progress"
          value={`${todayLog?.proteinG ?? 0} / ${profile.dailyProteinG} g`}
          onClick={() => setQuickField('protein')}
        />
      )}

      {show('waterIntake') && (
        <DashboardCard
          title="Water Intake"
          value={`${todayLog?.waterMl ?? 0} / ${profile.dailyWaterMl} ml`}
          subtitle="Tap to add 250ml"
          onClick={async () => {
            await addWaterAction(250);
            router.refresh();
          }}
        />
      )}

      {/* No seeded widget key for Steps in the original plan — always shown, matching Flutter parity. */}
      <DashboardCard
        title="Steps"
        value={todayLog?.steps ? `${todayLog.steps}` : 'Log steps'}
        onClick={() => setQuickField('steps')}
      />

      {show('todaysWorkout') && (
        <div className="rounded-lg bg-neutral-900 p-4">
          <p className="text-xs font-medium text-neutral-400">Today&apos;s Workout</p>
          <select
            value={todayLog?.workoutSplitDayId ?? ''}
            onChange={async (e) => {
              await setWorkoutSplitDayAction(Number(e.target.value));
              router.refresh();
            }}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 py-2 text-neutral-100"
          >
            <option value="" disabled>
              {currentSplit?.label ?? 'Pick split day'}
            </option>
            {splitDays.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {show('habitCompletion') && (
        <DashboardCard title="Habit Completion" value={`${Math.round(habitRatio * 100)}%`} />
      )}

      {show('tasksRemaining') && <DashboardCard title="Tasks Remaining" value={`${tasksRemaining}`} />}

      {show('weeklyWeightGraph') && (
        <div className="rounded-lg bg-neutral-900 p-4 sm:col-span-2">
          <p className="mb-2 text-xs font-medium text-neutral-400">Weekly Weight</p>
          <WeightSparkline weights={weeklyWeights} />
        </div>
      )}

      {show('workoutStreak') && <DashboardCard title="Workout Streak" value={`${workoutStreak} days`} />}

      {show('currentGoal') && (
        <DashboardCard
          title="Current Goal"
          value={`${profile.goalWeightKg} kg @ ${profile.goalBodyFatPercent}%`}
        />
      )}

      <QuickNumberModal
        open={quickField !== null}
        title={
          quickField === 'weight'
            ? 'Weight (kg)'
            : quickField === 'calories'
              ? 'Calories eaten'
              : quickField === 'protein'
                ? 'Protein (g)'
                : 'Steps'
        }
        unit={
          quickField === 'weight' ? 'kg' : quickField === 'steps' ? 'steps' : quickField === 'protein' ? 'g' : 'kcal'
        }
        onSubmit={submit}
        onClose={() => setQuickField(null)}
      />
    </div>
  );
}
```

- [ ] **Step 10: Replace the dashboard page stub and add the widgets page**

```tsx
// app/(main)/dashboard/page.tsx
import { db } from '@/db/client';
import { getProfile } from '@/db/queries/profile';
import { getDailyLog, listLastNDays, workoutStreak as getWorkoutStreak } from '@/db/queries/daily-log';
import { listWorkoutSplitDays } from '@/db/queries/workout-split-days';
import { listActiveHabits, listCompletedHabitIdsForDate } from '@/db/queries/habits';
import { listDueTodayOrOverdue } from '@/db/queries/todos';
import { listDashboardWidgets } from '@/db/queries/dashboard-widgets';
import { todayDateString } from '@/lib/dates';
import { DashboardView } from '@/components/dashboard/DashboardView';

export default async function DashboardPage() {
  const today = todayDateString();
  const [profile, todayLog, splitDays, activeHabits, completedIds, tasksDue, weekLogs, streak, widgets] =
    await Promise.all([
      getProfile(db),
      getDailyLog(db, today),
      listWorkoutSplitDays(db),
      listActiveHabits(db),
      listCompletedHabitIdsForDate(db, today),
      listDueTodayOrOverdue(db, today),
      listLastNDays(db, 7, today),
      getWorkoutStreak(db, today),
      listDashboardWidgets(db),
    ]);

  if (!profile) return <div className="p-4">Setting things up…</div>;

  const enabledWidgetKeys = new Set(widgets.filter((w) => w.isEnabled).map((w) => w.widgetKey));
  const habitRatio = activeHabits.length === 0 ? 0 : completedIds.size / activeHabits.length;
  const weeklyWeights = weekLogs.map((l) => l.weightKg).filter((w): w is number => w !== null);

  return (
    <DashboardView
      profile={profile}
      todayLog={todayLog}
      splitDays={splitDays}
      enabledWidgetKeys={enabledWidgetKeys}
      habitRatio={habitRatio}
      tasksRemaining={tasksDue.length}
      workoutStreak={streak}
      weeklyWeights={weeklyWeights}
    />
  );
}
```

```tsx
// app/(main)/dashboard/widgets/page.tsx
import { db } from '@/db/client';
import { listDashboardWidgets } from '@/db/queries/dashboard-widgets';
import { WidgetSettingsList } from '@/components/dashboard/WidgetSettingsList';

export default async function DashboardWidgetsPage() {
  const widgets = await listDashboardWidgets(db);
  return <WidgetSettingsList widgets={widgets} />;
}
```

- [ ] **Step 11: Manual verification**

Run: `npm run dev`, go to `/dashboard`. Tap the weight card, enter a value, confirm it updates. Tap water to add 250ml twice, confirm the total. Pick a workout split day. Go to `/dashboard/widgets`, disable "Tasks Remaining", return to `/dashboard`, confirm the card disappears; move a widget up/down and confirm the dashboard order follows.

- [ ] **Step 12: Design pass**

`/impeccable polish dashboard` — this is the landing screen; worth a pass on card grid rhythm, the sparkline's visual weight, and the widgets-link discoverability.

- [ ] **Step 13: Commit**

```bash
git add src/db/queries/daily-log.ts src/db/queries/dashboard-widgets.ts src/actions/dashboard-widgets.ts src/components/dashboard app/\(main\)/dashboard tests/db/dashboard-widgets.test.ts
git commit -m "feat: implement Dashboard with quick-log cards and widget settings"
```

---

### Task 11: Journal feature

**Files:**
- Create: `src/db/queries/journal.ts`
- Create: `src/actions/journal.ts`
- Create: `src/components/journal/JournalForm.tsx`, `JournalHistoryList.tsx`
- Modify: `app/(main)/journal/page.tsx` (replace stub)
- Create: `app/(main)/journal/history/page.tsx`
- Test: `tests/db/journal.test.ts`

**Interfaces:**
- Produces: `getJournalEntry(db, date)`, `upsertJournalEntry(db, date, patch)`, `listJournalEntriesDescending(db)`. Action `saveJournalEntryAction(patch)`.
- Consumes: `todayDateString` (Task 3).

- [ ] **Step 1: Write the failing journal query test**

```ts
// tests/db/journal.test.ts
import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { getJournalEntry, upsertJournalEntry, listJournalEntriesDescending } from '@/db/queries/journal';

describe('journal queries', () => {
  it('morning and evening fields persist independently on the same date', async () => {
    const db = await createTestDb();
    const today = '2026-08-07';

    await upsertJournalEntry(db, today, { morningPlan: 'Ship the web plan' });
    await upsertJournalEntry(db, today, { wins: 'Finished the schema', mood: 4, energy: 3 });

    const entry = await getJournalEntry(db, today);
    expect(entry?.morningPlan).toBe('Ship the web plan');
    expect(entry?.wins).toBe('Finished the schema');
    expect(entry?.mood).toBe(4);
  });

  it('listJournalEntriesDescending orders newest first', async () => {
    const db = await createTestDb();
    await upsertJournalEntry(db, '2026-08-01', { wins: 'Old entry' });
    await upsertJournalEntry(db, '2026-08-07', { wins: 'New entry' });

    const entries = await listJournalEntriesDescending(db);
    expect(entries[0].wins).toBe('New entry');
    expect(entries[1].wins).toBe('Old entry');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- tests/db/journal.test.ts`
Expected: FAIL — `src/db/queries/journal.ts` does not exist yet.

- [ ] **Step 3: Write `src/db/queries/journal.ts`**

```ts
// src/db/queries/journal.ts
import { eq, desc } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { journalEntries, type JournalEntry, type NewJournalEntry } from '../schema';

export async function getJournalEntry(db: AppDatabase, date: string): Promise<JournalEntry | null> {
  const rows = await db.select().from(journalEntries).where(eq(journalEntries.date, date)).limit(1);
  return rows[0] ?? null;
}

export async function upsertJournalEntry(
  db: AppDatabase,
  date: string,
  patch: Partial<NewJournalEntry>,
): Promise<void> {
  const existing = await getJournalEntry(db, date);
  if (existing) {
    await db.update(journalEntries).set(patch).where(eq(journalEntries.id, existing.id));
  } else {
    await db.insert(journalEntries).values({ ...patch, date });
  }
}

export async function listJournalEntriesDescending(db: AppDatabase): Promise<JournalEntry[]> {
  return db.select().from(journalEntries).orderBy(desc(journalEntries.date));
}
```

- [ ] **Step 4: Run the test again**

Run: `npm test -- tests/db/journal.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the server action**

```ts
// src/actions/journal.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { upsertJournalEntry } from '@/db/queries/journal';
import { todayDateString } from '@/lib/dates';
import type { NewJournalEntry } from '@/db/schema';

export async function saveJournalEntryAction(patch: Partial<NewJournalEntry>): Promise<void> {
  await upsertJournalEntry(db, todayDateString(), patch);
  revalidatePath('/journal');
  revalidatePath('/journal/history');
}
```

- [ ] **Step 6: Write `JournalForm` and `JournalHistoryList`**

```tsx
// src/components/journal/JournalForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveJournalEntryAction } from '@/actions/journal';
import type { JournalEntry } from '@/db/schema';

export function JournalForm({ entry }: { entry: JournalEntry | null }) {
  const router = useRouter();
  const [morningPlan, setMorningPlan] = useState(entry?.morningPlan ?? '');
  const [wins, setWins] = useState(entry?.wins ?? '');
  const [lessons, setLessons] = useState(entry?.lessons ?? '');
  const [tomorrowFocus, setTomorrowFocus] = useState(entry?.tomorrowFocus ?? '');
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null);
  const [energy, setEnergy] = useState<number | null>(entry?.energy ?? null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await saveJournalEntryAction({ morningPlan, wins, lessons, tomorrowFocus, mood, energy });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Today&apos;s Journal</h1>
        <Link href="/journal/history" className="text-sm text-teal-400">
          History
        </Link>
      </div>

      <Field label="Morning plan" value={morningPlan} onChange={setMorningPlan} />
      <Field label="Wins" value={wins} onChange={setWins} />
      <Field label="Lessons" value={lessons} onChange={setLessons} />
      <Field label="Tomorrow's focus" value={tomorrowFocus} onChange={setTomorrowFocus} />

      <RatingField label="Mood" value={mood} onChange={setMood} />
      <RatingField label="Energy" value={energy} onChange={setEnergy} />

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-md bg-teal-600 py-3 font-medium text-white disabled:opacity-40"
      >
        Save
      </button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-400">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
      />
    </div>
  );
}

function RatingField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-400">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`h-10 w-10 rounded-full border-2 ${
              value === n
                ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                : 'border-neutral-700 text-neutral-400'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
```

```tsx
// src/components/journal/JournalHistoryList.tsx
import type { JournalEntry } from '@/db/schema';

export function JournalHistoryList({ entries }: { entries: JournalEntry[] }) {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-semibold">Journal History</h1>
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-lg bg-neutral-900 p-4">
            <p className="mb-1 text-sm font-medium text-teal-300">{entry.date}</p>
            {entry.wins && <p className="text-sm text-neutral-300">Wins: {entry.wins}</p>}
            {entry.lessons && <p className="text-sm text-neutral-300">Lessons: {entry.lessons}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 7: Replace the journal page stub and add the history page**

```tsx
// app/(main)/journal/page.tsx
import { db } from '@/db/client';
import { getJournalEntry } from '@/db/queries/journal';
import { todayDateString } from '@/lib/dates';
import { JournalForm } from '@/components/journal/JournalForm';

export default async function JournalPage() {
  const entry = await getJournalEntry(db, todayDateString());
  return <JournalForm entry={entry} />;
}
```

```tsx
// app/(main)/journal/history/page.tsx
import { db } from '@/db/client';
import { listJournalEntriesDescending } from '@/db/queries/journal';
import { JournalHistoryList } from '@/components/journal/JournalHistoryList';

export default async function JournalHistoryPage() {
  const entries = await listJournalEntriesDescending(db);
  return <JournalHistoryList entries={entries} />;
}
```

- [ ] **Step 8: Manual verification**

Run: `npm run dev`, go to `/journal`. Save a morning plan, refresh, confirm it persists. Save wins/mood without touching the morning plan, confirm the morning plan is untouched. Visit `/journal/history` and confirm the entry appears.

- [ ] **Step 9: Commit**

```bash
git add src/db/queries/journal.ts src/actions/journal.ts src/components/journal app/\(main\)/journal tests/db/journal.test.ts
git commit -m "feat: implement Journal today-entry form and history list"
```

---

### Task 12: Settings — profile/targets edit + theme preference

**Files:**
- Modify: `app/layout.tsx` (apply theme class to `<html>`, seed on first request)
- Modify: `app/(main)/layout.tsx` (drop the now-redundant `seedIfNeeded` call — root layout covers it)
- Modify: `tailwind.config.ts` (`darkMode: 'class'`)
- Create: `src/components/settings/ProfileEditForm.tsx`, `ThemePicker.tsx`
- Modify: `app/(main)/settings/page.tsx` (replace stub)

**Interfaces:**
- Consumes: `getProfile` (Task 7), `updateProfileAction`/`setThemeModeAction` (Task 7).

This task wires `profile.themeMode` into a real `<html class="dark">` toggle at the root — but it does **not** retrofit light-mode Tailwind variants (`dark:bg-...`) across every component built in Tasks 5–11. Doing that properly means adding a light counterpart to every hardcoded `bg-neutral-900`/`text-neutral-100` class in the whole app — a lot of surface area for a preference nobody using this app has asked for; the whole product is explicitly dark-mode-first, mirroring the Flutter app's own priority order. This task ships the honest subset: the preference persists correctly and the `<html>` class responds to it, so a future pass can retrofit per-component light variants without re-plumbing anything. Picking "Light" today will not yet change any component's colors — flag this in the PR/commit rather than silently shipping a picker that looks like it works and doesn't.

- [ ] **Step 1: Enable Tailwind's class-based dark mode**

```ts
// tailwind.config.ts — add darkMode at the top level
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  // ...keep the rest of the generated config (content, theme, plugins) unchanged
};

export default config;
```

- [ ] **Step 2: Move seeding + theme-class resolution into the root layout**

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { db } from '@/db/client';
import { seedIfNeeded } from '@/db/seed';
import { getProfile } from '@/db/queries/profile';

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
```

```tsx
// app/(main)/layout.tsx — drop the seedIfNeeded call, root layout already covers it
import { AppShell } from '@/components/nav/AppShell';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Step 3: Write `ProfileEditForm`**

```tsx
// src/components/settings/ProfileEditForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfileAction } from '@/actions/profile';
import type { Profile } from '@/db/schema';

export function ProfileEditForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [goalWeightKg, setGoalWeightKg] = useState(profile.goalWeightKg.toString());
  const [dailyCaloriesKcal, setDailyCaloriesKcal] = useState(profile.dailyCaloriesKcal.toString());
  const [dailyProteinG, setDailyProteinG] = useState(profile.dailyProteinG.toString());
  const [dailyWaterMl, setDailyWaterMl] = useState(profile.dailyWaterMl.toString());
  const [dailySteps, setDailySteps] = useState(profile.dailySteps.toString());

  async function save() {
    await updateProfileAction({
      goalWeightKg: parseFloat(goalWeightKg),
      dailyCaloriesKcal: parseInt(dailyCaloriesKcal, 10),
      dailyProteinG: parseInt(dailyProteinG, 10),
      dailyWaterMl: parseInt(dailyWaterMl, 10),
      dailySteps: parseInt(dailySteps, 10),
    });
    router.refresh();
  }

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-xl font-semibold">Profile & Targets</h1>
      <LabeledInput label="Goal weight (kg)" value={goalWeightKg} onChange={setGoalWeightKg} />
      <LabeledInput label="Daily calories (kcal)" value={dailyCaloriesKcal} onChange={setDailyCaloriesKcal} />
      <LabeledInput label="Daily protein (g)" value={dailyProteinG} onChange={setDailyProteinG} />
      <LabeledInput label="Daily water (ml)" value={dailyWaterMl} onChange={setDailyWaterMl} />
      <LabeledInput label="Daily steps" value={dailySteps} onChange={setDailySteps} />
      <button onClick={save} className="w-full rounded-md bg-teal-600 py-3 font-medium text-white">
        Save
      </button>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
      />
    </div>
  );
}
```

- [ ] **Step 4: Write `ThemePicker`**

```tsx
// src/components/settings/ThemePicker.tsx
'use client';

import { useRouter } from 'next/navigation';
import { setThemeModeAction } from '@/actions/profile';

export function ThemePicker({ themeMode }: { themeMode: string }) {
  const router = useRouter();
  return (
    <div className="p-4">
      <label className="mb-2 block text-xs font-medium text-neutral-400">Theme</label>
      <select
        value={themeMode}
        onChange={async (e) => {
          await setThemeModeAction(e.target.value as 'dark' | 'light' | 'system');
          router.refresh();
        }}
        className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
      >
        <option value="dark">Dark</option>
        <option value="light">Light</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}
```

- [ ] **Step 5: Replace the settings page stub**

```tsx
// app/(main)/settings/page.tsx
import { db } from '@/db/client';
import { getProfile } from '@/db/queries/profile';
import { ProfileEditForm } from '@/components/settings/ProfileEditForm';
import { ThemePicker } from '@/components/settings/ThemePicker';

export default async function SettingsPage() {
  const profile = await getProfile(db);
  if (!profile) return <div className="p-4">Setting things up…</div>;

  return (
    <div>
      <ProfileEditForm profile={profile} />
      <ThemePicker themeMode={profile.themeMode} />
    </div>
  );
}
```

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, go to `/settings`. Change the goal weight, refresh `/dashboard`, confirm the "Current Goal" card reflects it. Switch theme to "Light", confirm the choice persists across a reload (the `<html>` element's class changes even though component colors don't yet — expected per this task's scope note).

- [ ] **Step 7: Commit**

```bash
git add app/layout.tsx "app/(main)/layout.tsx" tailwind.config.ts src/components/settings "app/(main)/settings"
git commit -m "feat: implement Settings profile/targets edit and theme preference persistence"
```

---

### Task 13: Data portability — export / import / guarded reset

**Files:**
- Create: `src/db/queries/data-portability.ts`
- Create: `src/actions/data-portability.ts`
- Create: `src/components/settings/DataPortabilitySection.tsx`
- Modify: `app/(main)/settings/page.tsx` (add the new section)
- Test: `tests/db/data-portability.test.ts`

**Interfaces:**
- Produces: `EXPORT_SCHEMA_VERSION` (number), `exportAllTables(db): Promise<object>`, `importAllTables(db, raw: unknown): Promise<void>` (throws on schema-version mismatch), `resetAllData(db): Promise<void>`. Actions `exportDataAction(): Promise<string>`, `importDataAction(json: string): Promise<void>`, `resetAllDataAction(): Promise<void>`.
- Consumes: `seedIfNeeded` (Task 3), `ConfirmTypeDialog` (Task 6), every table from `schema.ts` (Task 2).
- JSON shape mirrors the Flutter plan's export exactly: one key per table (`profile`, `workoutSplitDays`, `dailyLogs`, `categories`, `todos`, `habits`, `journalEntries`, `dashboardWidgetConfigs`) plus `schemaVersion`. `habitCompletions` (daily check-off history) is intentionally not exported/restored — same documented Phase 1 limitation as the Flutter plan; habit *definitions* round-trip, daily completion history does not.

- [ ] **Step 1: Write the failing data-portability test**

```ts
// tests/db/data-portability.test.ts
import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { seedIfNeeded } from '@/db/seed';
import { insertHabit } from '@/db/queries/habits';
import { getProfile } from '@/db/queries/profile';
import { exportAllTables, importAllTables, resetAllData } from '@/db/queries/data-portability';

describe('data portability', () => {
  it('export then import round-trips the profile into a fresh database', async () => {
    const sourceDb = await createTestDb();
    await seedIfNeeded(sourceDb);
    const exported = await exportAllTables(sourceDb);

    const targetDb = await createTestDb();
    await importAllTables(targetDb, exported);

    const profile = await getProfile(targetDb);
    expect(profile?.name).toBe('Adhyayan Gupta');
  });

  it('importAllTables rejects an unsupported schema version', async () => {
    const db = await createTestDb();
    await expect(importAllTables(db, { schemaVersion: 999 })).rejects.toThrow(/Unsupported/);
  });

  it('resetAllData wipes custom data and reseeds defaults', async () => {
    const db = await createTestDb();
    await seedIfNeeded(db);
    await insertHabit(db, { name: 'Custom habit' });

    await resetAllData(db);

    const profile = await getProfile(db);
    expect(profile?.name).toBe('Adhyayan Gupta');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- tests/db/data-portability.test.ts`
Expected: FAIL — `src/db/queries/data-portability.ts` does not exist yet.

- [ ] **Step 3: Write `src/db/queries/data-portability.ts`**

The `tx as AppDatabase` cast below is safe: a Drizzle transaction handle supports the exact same query-builder methods as the outer db — the cast only works around TypeScript not automatically unifying the two driver-specific transaction generics, not around any real behavior difference.

```ts
// src/db/queries/data-portability.ts
import {
  profile,
  workoutSplitDays,
  dailyLogs,
  categories,
  todos,
  habits,
  habitCompletions,
  journalEntries,
  dashboardWidgetConfigs,
} from '../schema';
import type { AppDatabase } from '../types';
import { seedIfNeeded } from '../seed';

export const EXPORT_SCHEMA_VERSION = 1;

export async function exportAllTables(db: AppDatabase) {
  const [profileRows, splitRows, logRows, categoryRows, todoRows, habitRows, journalRows, widgetRows] =
    await Promise.all([
      db.select().from(profile),
      db.select().from(workoutSplitDays),
      db.select().from(dailyLogs),
      db.select().from(categories),
      db.select().from(todos),
      db.select().from(habits),
      db.select().from(journalEntries),
      db.select().from(dashboardWidgetConfigs),
    ]);

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    profile: profileRows[0] ?? null,
    workoutSplitDays: splitRows,
    dailyLogs: logRows,
    categories: categoryRows,
    todos: todoRows,
    habits: habitRows,
    journalEntries: journalRows,
    dashboardWidgetConfigs: widgetRows,
  };
}

async function clearAllTables(db: AppDatabase): Promise<void> {
  await db.delete(dashboardWidgetConfigs);
  await db.delete(journalEntries);
  await db.delete(habitCompletions);
  await db.delete(habits);
  await db.delete(todos);
  await db.delete(categories);
  await db.delete(dailyLogs);
  await db.delete(workoutSplitDays);
  await db.delete(profile);
}

export async function importAllTables(db: AppDatabase, raw: any): Promise<void> {
  if (raw.schemaVersion !== EXPORT_SCHEMA_VERSION) {
    throw new Error(`Unsupported export schema version: ${raw.schemaVersion}`);
  }

  await db.transaction(async (tx) => {
    const txDb = tx as AppDatabase;
    await clearAllTables(txDb);

    if (raw.profile) await txDb.insert(profile).values(raw.profile);
    if (raw.workoutSplitDays?.length) await txDb.insert(workoutSplitDays).values(raw.workoutSplitDays);
    if (raw.dailyLogs?.length) await txDb.insert(dailyLogs).values(raw.dailyLogs);
    if (raw.categories?.length) await txDb.insert(categories).values(raw.categories);
    if (raw.todos?.length) await txDb.insert(todos).values(raw.todos);
    if (raw.habits?.length) await txDb.insert(habits).values(raw.habits);
    if (raw.journalEntries?.length) await txDb.insert(journalEntries).values(raw.journalEntries);
    if (raw.dashboardWidgetConfigs?.length) {
      await txDb.insert(dashboardWidgetConfigs).values(raw.dashboardWidgetConfigs);
    }
  });
}

export async function resetAllData(db: AppDatabase): Promise<void> {
  await db.transaction(async (tx) => {
    await clearAllTables(tx as AppDatabase);
  });
  await seedIfNeeded(db);
}
```

- [ ] **Step 4: Run the test again**

Run: `npm test -- tests/db/data-portability.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the server actions**

```ts
// src/actions/data-portability.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { exportAllTables, importAllTables, resetAllData } from '@/db/queries/data-portability';

export async function exportDataAction(): Promise<string> {
  const data = await exportAllTables(db);
  return JSON.stringify(data, null, 2);
}

export async function importDataAction(json: string): Promise<void> {
  await importAllTables(db, JSON.parse(json));
  revalidatePath('/', 'layout');
}

export async function resetAllDataAction(): Promise<void> {
  await resetAllData(db);
  revalidatePath('/', 'layout');
}
```

- [ ] **Step 6: Write `DataPortabilitySection`**

Export downloads a JSON file via a client-side `Blob` (the Flutter app wrote to disk and used `share_plus`; a website's equivalent of "give me the file" is a browser download, not a filesystem write).

```tsx
// src/components/settings/DataPortabilitySection.tsx
'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { exportDataAction, importDataAction, resetAllDataAction } from '@/actions/data-portability';
import { ConfirmTypeDialog } from '@/components/ui/ConfirmTypeDialog';

export function DataPortabilitySection() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetOpen, setResetOpen] = useState(false);

  async function handleExport() {
    const json = await exportDataAction();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adhyayan_os_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(file: File) {
    const text = await file.text();
    await importDataAction(text);
    router.refresh();
  }

  return (
    <div className="space-y-2 p-4">
      <button
        onClick={handleExport}
        className="w-full rounded-md border border-neutral-700 px-4 py-3 text-left text-neutral-100"
      >
        Export Data
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full rounded-md border border-neutral-700 px-4 py-3 text-left text-neutral-100"
      >
        Import Data
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportFile(file);
        }}
      />

      <button
        onClick={() => setResetOpen(true)}
        className="w-full rounded-md border border-red-800 px-4 py-3 text-left text-red-400"
      >
        Reset All Data
      </button>

      <ConfirmTypeDialog
        open={resetOpen}
        title="Reset all data"
        body="This permanently deletes every to-do, habit, journal entry, and log, then restores the original defaults."
        confirmWord="DELETE"
        onCancel={() => setResetOpen(false)}
        onConfirm={async () => {
          await resetAllDataAction();
          setResetOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
```

- [ ] **Step 7: Wire it into the Settings page**

```tsx
// app/(main)/settings/page.tsx
import { db } from '@/db/client';
import { getProfile } from '@/db/queries/profile';
import { ProfileEditForm } from '@/components/settings/ProfileEditForm';
import { ThemePicker } from '@/components/settings/ThemePicker';
import { DataPortabilitySection } from '@/components/settings/DataPortabilitySection';

export default async function SettingsPage() {
  const profile = await getProfile(db);
  if (!profile) return <div className="p-4">Setting things up…</div>;

  return (
    <div>
      <ProfileEditForm profile={profile} />
      <ThemePicker themeMode={profile.themeMode} />
      <DataPortabilitySection />
    </div>
  );
}
```

- [ ] **Step 8: Manual verification**

Run: `npm run dev`, go to `/settings`. Export data, confirm a `.json` file downloads with all table keys present. Add a test to-do, then import the earlier export back, confirm the test to-do is gone (import replaces, not merges). Try Reset — confirm the delete button stays disabled until you type `DELETE` exactly, then confirm it wipes back to seed defaults.

- [ ] **Step 9: Commit**

```bash
git add src/db/queries/data-portability.ts src/actions/data-portability.ts src/components/settings/DataPortabilitySection.tsx "app/(main)/settings/page.tsx" tests/db/data-portability.test.ts
git commit -m "feat: add JSON export/import and guarded data reset"
```

---

### Task 14: PWA shell — manifest, icons, installability

**Files:**
- Create: `app/manifest.ts`, `app/icon.tsx`, `app/apple-icon.tsx`
- Create: `src/lib/service-worker.js`, `src/components/pwa/PWARegister.tsx`
- Modify: `app/layout.tsx` (mount `PWARegister`, add `appleWebApp` metadata)

**Interfaces:**
- Produces: an installable web app (Chrome "Install app" prompt; iOS "Add to Home Screen" behaving like a real app — no browser chrome). Registers `src/lib/service-worker.js`, which Task 15 extends with push-event handling.
- No new dependency: icons are generated by Next.js's built-in `next/og` `ImageResponse`, not a binary-asset pipeline.

- [ ] **Step 1: Write the manifest**

```ts
// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Adhyayan OS',
    short_name: 'Adhyayan OS',
    description: 'Personal dashboard, to-dos, habits, and journal.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0f766e',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
```

- [ ] **Step 2: Write the generated icons**

```tsx
// app/icon.tsx
import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f766e',
          color: 'white',
          fontSize: 260,
          fontWeight: 700,
          fontFamily: 'sans-serif',
        }}
      >
        A
      </div>
    ),
    { ...size },
  );
}
```

```tsx
// app/apple-icon.tsx
import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f766e',
          color: 'white',
          fontSize: 96,
          fontWeight: 700,
          fontFamily: 'sans-serif',
        }}
      >
        A
      </div>
    ),
    { ...size },
  );
}
```

- [ ] **Step 3: Write the service worker (installability only for now — push events land in Task 15)**

```js
// src/lib/service-worker.js
self.addEventListener('install', () => {
  self.skipWaiting();
});
```

- [ ] **Step 4: Write the registration component**

```tsx
// src/components/pwa/PWARegister.tsx
'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(new URL('../lib/service-worker.js', import.meta.url), {
        scope: '/',
      });
    }
  }, []);

  return null;
}
```

- [ ] **Step 5: Mount it and add iOS home-screen metadata in the root layout**

```tsx
// app/layout.tsx — add the appleWebApp block to metadata, and render PWARegister
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { db } from '@/db/client';
import { seedIfNeeded } from '@/db/seed';
import { getProfile } from '@/db/queries/profile';
import { PWARegister } from '@/components/pwa/PWARegister';

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
  themeColor: '#0f766e',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await seedIfNeeded(db);
  const profile = await getProfile(db);
  const isDark = (profile?.themeMode ?? 'dark') !== 'light';

  return (
    <html lang="en" className={isDark ? 'dark' : ''}>
      <body>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Verify the generated routes and manifest**

Run: `npm run dev`, then in another terminal:
```bash
curl -sI http://localhost:3000/icon | head -1
curl -sI http://localhost:3000/apple-icon | head -1
curl -s http://localhost:3000/manifest.webmanifest | head -c 300
```
Expected: both icon requests return `200`, and the manifest response contains `"name":"Adhyayan OS"`. If either icon path 404s, open the Network tab in DevTools while loading `/`, find the actual URL the `<link rel="icon">`/`<link rel="apple-touch-icon">` tags point to, and update the two `src` values in `app/manifest.ts` (Step 1) to match — this is the one spot in the plan where the exact served path is confirmed by running the app rather than asserted up front.

- [ ] **Step 7: Manual verification on the real device**

On iPhone 16 Pro Safari, visit the deployed URL (or a tunneled local dev URL), open the Share sheet, tap "Add to Home Screen," confirm the icon and name look right, then open it from the home screen and confirm it launches without Safari's address bar (`display: 'standalone'` took effect).

- [ ] **Step 8: Commit**

```bash
git add app/manifest.ts app/icon.tsx app/apple-icon.tsx src/lib/service-worker.js src/components/pwa app/layout.tsx
git commit -m "feat: add PWA manifest, generated icons, and installable service worker"
```

---

### Task 15: Push subscription infrastructure

**Files:**
- Create: `src/db/queries/push-subscriptions.ts`
- Create: `src/actions/push-subscription.ts`
- Create: `src/lib/push-client.ts`
- Create: `src/components/ui/PushNotificationManager.tsx`
- Modify: `src/lib/service-worker.js` (add push + notificationclick handlers)
- Modify: `app/(main)/settings/page.tsx` (mount the manager)
- Test: `tests/db/push-subscriptions.test.ts`

**Interfaces:**
- Produces: `listPushSubscriptions(db)`, `upsertPushSubscription(db, entry)`, `deletePushSubscriptionByEndpoint(db, endpoint)`. Actions `subscribeToPushAction`, `unsubscribeFromPushAction`. `urlBase64ToUint8Array(base64: string): Uint8Array`. `listPushSubscriptions` is consumed by Task 16's `sendPushToAll`.
- Consumes: `PWARegister`'s already-registered service worker (Task 14) — this task calls `navigator.serviceWorker.ready`, not `.register()` again.

- [ ] **Step 1: Write the failing push-subscription query test**

```ts
// tests/db/push-subscriptions.test.ts
import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import {
  listPushSubscriptions,
  upsertPushSubscription,
  deletePushSubscriptionByEndpoint,
} from '@/db/queries/push-subscriptions';

describe('push subscription queries', () => {
  it('upsertPushSubscription inserts once, then updates the same row on re-subscribe', async () => {
    const db = await createTestDb();
    await upsertPushSubscription(db, { endpoint: 'https://push.example/abc', p256dh: 'key1', auth: 'auth1' });
    await upsertPushSubscription(db, { endpoint: 'https://push.example/abc', p256dh: 'key2', auth: 'auth2' });

    const rows = await listPushSubscriptions(db);
    expect(rows).toHaveLength(1);
    expect(rows[0].p256dh).toBe('key2');
  });

  it('deletePushSubscriptionByEndpoint removes the matching row', async () => {
    const db = await createTestDb();
    await upsertPushSubscription(db, { endpoint: 'https://push.example/xyz', p256dh: 'k', auth: 'a' });
    await deletePushSubscriptionByEndpoint(db, 'https://push.example/xyz');
    expect(await listPushSubscriptions(db)).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- tests/db/push-subscriptions.test.ts`
Expected: FAIL — `src/db/queries/push-subscriptions.ts` does not exist yet.

- [ ] **Step 3: Write `src/db/queries/push-subscriptions.ts`**

```ts
// src/db/queries/push-subscriptions.ts
import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../types';
import { pushSubscriptions, type PushSubscription, type NewPushSubscription } from '../schema';

export async function listPushSubscriptions(db: AppDatabase): Promise<PushSubscription[]> {
  return db.select().from(pushSubscriptions);
}

export async function upsertPushSubscription(db: AppDatabase, entry: NewPushSubscription): Promise<void> {
  const existing = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, entry.endpoint))
    .limit(1);
  if (existing.length > 0) {
    await db.update(pushSubscriptions).set(entry).where(eq(pushSubscriptions.id, existing[0].id));
  } else {
    await db.insert(pushSubscriptions).values(entry);
  }
}

export async function deletePushSubscriptionByEndpoint(db: AppDatabase, endpoint: string): Promise<void> {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}
```

- [ ] **Step 4: Run the test again**

Run: `npm test -- tests/db/push-subscriptions.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the server actions**

```ts
// src/actions/push-subscription.ts
'use server';

import { db } from '@/db/client';
import { upsertPushSubscription, deletePushSubscriptionByEndpoint } from '@/db/queries/push-subscriptions';

export async function subscribeToPushAction(sub: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<void> {
  await upsertPushSubscription(db, { endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth });
}

export async function unsubscribeFromPushAction(endpoint: string): Promise<void> {
  await deletePushSubscriptionByEndpoint(db, endpoint);
}
```

- [ ] **Step 6: Extend the service worker with push handling**

```js
// src/lib/service-worker.js
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon',
      badge: '/icon',
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/dashboard'));
});
```

- [ ] **Step 7: Write `urlBase64ToUint8Array` and `PushNotificationManager`**

This follows Next.js's own documented Web Push pattern (register once via `PWARegister`, subscribe/unsubscribe here via `serviceWorker.ready`), swapping its in-memory example storage for our Postgres-backed actions.

```ts
// src/lib/push-client.ts
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
```

```tsx
// src/components/ui/PushNotificationManager.tsx
'use client';

import { useEffect, useState } from 'react';
import { subscribeToPushAction, unsubscribeFromPushAction } from '@/actions/push-subscription';
import { urlBase64ToUint8Array } from '@/lib/push-client';

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      navigator.serviceWorker.ready.then(async (registration) => {
        setSubscription(await registration.pushManager.getSubscription());
      });
    }
  }, []);

  async function subscribe() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
    setSubscription(sub);
    await subscribeToPushAction(JSON.parse(JSON.stringify(sub)));
  }

  async function unsubscribe() {
    if (!subscription) return;
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    setSubscription(null);
    await unsubscribeFromPushAction(endpoint);
  }

  if (!isSupported) {
    return (
      <p className="p-4 text-sm text-neutral-500">Push notifications aren&apos;t supported in this browser.</p>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-2 text-sm font-medium text-neutral-400">Notifications</h2>
      {subscription ? (
        <button
          onClick={unsubscribe}
          className="w-full rounded-md border border-neutral-700 px-4 py-3 text-neutral-100"
        >
          Disable Notifications
        </button>
      ) : (
        <button onClick={subscribe} className="w-full rounded-md bg-teal-600 px-4 py-3 font-medium text-white">
          Enable Notifications
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Mount it in Settings**

```tsx
// app/(main)/settings/page.tsx — add the import and render it
import { PushNotificationManager } from '@/components/ui/PushNotificationManager';
// ...keep existing imports...

// inside the returned JSX, after <DataPortabilitySection />:
<PushNotificationManager />
```

- [ ] **Step 9: Generate VAPID keys and set env vars**

Run: `npx web-push generate-vapid-keys`
Copy the output into `.env.local` as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` (and later into Vercel's project env vars — see Task 17).

- [ ] **Step 10: Manual verification**

On iPhone 16 Pro, install the app to the home screen (Task 14, Step 7) first — push permission prompts are blocked in a plain Safari tab pre-iOS-16.4-install. Open the installed app, go to Settings, tap "Enable Notifications," accept the OS permission prompt, confirm the button flips to "Disable Notifications." Confirm a row appears in the `push_subscriptions` table (check via your Postgres client).

- [ ] **Step 11: Commit**

```bash
git add src/db/queries/push-subscriptions.ts src/actions/push-subscription.ts src/lib/push-client.ts src/lib/service-worker.js src/components/ui/PushNotificationManager.tsx "app/(main)/settings/page.tsx" tests/db/push-subscriptions.test.ts
git commit -m "feat: add push subscription storage and PushNotificationManager UI"
```

---

### Task 16: Notification cron rules (HIGH PRIORITY — the most emphasized feature)

**Files:**
- Create: `src/lib/notification-rules.ts`, `src/lib/push.ts`
- Create: `app/api/cron/morning/route.ts`, `app/api/cron/midday/route.ts`, `app/api/cron/evening/route.ts`
- Create: `vercel.json`
- Test: `tests/lib/notification-rules.test.ts`

**Interfaces:**
- Produces: `NotificationPayload` (`{ title: string; body: string }`), `morningNotifications(db, today): Promise<NotificationPayload[]>`, `middayNotifications(db, today): Promise<NotificationPayload[]>`, `eveningNotifications(db, today): Promise<NotificationPayload[]>`. `sendPushToAll(db, payload: NotificationPayload): Promise<void>`.
- Consumes: `getProfile`/`getDailyLog` (Task 7), `listDueTodayOrOverdue` (Task 8), `listActiveHabits`/`listCompletedHabitIdsForDate` (Task 9), `listPushSubscriptions` — used inside `sendPushToAll` (Task 15), `addDaysToDateString`/`todayDateString` (Task 3).
- Hardcoded, non-configurable rules per the design spec: morning = unlogged weight + todos due today; midday = water intake below 50% of `dailyWaterMl`; evening = open active habits + tasks overdue as of yesterday (not merely due today — that's the morning nudge's job).

- [ ] **Step 1: Write the failing notification-rules test — the most thorough test file in this plan**

```ts
// tests/lib/notification-rules.test.ts
import { describe, it, expect } from 'vitest';
import { createTestDb } from '@/db/test-client';
import { seedIfNeeded } from '@/db/seed';
import { upsertDailyLog } from '@/db/queries/daily-log';
import { insertTodo } from '@/db/queries/todos';
import { insertHabit, toggleHabitToday } from '@/db/queries/habits';
import { morningNotifications, middayNotifications, eveningNotifications } from '@/lib/notification-rules';

const TODAY = '2026-08-07';

describe('morningNotifications', () => {
  it('flags unlogged weight and todos due today', async () => {
    const db = await createTestDb();
    await insertTodo(db, { title: 'Submit report', dueDate: TODAY });

    const notifications = await morningNotifications(db, TODAY);

    expect(notifications.some((n) => n.title === 'Log your weight')).toBe(true);
    expect(notifications.some((n) => n.title.includes('task'))).toBe(true);
  });

  it('stays silent once weight is logged and no todos are due', async () => {
    const db = await createTestDb();
    await upsertDailyLog(db, TODAY, { weightKg: 106.5 });

    expect(await morningNotifications(db, TODAY)).toHaveLength(0);
  });
});

describe('middayNotifications', () => {
  it('fires only when water intake is behind half the daily target', async () => {
    const db = await createTestDb();
    await seedIfNeeded(db);
    await upsertDailyLog(db, TODAY, { waterMl: 500 });

    expect(await middayNotifications(db, TODAY)).toHaveLength(1);

    await upsertDailyLog(db, TODAY, { waterMl: 2500 });
    expect(await middayNotifications(db, TODAY)).toHaveLength(0);
  });
});

describe('eveningNotifications', () => {
  it('flags open habits and tasks overdue as of yesterday, but not tasks merely due today', async () => {
    const db = await createTestDb();
    const habit = await insertHabit(db, { name: 'Journal' });
    await insertTodo(db, { title: 'Overdue task', dueDate: '2026-08-05' });
    await insertTodo(db, { title: 'Due today, not overdue', dueDate: TODAY });

    const notifications = await eveningNotifications(db, TODAY);

    expect(notifications.some((n) => n.title.includes('habit'))).toBe(true);
    const overdueNotification = notifications.find((n) => n.title.includes('overdue'));
    expect(overdueNotification?.body).toContain('Overdue task');
    expect(overdueNotification?.body).not.toContain('Due today, not overdue');
  });

  it('stops flagging a habit once it is completed for the day', async () => {
    const db = await createTestDb();
    const habit = await insertHabit(db, { name: 'Journal' });
    await toggleHabitToday(db, habit.id, TODAY);

    const notifications = await eveningNotifications(db, TODAY);
    expect(notifications.some((n) => n.title.includes('habit'))).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- tests/lib/notification-rules.test.ts`
Expected: FAIL — `src/lib/notification-rules.ts` does not exist yet.

- [ ] **Step 3: Write `src/lib/notification-rules.ts`**

```ts
// src/lib/notification-rules.ts
import type { AppDatabase } from '../db/types';
import { getProfile } from '../db/queries/profile';
import { getDailyLog } from '../db/queries/daily-log';
import { listDueTodayOrOverdue } from '../db/queries/todos';
import { listActiveHabits, listCompletedHabitIdsForDate } from '../db/queries/habits';
import { addDaysToDateString } from './dates';

export type NotificationPayload = { title: string; body: string };

export async function morningNotifications(db: AppDatabase, today: string): Promise<NotificationPayload[]> {
  const notifications: NotificationPayload[] = [];

  const todayLog = await getDailyLog(db, today);
  if (todayLog?.weightKg == null) {
    notifications.push({ title: 'Log your weight', body: "You haven't logged today's weight yet." });
  }

  const dueTodayOrOverdue = await listDueTodayOrOverdue(db, today);
  if (dueTodayOrOverdue.length > 0) {
    notifications.push({
      title: `${dueTodayOrOverdue.length} task${dueTodayOrOverdue.length === 1 ? '' : 's'} due today`,
      body: dueTodayOrOverdue.map((t) => t.title).slice(0, 3).join(', '),
    });
  }

  return notifications;
}

export async function middayNotifications(db: AppDatabase, today: string): Promise<NotificationPayload[]> {
  const profile = await getProfile(db);
  if (!profile) return [];

  const todayLog = await getDailyLog(db, today);
  const waterMl = todayLog?.waterMl ?? 0;
  const halfTarget = profile.dailyWaterMl * 0.5;

  if (waterMl < halfTarget) {
    return [{ title: "You're behind on water", body: `${waterMl}ml of ${profile.dailyWaterMl}ml so far today.` }];
  }
  return [];
}

export async function eveningNotifications(db: AppDatabase, today: string): Promise<NotificationPayload[]> {
  const notifications: NotificationPayload[] = [];

  const activeHabits = await listActiveHabits(db);
  const completedIds = await listCompletedHabitIdsForDate(db, today);
  const openCount = activeHabits.filter((h) => !completedIds.has(h.id)).length;
  if (openCount > 0) {
    notifications.push({
      title: `${openCount} habit${openCount === 1 ? '' : 's'} still open today`,
      body: 'Close them out before the day ends.',
    });
  }

  // "Overdue as of yesterday" — deliberately excludes tasks due today, which
  // the morning notification already covers.
  const yesterday = addDaysToDateString(today, -1);
  const overdue = await listDueTodayOrOverdue(db, yesterday);
  if (overdue.length > 0) {
    notifications.push({
      title: `${overdue.length} overdue task${overdue.length === 1 ? '' : 's'}`,
      body: overdue.map((t) => t.title).slice(0, 3).join(', '),
    });
  }

  return notifications;
}
```

- [ ] **Step 4: Run the test again**

Run: `npm test -- tests/lib/notification-rules.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Write `src/lib/push.ts`**

```ts
// src/lib/push.ts
import webpush from 'web-push';
import { eq } from 'drizzle-orm';
import type { AppDatabase } from '../db/types';
import { pushSubscriptions } from '../db/schema';
import type { NotificationPayload } from './notification-rules';

let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  webpush.setVapidDetails(
    'mailto:you@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

export async function sendPushToAll(db: AppDatabase, payload: NotificationPayload): Promise<void> {
  ensureConfigured();
  const subs = await db.select().from(pushSubscriptions);

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        );
      } catch (err: any) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          // Subscription is gone (browser data cleared, app uninstalled) — stop trying it.
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        } else {
          console.error('push send failed', err);
        }
      }
    }),
  );
}
```

- [ ] **Step 6: Write the three cron routes**

```ts
// app/api/cron/morning/route.ts
import type { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { todayDateString } from '@/lib/dates';
import { morningNotifications } from '@/lib/notification-rules';
import { sendPushToAll } from '@/lib/push';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const notifications = await morningNotifications(db, todayDateString());
  for (const notification of notifications) {
    await sendPushToAll(db, notification);
  }
  return Response.json({ sent: notifications.length });
}
```

```ts
// app/api/cron/midday/route.ts
import type { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { todayDateString } from '@/lib/dates';
import { middayNotifications } from '@/lib/notification-rules';
import { sendPushToAll } from '@/lib/push';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const notifications = await middayNotifications(db, todayDateString());
  for (const notification of notifications) {
    await sendPushToAll(db, notification);
  }
  return Response.json({ sent: notifications.length });
}
```

```ts
// app/api/cron/evening/route.ts
import type { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { todayDateString } from '@/lib/dates';
import { eveningNotifications } from '@/lib/notification-rules';
import { sendPushToAll } from '@/lib/push';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const notifications = await eveningNotifications(db, todayDateString());
  for (const notification of notifications) {
    await sendPushToAll(db, notification);
  }
  return Response.json({ sent: notifications.length });
}
```

- [ ] **Step 7: Write `vercel.json`**

Each cron entry fires once per day — required on Vercel's Hobby plan, which rejects any cron expression that would run more than once daily. The UTC times below correspond to 8:00am / 2:00pm / 8:00pm in `HOME_TIMEZONE` (`Asia/Kolkata`, UTC+5:30) — if you ever change `HOME_TIMEZONE` in `src/lib/dates.ts`, update these three schedules to match, and note Hobby-plan cron timing is only accurate to within the hour, not the minute.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    { "path": "/api/cron/morning", "schedule": "30 2 * * *" },
    { "path": "/api/cron/midday", "schedule": "30 8 * * *" },
    { "path": "/api/cron/evening", "schedule": "30 14 * * *" }
  ]
}
```

- [ ] **Step 8: Local manual verification**

Run: `npm run dev`, then:
```bash
CRON_SECRET=your-local-secret # matching .env.local
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/morning
```
Expected: a JSON response like `{"sent":1}` (or `0` if you've already logged today's weight and have no todos due). Try it without the header and confirm you get a `401`.

- [ ] **Step 9: Commit**

```bash
git add src/lib/notification-rules.ts src/lib/push.ts app/api/cron vercel.json tests/lib/notification-rules.test.ts
git commit -m "feat: add notification cron rules and Vercel Cron routes for push delivery"
```

---

### Task 17: Final integration, README, and Vercel deployment

**Files:**
- Create: `README.md`
- No new application source — this task runs the full pipeline end-to-end and ships it. Some steps are manual (Vercel/GitHub account actions) and are labeled as such; an agentic worker should stop and hand these back to the user rather than guessing at account credentials or remote URLs.

**Interfaces:**
- Consumes: everything from Tasks 1–16.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — every test file from Tasks 1–16 (smoke, schema, dates, seed, auth, profile, daily-log, todos, habits, dashboard-widgets, journal, data-portability, push-subscriptions, notification-rules).

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: builds successfully with no type errors. If Drizzle's `AppDatabase` union type surfaces a type error in any query file, check that the offending function is only calling methods common to both `VercelPgDatabase` and `PgliteDatabase` (select/insert/update/delete/transaction) — those are the only operations this plan relies on.

- [ ] **Step 3: Write the README**

```markdown
<!-- README.md -->
# Adhyayan OS — Web

Personal dashboard, to-dos, habits, and journal — the web/PWA companion to the
offline-first Flutter app. Single user, password-gated, deployed on Vercel
with Postgres persistence and push notifications.

## Local development

\`\`\`bash
npm install
cp .env.example .env.local   # fill in POSTGRES_URL, APP_PASSWORD, SESSION_SECRET, CRON_SECRET
npx web-push generate-vapid-keys   # paste output into NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY
npx drizzle-kit generate     # only needed after a schema change
npm run dev
\`\`\`

## Tests

\`\`\`bash
npm test
\`\`\`

Query and rule logic is tested against an in-memory Postgres (PGlite) — no
external database needed to run the suite.

## Deploying

1. Create a Vercel Postgres (or any Postgres) database and copy its connection
   string into `POSTGRES_URL`.
2. Run `npx drizzle-kit migrate` once, pointed at that connection string, to
   create the schema.
3. Push this repo to a git remote, import it into a new Vercel project.
4. In the Vercel project's environment variables, set `POSTGRES_URL`,
   `APP_PASSWORD`, `SESSION_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`,
   `VAPID_PRIVATE_KEY`.
5. Deploy. `vercel.json`'s three cron entries register automatically.
6. On your phone, open the deployed URL in Safari, "Add to Home Screen," open
   the installed app, and enable notifications from Settings.
```

- [ ] **Step 4 (manual — user account action): provision Postgres**

In the Vercel dashboard, create a Postgres database (Storage → Create Database → Postgres, or the Neon integration) attached to this project. Copy the connection string it gives you.

- [ ] **Step 5: Apply the schema to the real database**

```bash
POSTGRES_URL="<the connection string from Step 4>" npx drizzle-kit migrate
```
Expected: drizzle-kit reports the migration(s) from `drizzle/` applied successfully.

- [ ] **Step 6 (manual — user account action): push to a git remote and import into Vercel**

```bash
git remote add origin <your-repo-url>
git push -u origin main
```
Then in the Vercel dashboard: New Project → import this repo.

- [ ] **Step 7 (manual — user account action): set environment variables on Vercel**

In the Vercel project's Settings → Environment Variables, set: `POSTGRES_URL` (from Step 4), `APP_PASSWORD` (pick a real password, not the `.env.example` placeholder), `SESSION_SECRET` and `CRON_SECRET` (each a long random string — `openssl rand -hex 32` works), `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` (from Task 15, Step 9).

- [ ] **Step 8: Deploy**

Push to the connected branch (or run `npx vercel --prod` from the CLI if you've linked the project). Confirm the deployment succeeds in the Vercel dashboard and the three cron jobs appear under the project's Cron Jobs tab.

- [ ] **Step 9: Post-deploy smoke test**

Visit the deployed URL, log in with `APP_PASSWORD`. Click through all 5 tabs. Add a to-do due today, check off a habit, log today's weight, add water, pick a workout split day. On your iPhone 16 Pro, add the app to the home screen and enable notifications from Settings. Manually trigger a cron route to confirm delivery end-to-end:
```bash
curl -H "Authorization: Bearer <your CRON_SECRET>" https://<your-deployed-domain>/api/cron/morning
```
Expected: a push notification arrives on your phone (assuming the morning rule has something to report — e.g. you haven't logged today's weight yet).

- [ ] **Step 10: Commit**

```bash
git add README.md
git commit -m "docs: add README with local dev, testing, and Vercel deployment steps"
```

---

## Self-Review

**Spec coverage** — every section of `docs/superpowers/specs/plan.md` maps to a task: architecture/stack (Tasks 1–2), data model (Task 2), auth (Task 4), nav/layout (Task 5), Dashboard (Task 10), To-Dos (Task 8), Habits (Task 9), Journal (Task 11), Settings incl. export/import/reset (Tasks 12–13), PWA + push notifications (Tasks 14–16), deployment (Task 17). The spec's explicit non-goals (no multi-user auth, no Phase 2+ feature screens, no offline-first requirement, no configurable notification schedule) are respected — nothing in this plan builds toward any of them.

**Placeholder scan** — no TBD/TODO markers; every step has runnable code or a concrete shell command; no "similar to Task N" cross-references without repeating the actual code.

**Type consistency** — checked that names agree across every task that references them: `AppDatabase` (Task 2) is the first parameter of every query function through Task 16. `todayDateString`/`addDaysToDateString`/`dateStringDiffInDays` (Task 3) keep the same signatures everywhere they're consumed (Tasks 7, 8, 9, 10, 11, 16). `listDueTodayOrOverdue(db, today)` (Task 8) is called with the same signature from Task 10 (dashboard) and Task 16 (morning/evening rules). `listActiveHabits`/`listCompletedHabitIdsForDate` (Task 9) keep the same signatures in Task 10 and Task 16. `EXPORT_SCHEMA_VERSION`/`exportAllTables`/`importAllTables`/`resetAllData` (Task 13) are consistent between their query definitions and the Task 13 action wrappers. `sendPushToAll(db, payload: NotificationPayload)` (Task 16) matches the `NotificationPayload` type it imports from `notification-rules.ts`.

