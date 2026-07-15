# Momentum — Progress OS

A local-first **daily progress & task tracker**. Organize your day into customizable sections, track completion, build streaks, time your work, and see your trends over time — all running entirely on your own machine.

> **Local-first & private:** all your data is stored in your browser's / app's local storage on your device. No accounts, no server, no cloud. Works fully offline.

## Features

- **Today** — customizable life-area sections with tasks, a live "momentum" completion meter (bar **or** ring view), and a day streak.
- **Daily Checklist** — a quick recurring checklist that resets each day and feeds your overall momentum.
- **Per-task scheduling** — set an optional time window on any task, with an overdue flag.
- **Per-task stopwatch** — start/pause/reset a timer to track how long a task actually takes.
- **Today vs Yesterday** — a comparison chart so you can see if you're improving.
- **Incomplete** — every open task across all sections in one list.
- **Yesterday** — how yesterday finished, overall and per section.
- **Progress reports** — Half-week / Weekly / Monthly gauge, stats, a completion-over-time chart, and per-section bars.
- **Calendar** — a monthly completion **heatmap** with navigation, stats, and click-a-day breakdowns.
- **Motivational toasts** — encouraging pop-ups when you hit milestones.
- **Themes** — dark (default) / light, plus 6 accent colors.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4
- [Recharts](https://recharts.org) for charts
- [Electron](https://www.electronjs.org) for the desktop build
- Persistence: `localStorage` (local-first)

## Run it (web / development)

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Build the desktop app (Windows)

This produces a standalone installer under `dist/`.

```bash
npm install
npm run desktop:build
```

The installer (`dist/Momentum Setup <version>.exe`) can be shared and installed on any Windows PC — no Node or internet required to run it.

To just launch the desktop app locally without packaging an installer:

```bash
npm run desktop:dev
```

### How the desktop build works

`npm run desktop:build` runs two steps:

1. `desktop:export` — `BUILD_TARGET=desktop next build` statically exports the app to `out/` (see [`next.config.ts`](next.config.ts)).
2. `electron-builder` — packages `out/` + [`electron/main.js`](electron/main.js) into an installer. Electron serves the exported files through a custom `app://` origin so everything (assets, favicon, localStorage) works exactly like the web version.

## Project structure

```
src/
  app/            layout, global styles, entry page
  lib/            data model, localStorage store, helpers, hooks
  components/     Today, Incomplete, Yesterday, Reports, Calendar, and shared UI
electron/
  main.js         Electron main process (serves the exported app)
next.config.ts    web + desktop (static export) config
```

## License

Private project.
