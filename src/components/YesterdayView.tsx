"use client";

import { dateKey, pctColor } from "@/lib/data";
import type { DayHistory } from "@/lib/types";

export default function YesterdayView({
  history,
}: {
  history: Record<string, DayHistory>;
}) {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const h = history[dateKey(y)];

  if (!h) {
    return (
      <section className="view">
        <div className="momentum">
          <div className="mo-row">
            <div className="mo-big mono">—</div>
            <div className="mo-mid">
              <div className="mo-title">Yesterday&apos;s report</div>
              <div className="mo-msg">No data recorded for yesterday.</div>
              <div className="mo-track">
                <div className="mo-fill" style={{ width: "0%" }} />
              </div>
            </div>
          </div>
        </div>
        <div className="todo-empty">
          <div className="ce">↺</div>
          No activity logged yesterday.
        </div>
      </section>
    );
  }

  const verdict = h.pct >= 75 ? "strong day" : h.pct >= 50 ? "solid day" : "room to grow";

  return (
    <section className="view">
      <div className="momentum reveal">
        <div className="mo-row">
          <div className="mo-big mono" style={{ color: pctColor(h.pct) }}>
            {h.pct}%
          </div>
          <div className="mo-mid">
            <div className="mo-title">Yesterday&apos;s report</div>
            <div className="mo-msg">
              {h.done} of {h.total} tasks completed · {verdict}.
            </div>
            <div className="mo-track">
              <div className="mo-fill" style={{ width: `${h.pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="board-head">
        <div>
          <h3>By section — yesterday</h3>
          <div className="hint">How each area finished the day.</div>
        </div>
      </div>

      <div className="yday-grid">
        {Object.entries(h.sections).map(([name, p]) => (
          <div className="yday-card" key={name}>
            <div className="yc-head">
              <span className="yc-name">{name}</span>
              <span className="yc-pct mono" style={{ color: pctColor(p) }}>
                {p}%
              </span>
            </div>
            <div className="yc-bar">
              <span style={{ width: `${p}%`, background: pctColor(p) }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
