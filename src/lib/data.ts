import type { ChecklistItem, DayHistory, PersistedState, Section, Task } from "./types";

export const STORAGE_KEY = "momentum";

/** Pseudo-section name under which the daily checklist appears in history/reports. */
export const CHECKLIST_LABEL = "Daily Checklist";

/* muted section palette — slate/steel/teal/blue/amber tones, no neon */
export const PALETTE = [
  "#3B82F6",
  "#14B8A6",
  "#64748B",
  "#F59E0B",
  "#6366F1",
  "#0EA5E9",
];
export const EMOJIS = ["📚", "🧠", "💻", "💪", "🎯", "⚡", "🔧", "📊"];

export const dateKey = (d: Date) => d.toISOString().slice(0, 10);
export const todayKey = () => dateKey(new Date());

export function defaultSections(): Section[] {
  return [
    {
      id: 1,
      name: "Academic",
      emoji: "📚",
      color: "#3B82F6",
      tasks: [
        { t: "Finish CSE471 schema", done: true },
        { t: "Read 2 ML papers", done: false },
        { t: "Assignment 4 draft", done: false },
      ],
    },
    {
      id: 2,
      name: "Soft Skills",
      emoji: "🧠",
      color: "#14B8A6",
      tasks: [
        { t: "Practice presentation", done: true },
        { t: "Email follow-ups", done: true },
      ],
    },
    {
      id: 3,
      name: "Extra Skills",
      emoji: "💻",
      color: "#64748B",
      tasks: [
        { t: "PyTorch tutorial ch.3", done: false },
        { t: "2 LeetCode problems", done: false },
        { t: "Figma study", done: true },
      ],
    },
  ];
}

export function defaultChecklist(): ChecklistItem[] {
  return [
    { id: 1, t: "Morning workout", done: true },
    { id: 2, t: "Inbox to zero", done: true },
    { id: 3, t: "Stand-up meeting", done: false },
    { id: 4, t: "10k steps", done: false },
    { id: 5, t: "Journal before bed", done: false },
  ];
}

/* Seed the trailing 30 days of history so streak + (future) reports have data. */
export function seedHistory(): Record<string, DayHistory> {
  const names = ["Academic", "Soft Skills", "Extra Skills"];
  const history: Record<string, DayHistory> = {};
  for (let i = 30; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const total = 6 + Math.floor(Math.random() * 4);
    const done = Math.floor(total * (0.45 + Math.random() * 0.5));
    const sections: Record<string, number> = {};
    names.forEach((n) => (sections[n] = Math.round(40 + Math.random() * 60)));
    history[dateKey(d)] = {
      pct: Math.round((done / total) * 100),
      done,
      total,
      sections,
    };
  }
  return history;
}

export function loadState(seededHistory: Record<string, DayHistory>): PersistedState {
  const today = todayKey();
  const base: PersistedState = {
    sections: defaultSections(),
    checklist: defaultChecklist(),
    checklistDate: today,
    history: seededHistory,
    sid: 4,
    cid: 6,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<PersistedState>;
      if (p.sections) base.sections = p.sections;
      if (p.checklist) base.checklist = p.checklist;
      if (p.checklistDate) base.checklistDate = p.checklistDate;
      if (p.history) base.history = { ...base.history, ...p.history };
      if (p.sid) base.sid = p.sid;
      if (p.cid) base.cid = p.cid;
    }
  } catch {
    /* ignore malformed storage */
  }
  // Daily reset: on a new day, keep the checklist items but clear their checkmarks.
  if (base.checklistDate !== today) {
    base.checklist = base.checklist.map((it) => ({ ...it, done: false }));
    base.checklistDate = today;
  }
  return base;
}

export function persistState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage may be unavailable / full */
  }
}

// ---- completion math ----

export function sectionPct(section: Section): number {
  const total = section.tasks.length;
  if (!total) return 0;
  const done = section.tasks.filter((t) => t.done).length;
  return Math.round((done / total) * 100);
}

export function sectionDone(section: Section): number {
  return section.tasks.filter((t) => t.done).length;
}

export function checklistPct(checklist: ChecklistItem[]): number {
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);
}

/** Overall completion across all section tasks AND the daily checklist. */
export function overall(
  sections: Section[],
  checklist: ChecklistItem[] = []
): {
  pct: number;
  done: number;
  total: number;
  left: number;
} {
  let done = 0;
  let total = 0;
  sections.forEach((s) => {
    done += s.tasks.filter((t) => t.done).length;
    total += s.tasks.length;
  });
  done += checklist.filter((c) => c.done).length;
  total += checklist.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { pct, done, total, left: total - done };
}

/** A CSS variable reference for the completion color scale. */
export function pctColor(p: number): string {
  if (p >= 100) return "var(--green)";
  if (p >= 67) return "var(--accent)";
  if (p >= 34) return "var(--amber)";
  return "var(--red)";
}

/** Snapshot of today into history for streak + reports (includes the daily checklist). */
export function todaySnapshot(
  sections: Section[],
  checklist: ChecklistItem[] = []
): DayHistory {
  let done = 0;
  let total = 0;
  const secs: Record<string, number> = {};
  sections.forEach((s) => {
    const d = s.tasks.filter((t) => t.done).length;
    done += d;
    total += s.tasks.length;
    secs[s.name] = s.tasks.length ? Math.round((d / s.tasks.length) * 100) : 0;
  });
  if (checklist.length) {
    const d = checklist.filter((c) => c.done).length;
    done += d;
    total += checklist.length;
    secs[CHECKLIST_LABEL] = Math.round((d / checklist.length) * 100);
  }
  return {
    pct: total ? Math.round((done / total) * 100) : 0,
    done,
    total,
    sections: secs,
  };
}

// ---- task scheduled-window helpers ----

/** "14:30" -> "2:30 PM". */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h)) return hhmm;
  const ap = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
}

/** Human label for a task's scheduled window. */
export function windowLabel(task: Pick<Task, "start" | "end">): string {
  if (task.start && task.end) return `${formatTime(task.start)} – ${formatTime(task.end)}`;
  if (task.end) return `due ${formatTime(task.end)}`;
  if (task.start) return `from ${formatTime(task.start)}`;
  return "";
}

/** Total tracked time on a task in ms: accumulated + the currently-running span. */
export function taskElapsed(task: Task, nowMs: number): number {
  const base = task.spentMs ?? 0;
  return task.runningSince ? base + Math.max(0, nowMs - task.runningSince) : base;
}

/** Format a duration in ms as M:SS, or H:MM:SS once it passes an hour. */
export function fmtDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${m}:${pad(ss)}`;
}

/** A task is overdue when it has an end time, isn't done, and now is past that time today. */
export function isOverdue(task: Task, now: Date): boolean {
  if (task.done || !task.end) return false;
  const [h, m] = task.end.split(":").map(Number);
  if (Number.isNaN(h)) return false;
  const end = new Date(now);
  end.setHours(h, m, 0, 0);
  return now.getTime() > end.getTime();
}

export function streakCount(history: Record<string, DayHistory>): number {
  let s = 0;
  for (let i = 1; i < 40; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const h = history[dateKey(d)];
    if (h && h.pct >= 60) s++;
    else break;
  }
  const t = history[todayKey()];
  if (t && t.pct >= 60) s++;
  return s;
}

export function momentumMessage(pct: number, done: number, left: number, total: number) {
  let title = "Today's momentum";
  let msg: string;
  if (pct >= 100) {
    title = "All done — incredible!";
    msg = "Every task complete. Perfect day.";
  } else if (pct >= 75) {
    msg = `So close — ${left} task${left > 1 ? "s" : ""} to 100%.`;
  } else if (pct >= 50) {
    msg = `Over halfway. ${left} left to crush.`;
  } else if (pct >= 25) {
    msg = `Building momentum — ${done} done, ${left} to go.`;
  } else if (total > 0) {
    msg = `${left} tasks ahead. Start the first one.`;
  } else {
    msg = "Add a section to begin.";
  }
  return { title, msg };
}

// ---- report + calendar aggregation ----

export type RangeKey = "half" | "week" | "month";

export const RANGE_DAYS: Record<RangeKey, number> = { half: 4, week: 7, month: 30 };
export const RANGE_LABEL: Record<RangeKey, string> = {
  half: "Last 4 days",
  week: "Last 7 days",
  month: "Last 30 days",
};

export type ReportPoint = { label: string; pct: number | null };
export type ReportData = {
  overall: number;
  done: number;
  total: number;
  best: string;
  avg: number;
  series: ReportPoint[];
  sections: { name: string; pct: number }[];
};

export function buildReport(
  history: Record<string, DayHistory>,
  range: RangeKey
): ReportData {
  const days = RANGE_DAYS[range];
  const rows: { d: Date; h?: DayHistory }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    rows.push({ d, h: history[dateKey(d)] });
  }

  let td = 0;
  let tt = 0;
  let best: Date | null = null;
  let bp = -1;
  const agg: Record<string, number[]> = {};
  rows.forEach(({ d, h }) => {
    if (!h) return;
    td += h.done;
    tt += h.total;
    if (h.pct > bp) {
      bp = h.pct;
      best = d;
    }
    Object.entries(h.sections).forEach(([n, p]) => {
      (agg[n] = agg[n] || []).push(p);
    });
  });

  const withData = rows.filter((r) => r.h);
  const overallPct = tt ? Math.round((td / tt) * 100) : 0;
  const avg = withData.length
    ? Math.round(withData.reduce((s, r) => s + (r.h?.pct ?? 0), 0) / withData.length)
    : 0;

  return {
    overall: overallPct,
    done: td,
    total: tt,
    best: best
      ? (best as Date).toLocaleDateString("default", { weekday: "short", day: "numeric" })
      : "—",
    avg,
    series: rows.map((r) => ({
      label: r.d.toLocaleDateString("default", { month: "short", day: "numeric" }),
      pct: r.h ? r.h.pct : null,
    })),
    sections: Object.entries(agg).map(([name, arr]) => ({
      name,
      pct: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
    })),
  };
}

export type CalendarCell =
  | {
      day: number;
      key: string;
      history: DayHistory | null;
      isToday: boolean;
      isFuture: boolean;
    }
  | null;

export type CalendarMonth = {
  title: string;
  cells: CalendarCell[];
  stats: {
    avg: number;
    tracked: number;
    best: { day: number; pct: number } | null;
  };
};

export function buildCalendar(
  history: Record<string, DayHistory>,
  year: number,
  month: number
): CalendarMonth {
  const now = new Date();
  const todayY = now.getFullYear();
  const todayM = now.getMonth();
  const todayStart = new Date(todayY, todayM, now.getDate()).getTime();

  const first = new Date(year, month, 1).getDay();
  const dim = new Date(year, month + 1, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < first; i++) cells.push(null);

  let sum = 0;
  let tracked = 0;
  let best: { day: number; pct: number } | null = null;

  for (let d = 1; d <= dim; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const h = history[key] ?? null;
    const isToday = year === todayY && month === todayM && d === now.getDate();
    const isFuture = new Date(year, month, d).getTime() > todayStart;
    if (h) {
      sum += h.pct;
      tracked++;
      if (!best || h.pct > best.pct) best = { day: d, pct: h.pct };
    }
    cells.push({ day: d, key, history: h, isToday, isFuture });
  }

  return {
    title: new Date(year, month, 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    }),
    cells,
    stats: { avg: tracked ? Math.round(sum / tracked) : 0, tracked, best },
  };
}
