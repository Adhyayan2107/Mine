# Adhyayan OS — Web Version Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to turn this into a task-by-task implementation plan, then superpowers:subagent-driven-development or superpowers:executing-plans to execute it.

**Goal:** Build a website version of the Phase 1 Adhyayan OS app (originally planned as offline-first Flutter, see `2026-08-04-phase1-core-foundation.md`) as a Next.js app hosted on Vercel, with real cross-device persistence and PWA push notifications. Single user (Adhyayan), primary device iPhone 16 Pro (installed to home screen), secondary use on laptop browser.

## Non-goals (Phase 1 web, matches Flutter Phase 1 scope)

- No multi-user accounts — one person, one password gate.
- No workouts/nutrition/weight/measurements/career/analytics feature screens (Phase 2+ in the original plan; out of scope here too).
- No offline-first/local-first sync — this version is server-backed; there's no requirement to work with no network.
- Notification schedule/times are hardcoded, not user-configurable, in this phase.

## Architecture

- **Framework:** Next.js 15 (App Router, TypeScript), deployed on Vercel.
- **Database:** Vercel Postgres (Neon-backed) + Drizzle ORM. Schema is a direct port of the Flutter plan's Drift tables.
- **Mutations:** Server Actions — no separate REST/tRPC API layer needed for a single-user CRUD app.
- **Styling:** Tailwind CSS.
- **Auth:** Single shared password (env var `APP_PASSWORD`). A login page sets an httpOnly signed cookie; `middleware.ts` redirects unauthenticated requests to `/login`. No user table, no sessions beyond the cookie.
- **PWA:** `manifest.json` + a service worker (`next-pwa` or hand-rolled) so the site is installable to the iOS/Android home screen and desktop. Required for push notifications to work on iOS Safari (16.4+ minimum, must be added to home screen).
- **Push notifications:** Web Push API with VAPID keys (`web-push` npm package). Push subscriptions stored in a `push_subscriptions` table. A Vercel Cron job (`vercel.json`) hits a protected API route 3x/day to evaluate today's data and send pushes.

## Data model (Postgres via Drizzle)

Direct port of the Drift tables in the Flutter plan, one row per table except `profile` and `push_subscriptions`:

- `profile` — single row: name, age, heightCm, currentWeightKg, goalWeightKg, goalBodyFatPercent, dailyCaloriesKcal, dailyProteinG, dailyWaterMl, dailySteps, sleepTargetHours, themeMode (dark/light/system), motivationalQuoteEnabled.
- `workout_split_days` — id, orderIndex, label.
- `daily_logs` — id, date (unique), weightKg?, caloriesKcal?, proteinG?, waterMl, steps?, workoutSplitDayId?.
- `categories` — id, name, colorValue.
- `todos` — id, title, notes?, dueDate?, priority (low/medium/high), categoryId?, isCompleted, completedAt?, createdAt.
- `habits` — id, name, isActive, sortOrder.
- `habit_completions` — id, habitId, date (unique per habit+date).
- `journal_entries` — id, date (unique), morningPlan?, wins?, lessons?, tomorrowFocus?, mood? (1-5), energy? (1-5).
- `dashboard_widget_configs` — id, widgetKey, sortOrder, isEnabled.
- `push_subscriptions` — id, endpoint (unique), p256dh, auth, createdAt.

Same seed data as the Flutter plan (profile targets, 7-day workout split, 5 categories, 10 habits, 11 dashboard widget keys), inserted once on first run if `profile` is empty — mirrors `SeedService.seedIfNeeded()`.

## Navigation & layout

Five sections: Dashboard, To-Dos, Habits, Journal, Settings.

- **Desktop (≥768px):** persistent left sidebar with the 5 sections.
- **Mobile (<768px), tuned for iPhone 16 Pro (390pt width):** fixed bottom tab bar, large tap targets (gym-use: quick, low-precision taps). This is the primary usage mode — polish here matters more than desktop.

Dark-mode-first (`profile.themeMode` defaults to `'dark'`), matching the Flutter app.

## Features (feature parity with Flutter Phase 1)

### Dashboard
Quick-log cards, each opens a numeric bottom sheet/modal on tap (parity with the Flutter `showQuickNumberSheet`):
- Today's Weight, Calories Remaining, Protein Progress, Water Intake (+250ml tap-to-add), Steps, Today's Workout (split-day picker)
- Habit Completion %, Tasks Remaining (due today/overdue count), Workout Streak, Current Goal
- Weekly Weight Graph (chart)
- Widget settings: toggle/reorder which cards show, via `dashboard_widget_configs`

**To-Dos and Habits are the two highest-priority screens** per explicit user emphasis — get the most implementation/testing attention.

### To-Dos
List with checkbox complete/incomplete, add/edit modal (title, notes, due date, priority, category), category management (add/delete), delete todo. Due-today/overdue todos surface on the dashboard and in notifications.

### Habits
List with one-tap checkoff (toggle today's completion), add/edit modal, archive habit, detail view showing current streak, longest streak, and completion history.

### Journal
Today's entry (morning plan / wins / lessons / tomorrow focus / mood / energy, partial saves allowed — same field independent-upsert behavior as the Flutter `upsertForDate`), history list of past entries.

### Settings
- Profile & targets edit (goal weight, daily calories/protein/water/steps)
- Theme picker (dark/light/system)
- Export data (JSON download, same shape as the Flutter export: one key per table)
- Import data (JSON upload, transactional replace — same semantics as Flutter's `ImportService`, including the same Phase-1 limitation that `habit_completions` history is not round-tripped)
- Guarded reset (type-to-confirm dialog, wipes and reseeds all tables)
- Enable Notifications toggle (requests browser push permission, POSTs subscription to server)

## Push notifications

Three fixed daily checks via Vercel Cron (times in the user's hardcoded home timezone):

1. **Morning:** no weight logged today → "Log your weight" push. Todos due today exist → "N tasks due today" push.
2. **Midday:** today's water intake < 50% of `dailyWaterMl` → "You're behind on water" push.
3. **Evening:** any active habit not completed today → "N habits still open" push. Overdue todos exist → "N overdue tasks" push.

Each cron hit is one API route that queries the relevant tables, decides which pushes (if any) fire, and sends via `web-push` to every row in `push_subscriptions`. No configurable rules engine — four fixed checks, hardcoded thresholds/copy, matches the actual profile targets. Add configurability later only if it's actually needed.

## Deployment

- Vercel project connected to a git repo (this directory is not currently a git repo — initialize one as part of implementation).
- Env vars: `APP_PASSWORD`, Postgres connection string (from Vercel Postgres integration), `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`.
- `vercel.json` cron entries for the 3 daily notification checks.

## Open items intentionally deferred

- No per-widget/notification configurability — hardcoded schedule and thresholds.
- No offline support (no service-worker caching of app data, only enough SW to satisfy PWA installability + push).
- `habit_completions` not included in export/import round-trip (same limitation as the Flutter plan).
