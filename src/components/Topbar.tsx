"use client";

import { useEffect, useState } from "react";

const ACCENTS: { a: string; color: string; title: string }[] = [
  { a: "", color: "#3B82F6", title: "Steel blue" },
  { a: "slate", color: "#64748B", title: "Slate" },
  { a: "teal", color: "#14B8A6", title: "Teal" },
  { a: "orange", color: "#F97316", title: "Orange" },
  { a: "crimson", color: "#DC2626", title: "Crimson" },
  { a: "indigo", color: "#6366F1", title: "Indigo" },
];

export default function Topbar({
  heading,
  sub,
}: {
  heading: React.ReactNode;
  sub: string;
}) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [accent, setAccent] = useState("");
  const [dateLabel, setDateLabel] = useState("");

  // On mount, sync React state to what the no-flash script already applied to <html>,
  // and render the client's local date. Intentional external-system sync on mount.
  useEffect(() => {
    const t = (document.documentElement.getAttribute("data-theme") as "dark" | "light") || "dark";
    const a = document.documentElement.getAttribute("data-accent") || "";
    /* eslint-disable react-hooks/set-state-in-effect */
    setTheme(t);
    setAccent(a);
    setDateLabel(
      new Date().toLocaleDateString("default", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    );
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("momentum-theme", next);
    } catch {}
  }

  function pickAccent(a: string) {
    setAccent(a);
    if (a) document.documentElement.setAttribute("data-accent", a);
    else document.documentElement.removeAttribute("data-accent");
    try {
      localStorage.setItem("momentum-accent", a);
    } catch {}
  }

  return (
    <div className="topbar">
      <div>
        <div className="hello">{heading}</div>
        <div className="sub">{sub}</div>
      </div>
      <div className="top-right">
        <div className="accent-row">
          {ACCENTS.map((ac) => (
            <button
              key={ac.a || "default"}
              className={`acc${accent === ac.a ? " on" : ""}`}
              style={{ background: ac.color }}
              title={ac.title}
              onClick={() => pickAccent(ac.a)}
              aria-label={`Accent ${ac.title}`}
            />
          ))}
        </div>
        <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <div className="top-date mono">{dateLabel}</div>
      </div>
    </div>
  );
}
