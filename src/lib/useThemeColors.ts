"use client";

import { useEffect, useState } from "react";

export type ThemeColors = {
  accent: string;
  steel: string;
  dim: string;
  track: string;
  green: string;
  amber: string;
  red: string;
};

const FALLBACK: ThemeColors = {
  accent: "#3B82F6",
  steel: "#64748B",
  dim: "#8A9099",
  track: "rgba(255,255,255,.05)",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
};

/**
 * Reads the live theme CSS variables as concrete colors (Recharts needs real
 * colors, not `var(--x)`), and re-reads them when the theme/accent changes.
 */
export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>(FALLBACK);

  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      const get = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb;
      setColors({
        accent: get("--accent", FALLBACK.accent),
        steel: get("--steel", FALLBACK.steel),
        dim: get("--dim", FALLBACK.dim),
        track: get("--track", FALLBACK.track),
        green: get("--green", FALLBACK.green),
        amber: get("--amber", FALLBACK.amber),
        red: get("--red", FALLBACK.red),
      });
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-accent", "data-theme"],
    });
    return () => obs.disconnect();
  }, []);

  return colors;
}
