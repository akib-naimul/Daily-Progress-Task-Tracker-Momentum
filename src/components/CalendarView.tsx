"use client";

import { useState } from "react";
import { buildCalendar } from "@/lib/data";
import type { CalendarCell, CalendarMonth } from "@/lib/data";
import type { DayHistory } from "@/lib/types";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Sequential single-hue (accent) heatmap — professional, GitHub-style. Higher % = stronger tint.
const LEGEND_STEPS = [12, 30, 48, 66, 84];

/** Heatmap tint for a day cell: one accent hue, intensity scaling with completion %. */
function cellStyle(cell: NonNullable<CalendarCell>): React.CSSProperties {
  if (!cell.history) return {};
  const p = cell.history.pct;
  const alpha = Math.round(10 + p * 0.62); // 10% .. ~72%
  return { background: `color-mix(in srgb, var(--accent) ${alpha}%, transparent)` };
}

export default function CalendarView({
  history,
}: {
  history: Record<string, DayHistory>;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const { title, cells, stats }: CalendarMonth = buildCalendar(history, year, month);
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  function shift(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y--;
    } else if (m > 11) {
      m = 0;
      y++;
    }
    setMonth(m);
    setYear(y);
    setSelectedKey(null);
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedKey(null);
  }

  const selected = selectedKey
    ? (cells.find((c) => c && c.key === selectedKey) as NonNullable<CalendarCell> | undefined)
    : undefined;

  return (
    <section className="view">
      <div className="panel">
        <div className="cal-head">
          <div>
            <h3>{title}</h3>
            <span className="sub">daily completion heatmap</span>
          </div>
          <div className="cal-nav">
            <button onClick={() => shift(-1)} aria-label="Previous month">
              ‹
            </button>
            <button
              className="cal-today-btn"
              onClick={goToday}
              disabled={isCurrentMonth}
            >
              Today
            </button>
            <button onClick={() => shift(1)} aria-label="Next month">
              ›
            </button>
          </div>
        </div>

        <div className="cal-stats">
          <div className="cal-stat">
            <div
              className="cs-v mono"
              style={{ color: stats.tracked ? "var(--accent)" : "var(--dim)" }}
            >
              {stats.avg}%
            </div>
            <div className="cs-l">Avg completion</div>
          </div>
          <div className="cal-stat">
            <div className="cs-v mono">{stats.tracked}</div>
            <div className="cs-l">Days tracked</div>
          </div>
          <div className="cal-stat">
            <div
              className="cs-v mono"
              style={{ color: stats.best ? "var(--accent)" : "var(--dim)" }}
            >
              {stats.best ? `${stats.best.pct}%` : "—"}
            </div>
            <div className="cs-l">
              Best day{stats.best ? ` · ${new Date(year, month, stats.best.day).toLocaleDateString("default", { month: "short", day: "numeric" })}` : ""}
            </div>
          </div>
        </div>

        <div className="cal-grid-modern">
          {DOW.map((d) => (
            <div className="cal-dow" key={d}>
              {d}
            </div>
          ))}
          {cells.map((c, i) =>
            c === null ? (
              <div key={`pad-${i}`} />
            ) : (
              <button
                key={c.key}
                className={`cal-cell${c.isToday ? " today" : ""}${c.history ? " has-data" : ""}${c.isFuture ? " future" : ""}${selectedKey === c.key ? " selected" : ""}`}
                style={cellStyle(c)}
                onClick={() =>
                  c.history && setSelectedKey(selectedKey === c.key ? null : c.key)
                }
                disabled={!c.history}
                aria-label={`${c.day}${c.history ? `, ${c.history.pct}% complete` : ""}`}
              >
                <span className="cc-day">{c.day}</span>
                {c.history && <span className="cc-pct mono">{c.history.pct}%</span>}
              </button>
            )
          )}
        </div>

        <div className="cal-legend">
          <span className="cl-lab">Less</span>
          {LEGEND_STEPS.map((a) => (
            <span
              key={a}
              className="cl-swatch"
              style={{ background: `color-mix(in srgb, var(--accent) ${a}%, transparent)` }}
            />
          ))}
          <span className="cl-lab">More</span>
        </div>
      </div>

      {selected && selected.history && (
        <div className="panel cal-detail">
          <div className="cal-detail-head">
            <div>
              <h3>
                {new Date(year, month, selected.day).toLocaleDateString("default", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <span className="sub">
                {selected.history.done} of {selected.history.total} tasks completed
              </span>
            </div>
            <div className="cal-detail-pct mono" style={{ color: "var(--accent)" }}>
              {selected.history.pct}%
            </div>
          </div>
          <div className="yday-grid">
            {Object.entries(selected.history.sections).map(([name, p]) => (
              <div className="yday-card" key={name}>
                <div className="yc-head">
                  <span className="yc-name">{name}</span>
                  <span className="yc-pct mono" style={{ color: "var(--accent)" }}>
                    {p}%
                  </span>
                </div>
                <div className="yc-bar">
                  <span
                    style={{
                      width: `${p}%`,
                      background: `color-mix(in srgb, var(--accent) ${Math.round(35 + p * 0.6)}%, var(--steel))`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
