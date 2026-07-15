"use client";

import type { ViewKey } from "./AppShell";

const ITEMS: { key: ViewKey; ico: string; label: string; badge?: boolean }[] = [
  { key: "today", ico: "◈", label: "Today" },
  { key: "incomplete", ico: "☰", label: "Open", badge: true },
  { key: "yesterday", ico: "↺", label: "Yest." },
  { key: "reports", ico: "◔", label: "Reports" },
  { key: "calendar", ico: "▦", label: "Cal." },
];

export default function BottomNav({
  view,
  setView,
  openCount,
}: {
  view: ViewKey;
  setView: (v: ViewKey) => void;
  openCount: number;
}) {
  return (
    <nav className="bottom-nav">
      {ITEMS.map((it) => (
        <button
          key={it.key}
          className={`bn-item${view === it.key ? " on" : ""}`}
          onClick={() => setView(it.key)}
        >
          <span className="bn-ico">{it.ico}</span>
          {it.label}
          {it.badge && openCount > 0 && <span className="bn-badge">{openCount}</span>}
        </button>
      ))}
    </nav>
  );
}
