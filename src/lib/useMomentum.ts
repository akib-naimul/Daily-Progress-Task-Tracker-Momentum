"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  EMOJIS,
  PALETTE,
  defaultChecklist,
  defaultSections,
  loadState,
  persistState,
  seedHistory,
  todayKey,
  todaySnapshot,
} from "./data";
import type { ChecklistItem, DayHistory, Section } from "./types";

export function useMomentum() {
  // Seed with deterministic defaults so first paint (server + client) shows content;
  // localStorage overrides and the random history seed are applied on mount below.
  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [history, setHistory] = useState<Record<string, DayHistory>>({});
  const [mounted, setMounted] = useState(false);
  const sidRef = useRef(4);
  const cidRef = useRef(6);
  const checklistDateRef = useRef(todayKey());

  // Load persisted state on the client only (localStorage isn't available on the server).
  useEffect(() => {
    const state = loadState(seedHistory());
    sidRef.current = state.sid;
    cidRef.current = state.cid;
    checklistDateRef.current = state.checklistDate;
    /* eslint-disable react-hooks/set-state-in-effect */
    setSections(state.sections);
    setChecklist(state.checklist);
    setHistory(state.history);
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Whenever tasks or checklist change (post-mount), snapshot today and persist everything.
  useEffect(() => {
    if (!mounted) return;
    setHistory((prev) => {
      const nextHistory = { ...prev, [todayKey()]: todaySnapshot(sections, checklist) };
      persistState({
        sections,
        checklist,
        checklistDate: checklistDateRef.current,
        history: nextHistory,
        sid: sidRef.current,
        cid: cidRef.current,
      });
      return nextHistory;
    });
  }, [sections, checklist, mounted]);

  const toggle = useCallback((id: number, index: number) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              tasks: s.tasks.map((t, i) => {
                if (i !== index) return t;
                const done = !t.done;
                // Completing a task auto-pauses its running stopwatch.
                if (done && t.runningSince) {
                  return {
                    ...t,
                    done,
                    spentMs: (t.spentMs ?? 0) + Math.max(0, Date.now() - t.runningSince),
                    runningSince: undefined,
                  };
                }
                return { ...t, done };
              }),
            }
          : s
      )
    );
  }, []);

  const addTask = useCallback((id: number, value: string) => {
    const v = value.trim();
    if (!v) return;
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, tasks: [...s.tasks, { t: v, done: false }] } : s
      )
    );
  }, []);

  const delTask = useCallback((id: number, index: number) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, tasks: s.tasks.filter((_, i) => i !== index) }
          : s
      )
    );
  }, []);

  /** Set (or clear) a task's scheduled window. Pass undefined to clear a bound. */
  const setTaskTime = useCallback(
    (id: number, index: number, start?: string, end?: string) => {
      setSections((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                tasks: s.tasks.map((t, i) =>
                  i === index
                    ? { ...t, start: start || undefined, end: end || undefined }
                    : t
                ),
              }
            : s
        )
      );
    },
    []
  );

  // ---- per-task stopwatch ----

  const startTimer = useCallback((id: number, index: number) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              tasks: s.tasks.map((t, i) =>
                i === index && !t.runningSince ? { ...t, runningSince: Date.now() } : t
              ),
            }
          : s
      )
    );
  }, []);

  const stopTimer = useCallback((id: number, index: number) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              tasks: s.tasks.map((t, i) =>
                i === index && t.runningSince
                  ? {
                      ...t,
                      spentMs: (t.spentMs ?? 0) + Math.max(0, Date.now() - t.runningSince),
                      runningSince: undefined,
                    }
                  : t
              ),
            }
          : s
      )
    );
  }, []);

  const resetTimer = useCallback((id: number, index: number) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              tasks: s.tasks.map((t, i) =>
                i === index ? { ...t, spentMs: 0, runningSince: undefined } : t
              ),
            }
          : s
      )
    );
  }, []);

  const addSection = useCallback(() => {
    setSections((prev) => {
      const id = sidRef.current++;
      return [
        ...prev,
        {
          id,
          name: "New section",
          emoji: EMOJIS[prev.length % EMOJIS.length],
          color: PALETTE[prev.length % PALETTE.length],
          tasks: [],
        },
      ];
    });
  }, []);

  const renameSection = useCallback((id: number, name: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: name || "Untitled" } : s))
    );
  }, []);

  const delSection = useCallback((id: number) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ---- daily checklist ----

  const toggleChecklist = useCallback((id: number) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    );
  }, []);

  const addChecklistItem = useCallback((value: string) => {
    const v = value.trim();
    if (!v) return;
    setChecklist((prev) => [...prev, { id: cidRef.current++, t: v, done: false }]);
  }, []);

  const delChecklistItem = useCallback((id: number) => {
    setChecklist((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    sections,
    checklist,
    history,
    mounted,
    toggle,
    addTask,
    delTask,
    setTaskTime,
    startTimer,
    stopTimer,
    resetTimer,
    addSection,
    renameSection,
    delSection,
    toggleChecklist,
    addChecklistItem,
    delChecklistItem,
  };
}
