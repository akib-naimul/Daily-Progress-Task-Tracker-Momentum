"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHECKLIST_LABEL, checklistPct, dateKey, sectionPct } from "@/lib/data";
import type { ChecklistItem, DayHistory, Section } from "@/lib/types";
import { useThemeColors } from "@/lib/useThemeColors";

export default function TodayVsYesterday({
  todayPct,
  history,
  sections,
  checklist,
}: {
  todayPct: number;
  history: Record<string, DayHistory>;
  sections: Section[];
  checklist: ChecklistItem[];
}) {
  const colors = useThemeColors();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yh = history[dateKey(y)];
  const yesterdayPct = yh ? yh.pct : null;

  const delta = yesterdayPct === null ? null : todayPct - yesterdayPct;
  const dir = delta === null ? "flat" : delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const dirColor =
    dir === "up" ? "var(--green)" : dir === "down" ? "var(--red)" : "var(--dim)";
  const arrow = dir === "up" ? "▲" : dir === "down" ? "▼" : "＝";

  let message: string;
  if (delta === null) message = "No data for yesterday yet — today sets the baseline.";
  else if (delta > 0) message = `You're ${delta}% ahead of yesterday. Keep the streak going.`;
  else if (delta < 0) message = `${Math.abs(delta)}% behind yesterday — still time to catch up.`;
  else message = "Dead even with yesterday. Edge ahead.";

  // Overall + per-section (+ checklist) comparison rows.
  const data: { name: string; Yesterday: number; Today: number }[] = [
    { name: "Overall", Yesterday: yesterdayPct ?? 0, Today: todayPct },
    ...sections.map((s) => ({
      name: s.name,
      Yesterday: yh?.sections?.[s.name] ?? 0,
      Today: sectionPct(s),
    })),
  ];
  if (checklist.length) {
    data.push({
      name: CHECKLIST_LABEL,
      Yesterday: yh?.sections?.[CHECKLIST_LABEL] ?? 0,
      Today: checklistPct(checklist),
    });
  }

  const chartHeight = 280;

  return (
    <div className="compare-card reveal" style={{ animationDelay: ".05s" }}>
      <div className="cmp-top">
        <div className="cmp-delta" style={{ color: dirColor }}>
          <div className="cmp-arrow">{arrow}</div>
          <div>
            <div className="cmp-num mono">
              {delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta}%`}
            </div>
            <div className="cmp-vs">vs yesterday</div>
          </div>
        </div>
        <div className="cmp-msg">
          <div className="cmp-title">Today vs Yesterday</div>
          {message}
        </div>
      </div>

      <div className="cmp-chart" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 4 }}
            barCategoryGap="22%"
            barGap={2}
          >
            <CartesianGrid stroke={colors.track} vertical={false} />
            <XAxis
              dataKey="name"
              interval={0}
              tick={{ fill: colors.dim, fontSize: 10 }}
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
              formatter={(value, name) => [`${value}%`, name]}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 6 }}
              iconType="circle"
              iconSize={9}
            />
            <Bar
              dataKey="Yesterday"
              fill={colors.steel}
              radius={[4, 4, 0, 0]}
              maxBarSize={34}
              isAnimationActive={false}
            />
            <Bar
              dataKey="Today"
              fill={colors.accent}
              radius={[4, 4, 0, 0]}
              maxBarSize={34}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
