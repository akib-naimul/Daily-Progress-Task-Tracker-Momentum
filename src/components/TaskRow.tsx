"use client";

import { useEffect, useState } from "react";
import { fmtDuration, isOverdue, taskElapsed, windowLabel } from "@/lib/data";
import type { Task } from "@/lib/types";

export default function TaskRow({
  task,
  sectionId,
  index,
  color,
  now,
  onToggle,
  onDelTask,
  onSetTime,
  onStartTimer,
  onStopTimer,
  onResetTimer,
}: {
  task: Task;
  sectionId: number;
  index: number;
  color: string;
  now: Date;
  onToggle: (id: number, i: number) => void;
  onDelTask: (id: number, i: number) => void;
  onSetTime: (id: number, i: number, start?: string, end?: string) => void;
  onStartTimer: (id: number, i: number) => void;
  onStopTimer: (id: number, i: number) => void;
  onResetTimer: (id: number, i: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const overdue = isOverdue(task, now);
  const hasWindow = Boolean(task.start || task.end);

  const running = task.runningSince != null;
  const hasTime = running || (task.spentMs ?? 0) > 0;

  // While the stopwatch runs, refresh the current time each second so the chip ticks live.
  // Date.now() is read only inside effect/interval callbacks to keep render pure.
  const [nowMs, setNowMs] = useState(0);
  useEffect(() => {
    if (!running) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNowMs(Date.now());
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = running ? taskElapsed(task, nowMs) : task.spentMs ?? 0;

  return (
    <div className={`task${overdue ? " overdue" : ""}`}>
      <div className="task-main">
        <button
          className={`cb${task.done ? " done" : ""}`}
          style={
            task.done
              ? { background: color, borderColor: color, boxShadow: `0 0 12px ${color}` }
              : undefined
          }
          onClick={() => onToggle(sectionId, index)}
          aria-label={task.done ? "Mark incomplete" : "Mark complete"}
        >
          {task.done ? "✓" : ""}
        </button>

        <span className={`tt${task.done ? " done" : ""}`}>{task.t}</span>

        {hasTime ? (
          <span className="task-timer-wrap">
            <button
              className={`task-timer ${running ? "running" : "paused"}`}
              onClick={() =>
                running ? onStopTimer(sectionId, index) : onStartTimer(sectionId, index)
              }
              title={running ? "Pause stopwatch" : "Resume stopwatch"}
            >
              {running ? (
                <span className="tt-dot" aria-hidden />
              ) : (
                <span className="tt-play" aria-hidden>
                  ▶
                </span>
              )}
              <span className="tt-time mono">{fmtDuration(elapsed)}</span>
              {running && (
                <span className="tt-pause" aria-hidden>
                  ❚❚
                </span>
              )}
            </button>
            <button
              className="task-icon task-reset"
              onClick={() => onResetTimer(sectionId, index)}
              title="Reset stopwatch"
              aria-label="Reset stopwatch"
            >
              ↺
            </button>
          </span>
        ) : task.done ? null : (
          <button
            className="task-start"
            onClick={() => onStartTimer(sectionId, index)}
            title="Start stopwatch"
            aria-label="Start stopwatch"
          >
            <span className="ts-ico" aria-hidden>
              ⏱
            </span>
            <span className="ts-label">Timer</span>
          </button>
        )}

        {hasWindow && (
          <button
            className={`task-time${overdue ? " overdue" : ""}`}
            onClick={() => setEditing((v) => !v)}
            title="Edit scheduled time"
          >
            🕑 {windowLabel(task)}
            {overdue && <span className="ovd">overdue</span>}
          </button>
        )}

        <button
          className="task-icon"
          onClick={() => setEditing((v) => !v)}
          title={hasWindow ? "Edit time window" : "Set a time window"}
          aria-label="Set task time window"
        >
          🕑
        </button>
        <button
          className="task-del"
          onClick={() => onDelTask(sectionId, index)}
          aria-label="Delete task"
        >
          ✕
        </button>
      </div>

      {editing && (
        <div className="task-time-edit">
          <label>
            Start
            <input
              type="time"
              value={task.start ?? ""}
              onChange={(e) => onSetTime(sectionId, index, e.target.value, task.end)}
            />
          </label>
          <span className="tte-dash">–</span>
          <label>
            End
            <input
              type="time"
              value={task.end ?? ""}
              onChange={(e) => onSetTime(sectionId, index, task.start, e.target.value)}
            />
          </label>
          {hasWindow && (
            <button
              className="tte-clear"
              onClick={() => {
                onSetTime(sectionId, index, undefined, undefined);
                setEditing(false);
              }}
            >
              Clear
            </button>
          )}
          <button className="tte-done" onClick={() => setEditing(false)}>
            Done
          </button>
        </div>
      )}
    </div>
  );
}
