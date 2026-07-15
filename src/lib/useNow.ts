"use client";

import { useEffect, useState } from "react";

/** Ticks `now` on an interval so time-dependent UI (overdue flags) stays current. */
export function useNow(intervalMs = 60000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
