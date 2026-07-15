"use client";

import { useEffect, useRef } from "react";
import { checklistPct, sectionPct } from "@/lib/data";
import type { ChecklistItem, Section } from "@/lib/types";
import { useToast } from "./Toast";

const SECTION_MSGS = [
  "Nailed it — {n} complete! 🎯",
  "{n} done. Clean sweep! 💪",
  "Section cleared: {n}! 🙌",
  "{n} at 100% — excellent! ⭐",
];
const CHECK_MSGS = [
  "Checklist cleared! ✅",
  "All daily habits done! 🌟",
  "Routine complete — nice discipline! 💯",
];
const HALF_MSGS = [
  "Halfway there — keep going! 💪",
  "50% done, momentum building! 🚀",
  "Over halfway. Nice work! 👏",
];
const THREE_MSGS = [
  "75% — so close now! ⚡",
  "Almost there, push through! 🏁",
  "Three-quarters done! 🔥",
];
const PERFECT_MSGS = [
  "Perfect day — everything done! 🔥",
  "Flawless. 100% complete! 🏆",
  "You crushed it all today! ⚡",
  "Immaculate — 100%! 🎉",
];

const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

/** Watches completion state and pops an encouraging toast on each new win. */
export default function MotivationWatcher({
  sections,
  checklist,
  pct,
  mounted,
}: {
  sections: Section[];
  checklist: ChecklistItem[];
  pct: number;
  mounted: boolean;
}) {
  const { notify } = useToast();
  const ready = useRef(false);
  const doneSections = useRef<Set<number>>(new Set());
  const checklistDone = useRef(false);
  const prevPct = useRef(0);

  useEffect(() => {
    if (!mounted) return;

    const nowDone = new Set(
      sections.filter((s) => s.tasks.length > 0 && sectionPct(s) >= 100).map((s) => s.id)
    );
    const clDone = checklist.length > 0 && checklistPct(checklist) >= 100;

    // First run after mount: capture current state without celebrating existing completions.
    if (!ready.current) {
      doneSections.current = nowDone;
      checklistDone.current = clDone;
      prevPct.current = pct;
      ready.current = true;
      return;
    }

    // A section just hit 100%.
    nowDone.forEach((id) => {
      if (!doneSections.current.has(id)) {
        const s = sections.find((x) => x.id === id);
        if (s) notify(pick(SECTION_MSGS).replace("{n}", s.name));
      }
    });
    doneSections.current = nowDone;

    // Daily checklist just cleared.
    if (clDone && !checklistDone.current) notify(pick(CHECK_MSGS));
    checklistDone.current = clDone;

    // Overall milestones, only on an upward crossing.
    const prev = prevPct.current;
    if (prev < 100 && pct >= 100) notify(pick(PERFECT_MSGS));
    else if (prev < 75 && pct >= 75) notify(pick(THREE_MSGS));
    else if (prev < 50 && pct >= 50) notify(pick(HALF_MSGS));
    prevPct.current = pct;
  }, [sections, checklist, pct, mounted, notify]);

  return null;
}
