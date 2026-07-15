"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RANGE_LABEL, buildReport, pctColor } from "@/lib/data";
import type { RangeKey } from "@/lib/data";
import type { DayHistory } from "@/lib/types";
import { useCountUp } from "@/lib/useCountUp";
import { useThemeColors } from "@/lib/useThemeColors";

const RANGES: { r: RangeKey; label: string }[] = [
  { r: "half", label: "Half-week" },
  { r: "week", label: "Weekly" },
  { r: "month", label: "Monthly" },
];

const GAUGE_CIRC = 515; // 2πr, r = 82

export default function ReportsView({
  history,
  sectionColors = {},
}: {
  history: Record<string, DayHistory>;
  sectionColors?: Record<string, string>;
}) {
  const [range, setRange] = useState<RangeKey>("week");
  const colors = useThemeColors();
  const report = buildReport(history, range);
  const shownPct = useCountUp(report.overall, true);
  const gaugeColorVar = pctColor(report.overall);

  return (
    <section className="view">
      <div className="panel-head" style={{ marginBottom: 18 }}>
        <div>
          <h3 style={{ fontSize: 18 }}>Progress report</h3>
          <span className="sub">{RANGE_LABEL[range]}</span>
        </div>
        <div className="range">
          {RANGES.map((x) => (
            <button
              key={x.r}
              className={range === x.r ? "on" : ""}
              onClick={() => setRange(x.r)}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rep-top">
        <div className="panel gauge-panel" style={{ margin: 0 }}>
          <div className="gauge-wrap">
            <svg width="190" height="190" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="95" cy="95" r="82" fill="none" stroke="var(--track)" strokeWidth="14" />
              <circle
                cx="95"
                cy="95"
                r="82"
                fill="none"
                stroke={gaugeColorVar}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={GAUGE_CIRC}
                strokeDashoffset={GAUGE_CIRC - (report.overall / 100) * GAUGE_CIRC}
                style={{
                  transition:
                    "stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1), stroke .3s",
                }}
              />
            </svg>
            <div className="gauge-center">
              <div className="gauge-pct mono">{shownPct}%</div>
              <div className="gauge-label">COMPLETED</div>
            </div>
          </div>
        </div>

        <div className="rep-stats">
          <div className="rstat">
            <div className="rv mono">{report.done}</div>
            <div className="rl">Tasks completed</div>
          </div>
          <div className="rstat">
            <div className="rv mono">{report.total}</div>
            <div className="rl">Tasks planned</div>
          </div>
          <div className="rstat">
            <div className="rv mono">{report.best}</div>
            <div className="rl">Best day</div>
          </div>
          <div className="rstat">
            <div className="rv mono">{report.avg}%</div>
            <div className="rl">Daily average</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Completion over time</h3>
          <span className="sub">daily %</span>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={report.series} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="repFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.accent} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={colors.track} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: colors.dim, fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={16}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: colors.dim, fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                width={40}
              />
              <Tooltip
                cursor={{ stroke: colors.dim, strokeDasharray: "3 3" }}
                contentStyle={{
                  background: "var(--card2)",
                  border: "1px solid var(--brd2)",
                  borderRadius: 10,
                  color: "var(--text)",
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--dim)" }}
                formatter={(value) => [`${value}% completed`, ""]}
              />
              <Area
                type="monotone"
                dataKey="pct"
                stroke={colors.accent}
                strokeWidth={2.5}
                fill="url(#repFill)"
                dot={{ r: 3, fill: colors.accent, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>By section</h3>
          <span className="sub">% completed in range</span>
        </div>
        {report.sections.length === 0 ? (
          <div className="todo-empty" style={{ padding: "24px" }}>
            No section data in this range yet.
          </div>
        ) : (
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={report.sections.map((s) => ({
                  name: s.name,
                  pct: s.pct,
                  fill: sectionColors[s.name] || colors.accent,
                }))}
                margin={{ top: 22, right: 8, left: -16, bottom: 4 }}
                barCategoryGap="24%"
              >
                <CartesianGrid stroke={colors.track} vertical={false} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={{ fill: colors.dim, fontSize: 10.5 }}
                  tickLine={false}
                  axisLine={false}
                  height={40}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: colors.dim, fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: colors.track }}
                  contentStyle={{
                    background: "var(--card2)",
                    border: "1px solid var(--brd2)",
                    borderRadius: 10,
                    color: "var(--text)",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--dim)" }}
                  formatter={(value) => [`${value}% completed`, ""]}
                />
                <Bar dataKey="pct" radius={[5, 5, 0, 0]} maxBarSize={64} isAnimationActive={false}>
                  <LabelList
                    dataKey="pct"
                    position="top"
                    formatter={(v: React.ReactNode) => `${v}%`}
                    fill={colors.dim}
                    fontSize={11}
                    fontFamily="var(--font-jetbrains)"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
