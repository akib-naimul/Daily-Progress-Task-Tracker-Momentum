# Momentum — Progress OS · Build Brief

A progress-tracking web app for daily task management and progress analytics.
Target: works for anyone (students, faculty, professionals) who wants to track daily work and see progress trends.

## Tech stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Data persistence: start with localStorage, then migrate to a backend (Supabase recommended — Postgres + auth, generous free tier)

## Core concept
The dashboard is built around **user-customizable sections** (life areas like Academic, Soft Skills, Work). Each section:
- Has a name, emoji/icon, and accent color the user picks
- Contains tasks the user adds
- Shows its own completion percentage (done ÷ total), displayed large on the card
- Has a progress bar in the section's color

## Screens / features
1. **Today** — the hero. Section cards + a "momentum" banner showing overall daily completion % pushing toward 100%, with motivating messages ("So close — 2 tasks to 100%") and a day streak.
2. **Incomplete** — a flat list of every open task across all sections, each tagged with its section. Checkable inline.
3. **Yesterday** — a report of how yesterday finished: overall %, per-section breakdown, a verdict.
4. **Progress reports** — switchable Half-week (4d) / Weekly (7d) / Monthly (30d). Each shows: a big completion % gauge, tasks done/planned, best day, daily average, a completion-% line chart over the range, and per-section bars.
5. **Calendar** — month grid; each day shows a colored bar for that day's completion %.

## Design system
- **Dark theme by default**, with a light-mode toggle
- **Accent-color switcher** — user picks from steel blue (default), slate, teal, orange, crimson, indigo. Implemented via a `data-accent` attribute + CSS variables.
- Charcoal base (~#0A0C10), clean high-contrast, professional tone
- Completion color scale: red (low) → amber → accent → green (100%)
- Subtle, purposeful animation: count-up numbers, easing progress bars, a completion "flash" when a section hits 100%. No confetti.
- Fonts: Inter for UI, JetBrains Mono for numbers/data
- Charts: use a React chart library (Recharts is a clean fit for Next.js)

## Data model (for the backend phase)
- `users` (id, name, email)
- `sections` (id, user_id, name, emoji, color, order)
- `tasks` (id, section_id, title, done, planned_minutes, spent_minutes, date)
- `daily_history` (user_id, date, section_id, done_count, total_count) — powers the reports

## Build order (suggested)
1. Scaffold Next.js + Tailwind, set up theme + accent CSS variables
2. Today screen with sections + tasks (localStorage first)
3. Momentum banner + completion math
4. Incomplete + Yesterday views
5. Reports with charts
6. Swap localStorage → Supabase + auth
7. Make it mobile-responsive (sidebar → bottom nav)

## Reference
A working HTML prototype of the final design is in this repo (momentum-tactical.html). Match its layout, colors, and interactions when building the React version.
