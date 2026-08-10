# Day navigation, supersets/dropsets, keyboard fix, UI pass — design

Approved 2026-08-10.

## 1. Remove calendar route line

Delete the route-line SVG and the `campPoints`/`routePath` computation from
`src/components/calendar/CalendarGrid.tsx`. Activity squares, flags, and the
legend stay.

## 2. Dashboard day navigation

- `app/(main)/dashboard/page.tsx` reads `searchParams` (a Promise in Next 16)
  for `d=YYYY-MM-DD`. Invalid or future dates fall back to today.
- All existing queries already take a date param — pass the viewed date
  through (day log, habit ratio, tasks due, streak, 7-day weight window,
  month activity for the viewed month).
- `DashboardView` header gains `‹ date ›` arrows (Link to `?d=`) and a
  "Today" chip shown only when viewing a past day.
- Quick-log server actions in `src/actions/daily-log.ts` gain an optional
  `date` argument, defaulting to today. Server-side validation: must match
  `YYYY-MM-DD`, be a real calendar date, and not be in the future.
- Workout and Habits pages unchanged (habits already edit retroactively).

## 3. Mobile keyboard covering inputs

- `SheetModal` tracks `window.visualViewport` height/offset and sizes the
  fixed overlay to the visual viewport, so the bottom sheet sits above the
  keyboard. One fix; every modal routes through it.
- Add `interactiveWidget: 'resizes-content'` to the root `viewport` export
  for Android Chrome.

## 4. Supersets and dropsets

Schema (one Drizzle migration, additive only):

- `workout_sets.set_type text not null default 'normal'` — `'normal' | 'drop'`.
- `workout_selections.superset_group integer` — nullable; selections sharing
  a value are a superset.

Behavior:

- **Dropset:** each logged set row shows a small "+ DROP" action that logs
  the current input (or placeholder) as a `drop` set. Drop sets render
  indented with a `DROP` tag, and count into volume as usual.
- **Superset:** an exercise plate header gains "Superset with…" which lists
  the other selected exercises; picking one assigns both the same group.
  Grouped exercises render as one joined plate labeled A1/A2. Unpairing
  clears the group. Removing an exercise clears its pairing.
- Last-session detail lines include drop sets inline.

## 5. UI declutter (colors/tokens unchanged)

- Dashboard: taller station rows, hide goal/target hints until a value is
  logged, route strip moves below the stations on mobile so logging is
  first-reach. Desktop side column unchanged.
- Light global pass: section gaps `space-y-4 → space-y-6`, page padding up a
  step, drop repeated mono micro-labels where a plate already names itself.
- No layout rewrites, no token or color changes.

## 6. Workout hub: finish flow, PR board, cardio (approved 2026-08-10, round 2)

The workout tab becomes a hub; live logging is a mode you enter and leave.

- **States.** No unfinished session → hub (PR board + cardio + "Track
  workout" button). Unfinished session with exercises → opens straight into
  the logging view. Finished today → hub with a "session logged · resume"
  affordance. Finishing is `daily_logs.workout_finished_at` (nullable
  timestamp); resume clears it.
- **Logging view.** Existing WorkoutView + a Finish workout button (shown
  once a set is logged) and a back-to-hub control. Hub↔track is client
  state on one route.
- **PR board.** Per exercise ever trained: all-time best set (kg × reps),
  the date it was hit, and a sparkline of best-weight-per-session.
  Recent PRs (≤14 days) flagged in route orange.
- **Cardio.** New `cardio_sessions` table: date, type (run/walk/cycle/
  other), duration min, optional distance km, optional kcal. Logged from
  the hub via a sheet form; recent entries listed with personal-best tags
  (longest, fastest pace, longest time per type).
- **Calendar.** `DayActivity.hasCardio`; cardio days get a small shoe
  glyph in the month grid. Cardio does not change the 4-part camp score.
- Data export keeps its existing scope (it already excludes workout
  tables); cardio follows that pattern.

## Testing

- Unit (vitest): date-param validation for quick-log actions; superset
  pairing/unpairing query behavior; drop-set numbering.
- Manual: keyboard behavior on iOS Safari + Android Chrome PWA.
