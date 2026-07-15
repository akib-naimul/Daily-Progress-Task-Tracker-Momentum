import { STORAGE_KEY } from "./data";

const THEME_KEY = "momentum-theme";
const ACCENT_KEY = "momentum-accent";
const VIEW_KEY = "momentum-view";

export type BackupFile = {
  app: "momentum";
  version: number;
  exportedAt: string;
  data: unknown; // the persisted momentum state (sections, checklist, history, ...)
  prefs: { theme?: string; accent?: string; view?: string };
};

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Collect all of the user's local data into a single portable object. */
export function buildBackup(): BackupFile {
  let data: unknown = null;
  try {
    data = JSON.parse(read(STORAGE_KEY) || "null");
  } catch {
    data = null;
  }
  return {
    app: "momentum",
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
    prefs: {
      theme: read(THEME_KEY) || undefined,
      accent: read(ACCENT_KEY) || undefined,
      view: read(VIEW_KEY) || undefined,
    },
  };
}

/** Type guard: does this parsed object look like a real Momentum backup? */
export function isValidBackup(obj: unknown): obj is BackupFile {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if (o.app !== "momentum") return false;
  const data = o.data as Record<string, unknown> | null | undefined;
  return !!data && Array.isArray(data.sections);
}

/** Restore a backup into local storage. Caller should reload the app afterward. */
export function applyBackup(obj: BackupFile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj.data));
    const prefs = obj.prefs || {};
    if (prefs.theme) localStorage.setItem(THEME_KEY, prefs.theme);
    if (prefs.accent) localStorage.setItem(ACCENT_KEY, prefs.accent);
    if (prefs.view) localStorage.setItem(VIEW_KEY, prefs.view);
  } catch {
    /* storage unavailable */
  }
}
