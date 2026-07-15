"use client";

import { overall, streakCount } from "@/lib/data";
import type { ChecklistItem, DayHistory, Section } from "@/lib/types";
import { useNow } from "@/lib/useNow";
import DailyChecklistCard from "./DailyChecklistCard";
import MomentumBanner from "./MomentumBanner";
import SectionCard from "./SectionCard";
import TodayVsYesterday from "./TodayVsYesterday";

export default function TodayView({
  sections,
  checklist,
  history,
  mounted,
  onToggle,
  onAddTask,
  onDelTask,
  onSetTime,
  onStartTimer,
  onStopTimer,
  onResetTimer,
  onAddSection,
  onRename,
  onDelSection,
  onToggleChecklist,
  onAddChecklistItem,
  onDelChecklistItem,
}: {
  sections: Section[];
  checklist: ChecklistItem[];
  history: Record<string, DayHistory>;
  mounted: boolean;
  onToggle: (id: number, i: number) => void;
  onAddTask: (id: number, value: string) => void;
  onDelTask: (id: number, i: number) => void;
  onSetTime: (id: number, i: number, start?: string, end?: string) => void;
  onStartTimer: (id: number, i: number) => void;
  onStopTimer: (id: number, i: number) => void;
  onResetTimer: (id: number, i: number) => void;
  onAddSection: () => void;
  onRename: (id: number, name: string) => void;
  onDelSection: (id: number) => void;
  onToggleChecklist: (id: number) => void;
  onAddChecklistItem: (value: string) => void;
  onDelChecklistItem: (id: number) => void;
}) {
  const now = useNow();
  const { pct, done, left, total } = overall(sections, checklist);
  const streak = streakCount(history);

  return (
    <section className="view">
      <MomentumBanner
        pct={pct}
        done={done}
        left={left}
        total={total}
        streak={streak}
        mounted={mounted}
      />

      {mounted && (
        <TodayVsYesterday
          todayPct={pct}
          history={history}
          sections={sections}
          checklist={checklist}
        />
      )}

      <DailyChecklistCard
        items={checklist}
        onToggle={onToggleChecklist}
        onAdd={onAddChecklistItem}
        onDelete={onDelChecklistItem}
      />

      <div className="board-head reveal" style={{ animationDelay: ".1s" }}>
        <div>
          <h3>Your sections</h3>
          <div className="hint">Each area tracks its own completion.</div>
        </div>
        <button className="addsec" onClick={onAddSection}>
          ＋ New section
        </button>
      </div>

      <div className="sections">
        {sections.map((s, idx) => (
          <SectionCard
            key={s.id}
            section={s}
            index={idx}
            now={now}
            onToggle={onToggle}
            onAddTask={onAddTask}
            onDelTask={onDelTask}
            onSetTime={onSetTime}
            onStartTimer={onStartTimer}
            onStopTimer={onStopTimer}
            onResetTimer={onResetTimer}
            onRename={onRename}
            onDelSection={onDelSection}
          />
        ))}
        <div className="add-card" onClick={onAddSection}>
          <span className="plus">＋</span>
          <span>New section</span>
        </div>
      </div>
    </section>
  );
}
