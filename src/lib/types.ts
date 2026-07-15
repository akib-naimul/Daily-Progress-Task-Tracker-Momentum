export type Task = {
  t: string;
  done: boolean;
  /** Optional scheduled window, as "HH:MM" 24h strings. */
  start?: string;
  end?: string;
  /** Optional stopwatch: accumulated milliseconds while paused. */
  spentMs?: number;
  /** Epoch ms when the stopwatch was last started; set only while running. */
  runningSince?: number;
};

export type Section = {
  id: number;
  name: string;
  emoji: string;
  color: string;
  tasks: Task[];
};

export type ChecklistItem = {
  id: number;
  t: string;
  done: boolean;
};

export type DayHistory = {
  pct: number;
  done: number;
  total: number;
  sections: Record<string, number>;
};

export type PersistedState = {
  sections: Section[];
  checklist: ChecklistItem[];
  /** Date (YYYY-MM-DD) the checklist's done-states belong to; drives the daily reset. */
  checklistDate: string;
  history: Record<string, DayHistory>;
  sid: number;
  cid: number;
};
