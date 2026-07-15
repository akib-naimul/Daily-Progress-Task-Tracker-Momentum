"use client";

import { useState } from "react";
import { checklistPct, pctColor } from "@/lib/data";
import type { ChecklistItem } from "@/lib/types";

export default function DailyChecklistCard({
  items,
  onToggle,
  onAdd,
  onDelete,
}: {
  items: ChecklistItem[];
  onToggle: (id: number) => void;
  onAdd: (value: string) => void;
  onDelete: (id: number) => void;
}) {
  const [draft, setDraft] = useState("");
  const done = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = checklistPct(items);
  const col = pctColor(pct);

  return (
    <div className="checklist-card reveal" style={{ animationDelay: ".08s" }}>
      <div className="cl-head">
        <span className="cl-emoji">📋</span>
        <span className="cl-title">Today&apos;s checklist</span>
        {total > 0 && pct >= 100 && <span className="cl-done-badge">✓ All done</span>}
        <span className="cl-frac mono" style={{ color: col }}>
          {done}/{total}
        </span>
      </div>

      <div className="cl-bar">
        <span style={{ width: `${pct}%`, background: col, boxShadow: `0 0 10px ${col}` }} />
      </div>

      <div className="cl-items">
        {items.length === 0 && (
          <div className="cl-empty">No checklist items yet — add your daily habits below.</div>
        )}
        {items.map((it) => (
          <div className="cl-item" key={it.id}>
            <button
              className={`cb${it.done ? " done" : ""}`}
              style={
                it.done
                  ? { background: col, borderColor: col, boxShadow: `0 0 12px ${col}` }
                  : undefined
              }
              onClick={() => onToggle(it.id)}
              aria-label={it.done ? "Mark incomplete" : "Mark complete"}
            >
              {it.done ? "✓" : ""}
            </button>
            <span className={`tt${it.done ? " done" : ""}`}>{it.t}</span>
            <button
              className="task-del"
              onClick={() => onDelete(it.id)}
              aria-label="Delete checklist item"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="cl-add">
        <input
          placeholder="＋ Add checklist item…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAdd(draft);
              setDraft("");
            }
          }}
        />
      </div>
    </div>
  );
}
