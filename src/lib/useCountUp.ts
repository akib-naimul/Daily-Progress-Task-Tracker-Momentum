"use client";

import { useEffect, useRef, useState } from "react";

/** Animates a displayed integer toward `target`, matching the prototype's count-up. */
export function useCountUp(target: number, enabled = true): number {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);

    if (!enabled) {
      valueRef.current = target;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- jump straight to target when animation is disabled
      setValue(target);
      return;
    }

    let c = valueRef.current;
    const dir = target > c ? 1 : -1;
    const step = Math.max(1, Math.round(Math.abs(target - c) / 20));
    timer.current = setInterval(() => {
      c += dir * step;
      if ((dir > 0 && c >= target) || (dir < 0 && c <= target)) {
        c = target;
        if (timer.current) clearInterval(timer.current);
      }
      valueRef.current = c;
      setValue(c);
    }, 22);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [target, enabled]);

  return value;
}
