"use client";

import { useEffect, useState } from "react";
import { momentumMessage, pctColor } from "@/lib/data";
import { useCountUp } from "@/lib/useCountUp";

type MoView = "bar" | "ring";

const GAUGE_R = 52;
const GAUGE_C = 2 * Math.PI * GAUGE_R;

export default function MomentumBanner({
  pct,
  done,
  left,
  total,
  streak,
  mounted,
}: {
  pct: number;
  done: number;
  left: number;
  total: number;
  streak: number;
  mounted: boolean;
}) {
  const shown = useCountUp(pct, mounted);
  const { title, msg } = momentumMessage(pct, done, left, total);
  const [view, setView] = useState<MoView>("bar");

  // Restore the saved bar/ring preference on the client (intentional mount sync).
  useEffect(() => {
    try {
      const saved = localStorage.getItem("momentum-view");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "ring" || saved === "bar") setView(saved);
    } catch {}
  }, []);

  function pick(v: MoView) {
    setView(v);
    try {
      localStorage.setItem("momentum-view", v);
    } catch {}
  }

  return (
    <div className="momentum reveal">
      <div className="mo-toggle" role="group" aria-label="Momentum display">
        <button
          className={`mo-tog${view === "bar" ? " on" : ""}`}
          onClick={() => pick("bar")}
          title="Bar view"
          aria-label="Bar view"
        >
          ▬
        </button>
        <button
          className={`mo-tog${view === "ring" ? " on" : ""}`}
          onClick={() => pick("ring")}
          title="Ring view"
          aria-label="Ring view"
        >
          ◕
        </button>
      </div>

      <div className="mo-row">
        {view === "bar" ? (
          <>
            <div className="mo-big mono">{shown}%</div>
            <div className="mo-mid">
              <div className="mo-title">{title}</div>
              <div className="mo-msg">{msg}</div>
              <div className="mo-track">
                <div className="mo-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mo-gauge">
              <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
                <circle
                  cx="65"
                  cy="65"
                  r={GAUGE_R}
                  fill="none"
                  stroke="var(--track)"
                  strokeWidth="12"
                />
                <circle
                  cx="65"
                  cy="65"
                  r={GAUGE_R}
                  fill="none"
                  stroke={pctColor(pct)}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={GAUGE_C}
                  strokeDashoffset={GAUGE_C - (pct / 100) * GAUGE_C}
                  style={{
                    transition:
                      "stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1), stroke .3s",
                  }}
                />
              </svg>
              <div className="mo-gauge-center">
                <div className="mo-gauge-pct mono">{shown}%</div>
              </div>
            </div>
            <div className="mo-mid">
              <div className="mo-title">{title}</div>
              <div className="mo-msg">{msg}</div>
            </div>
          </>
        )}

        <div className="mo-side">
          <div className="mo-streak mono">🔥{mounted ? streak : 0}</div>
          <div className="mo-streak-l">DAY STREAK</div>
        </div>
      </div>
    </div>
  );
}
