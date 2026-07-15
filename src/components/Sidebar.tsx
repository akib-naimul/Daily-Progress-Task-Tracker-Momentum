"use client";

import type { ViewKey } from "./AppShell";
import DataBackup from "./DataBackup";

const NAV: { key: ViewKey; ico: string; label: string; badge?: boolean }[] = [
  { key: "today", ico: "◈", label: "Today" },
  { key: "incomplete", ico: "☰", label: "Incomplete", badge: true },
  { key: "yesterday", ico: "↺", label: "Yesterday" },
  { key: "reports", ico: "◔", label: "Progress reports" },
  { key: "calendar", ico: "▦", label: "Calendar" },
];

export default function Sidebar({
  view,
  setView,
  openCount,
}: {
  view: ViewKey;
  setView: (v: ViewKey) => void;
  openCount: number;
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">M</div>
        <div>
          <h1>Momentum</h1>
          <div className="tag">PROGRESS OS</div>
        </div>
      </div>
      <nav className="nav">
        <div className="nav-label">WORKSPACE</div>
        {NAV.slice(0, 3).map((n) => (
          <NavButton key={n.key} n={n} view={view} setView={setView} openCount={openCount} />
        ))}
        <div className="nav-label">REPORTS</div>
        {NAV.slice(3).map((n) => (
          <NavButton key={n.key} n={n} view={view} setView={setView} openCount={openCount} />
        ))}
      </nav>
      <DataBackup />
      <div className="side-foot">
        <div className="avatar">N</div>
        <div style={{ flex: 1 }}>
          <div className="nm">Naimul</div>
          <div className="role">Free plan</div>
        </div>
      </div>
    </aside>
  );
}

function NavButton({
  n,
  view,
  setView,
  openCount,
}: {
  n: { key: ViewKey; ico: string; label: string; badge?: boolean };
  view: ViewKey;
  setView: (v: ViewKey) => void;
  openCount: number;
}) {
  return (
    <button
      className={`nav-item${view === n.key ? " on" : ""}`}
      onClick={() => setView(n.key)}
    >
      <span className="ni-ico">{n.ico}</span>
      {n.label}
      {n.badge && <span className="ni-badge">{openCount}</span>}
    </button>
  );
}
