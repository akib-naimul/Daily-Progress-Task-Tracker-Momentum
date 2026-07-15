"use client";

import { CHECKLIST_LABEL } from "@/lib/data";
import type { ChecklistItem, Section } from "@/lib/types";

type OpenRow = {
  key: string;
  label: string;
  color: string;
  emoji: string;
  sectionName: string;
  onCheck: () => void;
};

export default function IncompleteView({
  sections,
  checklist,
  onToggle,
  onToggleChecklist,
}: {
  sections: Section[];
  checklist: ChecklistItem[];
  onToggle: (id: number, i: number) => void;
  onToggleChecklist: (id: number) => void;
}) {
  const open: OpenRow[] = [];
  sections.forEach((s) =>
    s.tasks.forEach((t, i) => {
      if (!t.done)
        open.push({
          key: `s${s.id}-${i}`,
          label: t.t,
          color: s.color,
          emoji: s.emoji,
          sectionName: s.name,
          onCheck: () => onToggle(s.id, i),
        });
    })
  );
  checklist.forEach((c) => {
    if (!c.done)
      open.push({
        key: `c${c.id}`,
        label: c.t,
        color: "#6366F1",
        emoji: "📋",
        sectionName: CHECKLIST_LABEL,
        onCheck: () => onToggleChecklist(c.id),
      });
  });

  return (
    <section className="view">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Incomplete tasks</h3>
            <span className="sub">Everything still open across all sections</span>
          </div>
        </div>

        {open.length === 0 ? (
          <div className="todo-empty">
            <div className="ce">✓</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
              All clear!
            </div>
            <div style={{ marginTop: 4 }}>Every task is complete.</div>
          </div>
        ) : (
          open.map((row) => (
            <div className="todo" key={row.key}>
              <span className="tdot" style={{ background: row.color }} />
              <span className="tname">{row.label}</span>
              <span
                className="tsec"
                style={{ background: `${row.color}22`, color: row.color }}
              >
                {row.emoji} {row.sectionName}
              </span>
              <button className="tcb" onClick={row.onCheck} aria-label="Complete task" />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
