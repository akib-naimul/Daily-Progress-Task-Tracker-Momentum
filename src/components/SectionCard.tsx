"use client";

import { useEffect, useRef, useState } from "react";
import { pctColor, sectionDone, sectionPct } from "@/lib/data";
import type { Section } from "@/lib/types";
import TaskRow from "./TaskRow";

export default function SectionCard({
  section,
  index,
  now,
  onToggle,
  onAddTask,
  onDelTask,
  onSetTime,
  onStartTimer,
  onStopTimer,
  onResetTimer,
  onRename,
  onDelSection,
}: {
  section: Section;
  index: number;
  now: Date;
  onToggle: (id: number, i: number) => void;
  onAddTask: (id: number, value: string) => void;
  onDelTask: (id: number, i: number) => void;
  onSetTime: (id: number, i: number, start?: string, end?: string) => void;
  onStartTimer: (id: number, i: number) => void;
  onStopTimer: (id: number, i: number) => void;
  onResetTimer: (id: number, i: number) => void;
  onRename: (id: number, name: string) => void;
  onDelSection: (id: number) => void;
}) {
  const pct = sectionPct(section);
  const done = sectionDone(section);
  const total = section.tasks.length;
  const col = pctColor(pct);
  const badge = pct >= 100 ? "✓ Done" : pct >= 67 ? `${total - done} to go` : "";

  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [nameDraft, setNameDraft] = useState(section.name);
  const flashRef = useRef<HTMLDivElement>(null);
  const prevPct = useRef(pct);

  // Fire the completion flash when the section crosses into 100%.
  useEffect(() => {
    if (pct >= 100 && prevPct.current < 100 && flashRef.current) {
      const el = flashRef.current;
      el.classList.remove("go");
      void el.offsetWidth; // reflow to restart the animation
      el.classList.add("go");
    }
    prevPct.current = pct;
  }, [pct]);

  function commitName() {
    setEditing(false);
    const v = nameDraft.trim();
    if (v && v !== section.name) onRename(section.id, v);
    else setNameDraft(section.name);
  }

  return (
    <div
      className={`section reveal${pct >= 100 ? " complete" : ""}`}
      style={{ animationDelay: `${0.12 + index * 0.05}s` }}
    >
      <div ref={flashRef} className="flash" style={{ color: section.color }} />
      <div
        className="sec-glow"
        style={{
          background: `radial-gradient(circle, ${section.color}, transparent 70%)`,
        }}
      />

      {confirmDelete && (
        <div className="sec-confirm">
          <div className="sec-confirm-box">
            <div className="sec-confirm-title">Delete “{section.name}”?</div>
            <div className="sec-confirm-sub">
              This removes the section and its {total} task{total !== 1 ? "s" : ""}.
            </div>
            <div className="sec-confirm-actions">
              <button className="sc-cancel" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button className="sc-delete" onClick={() => onDelSection(section.id)}>
                Delete section
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sec-top">
        <div className="sec-title-row">
          <span className="sec-emoji">{section.emoji}</span>
          {editing ? (
            <input
              className="sec-name-input"
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitName();
                if (e.key === "Escape") {
                  setNameDraft(section.name);
                  setEditing(false);
                }
              }}
              style={{
                flex: 1,
                background: "var(--hover)",
                border: "1px solid var(--brd2)",
                borderRadius: 7,
                padding: "4px 8px",
                font: "800 15px var(--font-inter), sans-serif",
                textTransform: "uppercase",
                color: "var(--text)",
              }}
            />
          ) : (
            <span
              className="sec-name"
              title="Double-click to rename"
              onDoubleClick={() => {
                setNameDraft(section.name);
                setEditing(true);
              }}
            >
              {section.name}
            </span>
          )}
          <span
            className={`sec-badge${badge ? " show" : ""}`}
            style={{ background: `${section.color}22`, color: col }}
          >
            {badge}
          </span>
          <button
            className="sec-del"
            onClick={() => setConfirmDelete(true)}
            title="Delete section"
            aria-label="Delete section"
          >
            🗑
          </button>
        </div>
        <div className="sec-pct-row">
          <div className="sec-pct mono" style={{ color: col }}>
            {pct}
            <small>%</small>
          </div>
          <div className="sec-pct-meta">
            <div className="sec-frac mono">
              {done}/{total}
            </div>
            <div className="sec-frac-l">tasks done</div>
          </div>
        </div>
        <div className="sec-bar">
          <span
            style={{
              width: `${pct}%`,
              background: section.color,
              boxShadow: `0 0 12px ${section.color}`,
            }}
          />
        </div>
      </div>

      <div className="sec-tasks">
        {section.tasks.map((t, i) => (
          <TaskRow
            key={i}
            task={t}
            sectionId={section.id}
            index={i}
            color={section.color}
            now={now}
            onToggle={onToggle}
            onDelTask={onDelTask}
            onSetTime={onSetTime}
            onStartTimer={onStartTimer}
            onStopTimer={onStopTimer}
            onResetTimer={onResetTimer}
          />
        ))}
      </div>

      <div className="sec-add">
        <input
          placeholder="＋ Add task…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAddTask(section.id, draft);
              setDraft("");
            }
          }}
        />
      </div>
    </div>
  );
}
