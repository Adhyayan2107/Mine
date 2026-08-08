# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A single user (the owner) tracking their own fitness and daily discipline. Majority of sessions are one-handed on a phone — often mid-gym, between sets — but desktop use is an equally first-class scenario, not an afterthought. No other accounts, roles, or audiences exist.

## Product Purpose

Adhyayan OS is a personal dashboard, to-do list, habit tracker, calendar, and daily journal — the installable web/PWA companion to an offline-first Flutter app of the same name. Success is frictionless daily logging: weight, calories, protein, water, steps, habit checkoffs, tasks, and a short journal, captured in seconds without ceremony.

## Positioning

Single-user by design: password-gated, no accounts, no ads, no social layer. It competes with nothing — it replaces a pile of generic tracking apps with one surface shaped exactly around its one user's routine.

## Operating Context

- Installed as a PWA on the phone home screen; also opened in a desktop browser.
- Quick-log happens in stolen moments (mid-gym, morning weigh-in); journal and review happen in calmer sittings.
- Push notifications nudge three times daily: morning (unlogged weight / due tasks), midday (water behind pace), evening (open habits / overdue tasks).

## Capabilities and Constraints

- Pages: Dashboard (reorderable/hideable quick-log widgets, weight sparkline, today's split), To-Dos (priorities, due dates, categories), Habits (daily checkoff, streaks, heatmaps), Calendar (month view with per-day activity, day-detail drill-down), Journal (morning plan, wins, lessons, tomorrow's focus, mood & energy), Settings (profile, targets, theme, JSON export/import, guarded reset).
- Stack: Next.js 16 (breaking changes vs. older versions — read `node_modules/next/dist/docs/` before coding), React 19, Tailwind v4 (tokens in `app/globals.css` `@theme`; no JS config), Drizzle + Postgres, web-push. Tests via vitest + playwright.
- Single password gate; session-based auth; no multi-tenancy.

## Brand Commitments

The product name "Adhyayan OS" is existing fact. No visual identity is binding: the 2026-08 "training log" system (warm charcoal canvas, ember/moss accents, stamp motif, Space Grotesk / IBM Plex) was explicitly released as replaceable evidence — a full clean-slate redesign of both UI and UX (navigation, hierarchy, flows included) is authorized (confirmed 2026-08-08).

## Evidence on Hand

All data is the user's own real logs. No testimonials, customers, pricing, or marketing claims exist or should be invented.

## Product Principles

1. Logging beats browsing — the fastest path to "recorded" wins every layout argument.
2. One-handed phone reach is a hard requirement; desktop must be equally considered, not a stretched phone view.
3. Single-user honesty — no fake social proof, no engagement mechanics beyond the user's own streaks.
4. Everything logged is visible somewhere — dashboard for today, calendar for history.
