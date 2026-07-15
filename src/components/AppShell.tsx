"use client";

import { useState } from "react";
import { CHECKLIST_LABEL, overall } from "@/lib/data";
import { useMomentum } from "@/lib/useMomentum";
import BottomNav from "./BottomNav";
import CalendarView from "./CalendarView";
import IncompleteView from "./IncompleteView";
import MotivationWatcher from "./MotivationWatcher";
import ReportsView from "./ReportsView";
import Sidebar from "./Sidebar";
import { ToastProvider } from "./Toast";
import Topbar from "./Topbar";
import TodayView from "./TodayView";
import YesterdayView from "./YesterdayView";

export type ViewKey = "today" | "incomplete" | "yesterday" | "reports" | "calendar";

const HEADINGS: Record<ViewKey, { heading: React.ReactNode; sub: string }> = {
  today: {
    heading: (
      <>
        Let&apos;s finish strong, <span className="grad">Naimul</span>
      </>
    ),
    sub: "Push to 100%.",
  },
  incomplete: { heading: "Your open tasks", sub: "Clear the list." },
  yesterday: { heading: "Yesterday in review", sub: "How the day finished." },
  reports: { heading: "Progress reports", sub: "Your trends over time." },
  calendar: { heading: "Calendar", sub: "Deadlines & activity." },
};

export default function AppShell() {
  const [view, setView] = useState<ViewKey>("today");
  const momentum = useMomentum();
  const { pct, left } = overall(momentum.sections, momentum.checklist);
  const openCount = momentum.mounted ? left : 0;

  const sectionColors: Record<string, string> = { [CHECKLIST_LABEL]: "#6366F1" };
  momentum.sections.forEach((s) => {
    sectionColors[s.name] = s.color;
  });

  let head = HEADINGS[view];
  if (view === "today" && momentum.mounted) {
    head = {
      heading: HEADINGS.today.heading,
      sub: pct >= 100 ? "Perfect day. 🎯" : `Push to 100% — ${left} left.`,
    };
  }

  return (
    <ToastProvider>
      <div className="mesh">
        <div className="blob b1" />
        <div className="blob b2" />
      </div>

      <MotivationWatcher
        sections={momentum.sections}
        checklist={momentum.checklist}
        pct={pct}
        mounted={momentum.mounted}
      />

      <div className="app">
        <Sidebar view={view} setView={setView} openCount={openCount} />
        <main className="main">
          <Topbar heading={head.heading} sub={head.sub} />
          <div className="content">
            {view === "today" && (
              <TodayView
                sections={momentum.sections}
                checklist={momentum.checklist}
                history={momentum.history}
                mounted={momentum.mounted}
                onToggle={momentum.toggle}
                onAddTask={momentum.addTask}
                onDelTask={momentum.delTask}
                onSetTime={momentum.setTaskTime}
                onStartTimer={momentum.startTimer}
                onStopTimer={momentum.stopTimer}
                onResetTimer={momentum.resetTimer}
                onAddSection={momentum.addSection}
                onRename={momentum.renameSection}
                onDelSection={momentum.delSection}
                onToggleChecklist={momentum.toggleChecklist}
                onAddChecklistItem={momentum.addChecklistItem}
                onDelChecklistItem={momentum.delChecklistItem}
              />
            )}
            {view === "incomplete" && (
              <IncompleteView
                sections={momentum.sections}
                checklist={momentum.checklist}
                onToggle={momentum.toggle}
                onToggleChecklist={momentum.toggleChecklist}
              />
            )}
            {view === "yesterday" && <YesterdayView history={momentum.history} />}
            {view === "reports" && (
              <ReportsView history={momentum.history} sectionColors={sectionColors} />
            )}
            {view === "calendar" && <CalendarView history={momentum.history} />}
          </div>
        </main>
      </div>

      <BottomNav view={view} setView={setView} openCount={openCount} />
    </ToastProvider>
  );
}
